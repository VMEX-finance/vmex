// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { AaveProtocolDataProvider } from "../../misc/AaveProtocolDataProvider.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { IERC20 } from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import { IERC20Detailed } from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import { IAToken } from "../../interfaces/IAToken.sol";
import { DataTypes } from "../../protocol/libraries/types/DataTypes.sol";
import { UserConfiguration } from "../../protocol/libraries/configuration/UserConfiguration.sol";
import { ReserveConfiguration } from "../../protocol/libraries/configuration/ReserveConfiguration.sol";
import { AssetMappings } from "../../protocol/lendingpool/AssetMappings.sol";
import { PricingHelpers } from "./PricingHelpers.sol";
import { IPriceOracleGetter } from "../../interfaces/IPriceOracleGetter.sol";
import {PercentageMath} from "../../protocol/libraries/math/PercentageMath.sol";

//import "hardhat/console.sol";
library QueryUserHelpers {
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using UserConfiguration for DataTypes.UserConfigurationMap;
    using PercentageMath for uint256;

    struct SuppliedAssetData {
        address asset;
        uint64 tranche;
        uint256 amount; //in USD
        uint256 amountNative;
        bool isCollateral;
        uint128 apy;
        // uint256 supplyCap;
    }

    struct BorrowedAssetData {
        address asset;
        uint64 tranche;
        uint256 amount; //in USD
        uint256 amountNative;
        uint128 apy;
    }

    struct AvailableBorrowData {
        address asset;
        uint256 amountUSD;
        uint256 amountNative;
    }

    struct UserSummaryData {
        uint256 totalCollateralETH;
        uint256 totalDebtETH;
        uint256 availableBorrowsETH;
        SuppliedAssetData[] suppliedAssetData;
        BorrowedAssetData[] borrowedAssetData;
        // currentLiquidationThreshold, ltv, healthFactor metrics don't make sense
        // for aggregating data across all tranches
    }

    struct UserTrancheData {
        uint256 totalCollateralETH;
        uint256 totalDebtETH;
        uint256 availableBorrowsETH;
        uint256 currentLiquidationThreshold;
        uint256 ltv;
        uint256 healthFactor;
        uint256 avgBorrowFactor;
        SuppliedAssetData[] suppliedAssetData;
        BorrowedAssetData[] borrowedAssetData;
        AvailableBorrowData[] assetBorrowingPower;
    }

    function getUserTrancheData(
        address user,
        uint64 tranche,
        address addressesProvider,
        bool ETHBase, //true if ETH is base, false if USD is base
        address chainlinkConverter
    ) internal returns (UserTrancheData memory userData) {
        ILendingPool lendingPool = ILendingPool(
            ILendingPoolAddressesProvider(addressesProvider).getLendingPool());

        userData = tryGetUserAccountData(lendingPool, user, tranche);

        (userData.suppliedAssetData,
            userData.borrowedAssetData,
            userData.assetBorrowingPower) = getUserAssetData(user, tranche, addressesProvider, userData.availableBorrowsETH, ETHBase, chainlinkConverter);
    }

    function tryGetUserAccountData(
        ILendingPool lendingPool,
        address user,
        uint64 tranche
    ) private returns(UserTrancheData memory userData) {
        try lendingPool.getUserAccountData(user, tranche) returns (uint256 totalCollateralETH,
            uint256 totalDebtETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor,
            uint256 avgBorrowFactor
        ) {
            userData.totalCollateralETH = totalCollateralETH;
            userData.totalDebtETH = totalDebtETH;
            userData.availableBorrowsETH = availableBorrowsETH;
            userData.currentLiquidationThreshold = currentLiquidationThreshold;
            userData.ltv = ltv;
            userData.healthFactor = healthFactor;
            userData.avgBorrowFactor = avgBorrowFactor;
        } catch {
        }
    }

    struct getUserAssetDataVars {
        uint256 s_idx;
        uint256 b_idx;
        DataTypes.ReserveData reserve;
        uint256 currentATokenBalance;
        uint256 currentVariableDebt;
        DataTypes.UserConfigurationMap userConfig;
        SuppliedAssetData[] tempSuppliedAssetData;
        BorrowedAssetData[] tempBorrowedAssetData;
        address[] allAssets;
        AssetMappings a;
        address assetOracle;
    }

    function getUserAssetData(
        address user,
        uint64 tranche,
        address addressesProvider,
        uint256 availableBorrowsETH,
        bool ETHBase, //true if ETH is base, false if USD is base
        address chainlinkConverter
    ) internal returns (SuppliedAssetData[] memory s, BorrowedAssetData[] memory b, AvailableBorrowData[] memory c)
    {
        getUserAssetDataVars memory vars;
        ILendingPool lendingPool = ILendingPool(
            ILendingPoolAddressesProvider(addressesProvider).getLendingPool());



        vars.allAssets = lendingPool.getReservesList(tranche);
        vars.tempSuppliedAssetData = new SuppliedAssetData[](vars.allAssets.length);
        vars.tempBorrowedAssetData = new BorrowedAssetData[](vars.allAssets.length);
        c = new AvailableBorrowData[](vars.allAssets.length);
        vars.s_idx = 0;
        vars.b_idx = 0;

        vars.userConfig = lendingPool.getUserConfiguration(user, tranche);

        for (uint8 i = 0; i < vars.allAssets.length; ++i) {
            vars.reserve = lendingPool.getReserveData(vars.allAssets[i], tranche);

            vars.currentATokenBalance = IERC20(vars.reserve.aTokenAddress).balanceOf(user);
            vars.currentVariableDebt = IERC20(vars.reserve.variableDebtTokenAddress).balanceOf(user);

            vars.a = AssetMappings(ILendingPoolAddressesProvider(addressesProvider).getAssetMappings());
            vars.assetOracle = ILendingPoolAddressesProvider(addressesProvider)
                .getPriceOracle();

            if (vars.currentATokenBalance > 0) {
                // asset is being supplied
                vars.tempSuppliedAssetData[vars.s_idx++] = SuppliedAssetData ({
                    asset: vars.allAssets[i],
                    tranche: tranche,
                    amount: ETHBase ? PricingHelpers.convertAmountToUsd(
                        vars.assetOracle,
                        vars.allAssets[i],
                        vars.currentATokenBalance,
                        vars.a.getDecimals(vars.allAssets[i]),
                        chainlinkConverter
                    )
                    : PricingHelpers.findAmountValue(
                        vars.assetOracle,
                        vars.allAssets[i],
                        vars.currentATokenBalance,
                        vars.a.getDecimals(vars.allAssets[i])
                    ),
                    amountNative: vars.currentATokenBalance,
                    isCollateral: vars.userConfig.isUsingAsCollateral(vars.reserve.id),
                    apy: vars.reserve.currentLiquidityRate
                    // supplyCap: a.getSupplyCap(vars.allAssets[i])
                });
            }

            if (vars.currentVariableDebt > 0) {
                vars.tempBorrowedAssetData[vars.b_idx++] = BorrowedAssetData ({
                    asset: vars.allAssets[i],
                    tranche: tranche,
                    amount: ETHBase ? PricingHelpers.convertAmountToUsd(
                        vars.assetOracle,
                        vars.allAssets[i],
                        vars.currentVariableDebt,
                        vars.a.getDecimals(vars.allAssets[i]),
                        chainlinkConverter
                    )
                    : PricingHelpers.findAmountValue(
                        vars.assetOracle,
                        vars.allAssets[i],
                        vars.currentVariableDebt,
                        vars.a.getDecimals(vars.allAssets[i])
                    ),
                    amountNative: vars.currentVariableDebt,
                    apy: vars.reserve.currentVariableBorrowRate
                });
            }

            c[i] = AvailableBorrowData({
                asset: vars.allAssets[i],
                amountUSD: ETHBase ? PricingHelpers.convertEthToUsd(
                        availableBorrowsETH.percentDiv(vars.a.getBorrowFactor(vars.allAssets[i])),
                        chainlinkConverter
                    )
                    : availableBorrowsETH.percentDiv(vars.a.getBorrowFactor(vars.allAssets[i])),
                amountNative: PricingHelpers.convertEthToNative( //works for USD too
                        vars.assetOracle,
                        vars.allAssets[i],
                        availableBorrowsETH.percentDiv(vars.a.getBorrowFactor(vars.allAssets[i])),
                        vars.a.getDecimals(vars.allAssets[i])
                    )

            });
        }

        // return correctly sized arrays
        s = new SuppliedAssetData[](vars.s_idx);
        b = new BorrowedAssetData[](vars.b_idx);
        for (uint8 i = 0; i < vars.s_idx; ++i) {
            s[i] = vars.tempSuppliedAssetData[i];
        }
        for (uint8 i = 0; i < vars.b_idx; ++i) {
            b[i] = vars.tempBorrowedAssetData[i];
        }
    }

    struct WalletData {
        address asset;
        uint256 amount;
        uint256 amountNative;
        // uint256 currentPrice;
    }

    struct GetUserWalletDataVars {
        uint8 i;
        AssetMappings a;
        address assetOracle;
    }


    function getUserWalletData(
        address user,
        address addressesProvider,
        bool ETHBase,
        address chainlinkConverter
    )
    internal returns (WalletData[] memory)
    {
        GetUserWalletDataVars memory vars;
        vars.a = AssetMappings(ILendingPoolAddressesProvider(addressesProvider).getAssetMappings());

        address[] memory approvedTokens = vars.a.getAllApprovedTokens();

        WalletData[] memory data = new WalletData[](approvedTokens.length);



        for (vars.i = 0; vars.i < approvedTokens.length; ++vars.i) {
            vars.assetOracle = ILendingPoolAddressesProvider(addressesProvider)
                .getPriceOracle();

            data[vars.i] = WalletData ({
                asset: approvedTokens[vars.i],
                amount: ETHBase ? PricingHelpers.convertAmountToUsd(
                    vars.assetOracle,
                    approvedTokens[vars.i],
                    IERC20(approvedTokens[vars.i]).balanceOf(user),
                    IERC20Detailed(approvedTokens[vars.i]).decimals(),
                    chainlinkConverter
                )
                : PricingHelpers.findAmountValue(
                    vars.assetOracle,
                    approvedTokens[vars.i],
                    IERC20(approvedTokens[vars.i]).balanceOf(user),
                    IERC20Detailed(approvedTokens[vars.i]).decimals()
                ),
                amountNative: IERC20(approvedTokens[vars.i]).balanceOf(user)
            });

        }

        return data;
    }

    function concatenateArrays(
        SuppliedAssetData[] memory arr1,
        SuppliedAssetData[] memory arr2)
    internal pure returns(SuppliedAssetData[] memory)
    {
        SuppliedAssetData[] memory returnArr =
            new SuppliedAssetData[](arr1.length + arr2.length);

        uint256 i;
        for (; i < arr1.length; ++i) {
            returnArr[i] = arr1[i];
        }

        uint j=0;
        while (j < arr2.length) {
            returnArr[i++] = arr2[j++];
        }

        return returnArr;
    }
    function concatenateArrays(
        BorrowedAssetData[] memory arr1,
        BorrowedAssetData[] memory arr2)
    internal pure returns(BorrowedAssetData[] memory)
    {
        BorrowedAssetData[] memory returnArr =
            new BorrowedAssetData[](arr1.length + arr2.length);

        uint256 i;
        for (; i < arr1.length; ++i) {
            returnArr[i] = arr1[i];
        }

        uint j=0;
        while (j < arr2.length) {
            returnArr[i++] = arr2[j++];
        }

        return returnArr;
    }
}