// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {IERC20Detailed} from "../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../interfaces/ILendingPool.sol";
import {IVariableDebtToken} from "../interfaces/IVariableDebtToken.sol";
import {ReserveConfiguration} from "../protocol/libraries/configuration/ReserveConfiguration.sol";
import {UserConfiguration} from "../protocol/libraries/configuration/UserConfiguration.sol";
import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeMath} from "../dependencies/openzeppelin/contracts/SafeMath.sol";
import {IAssetMappings} from "../interfaces/IAssetMappings.sol";

contract AaveProtocolDataProvider {
    using SafeMath for uint256;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using UserConfiguration for DataTypes.UserConfigurationMap;

    address constant MKR = 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2;
    address constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    struct TokenData {
        string symbol;
        address tokenAddress;
    }

    ILendingPoolAddressesProvider public immutable ADDRESSES_PROVIDER;

    constructor(ILendingPoolAddressesProvider addressesProvider) {
        ADDRESSES_PROVIDER = addressesProvider;
    }

    function getAllReservesTokens(uint64 trancheId)
        external
        view
        returns (TokenData[] memory)
    {
        ILendingPool pool = ILendingPool(ADDRESSES_PROVIDER.getLendingPool());
        address[] memory reserves = pool.getReservesList(trancheId);
        TokenData[] memory reservesTokens = new TokenData[](reserves.length);
        for (uint256 i = 0; i < reserves.length; i++) {
            if (reserves[i] == MKR) {
                reservesTokens[i] = TokenData({
                    symbol: "MKR",
                    tokenAddress: reserves[i]
                });
                continue;
            }
            if (reserves[i] == ETH) {
                reservesTokens[i] = TokenData({
                    symbol: "ETH",
                    tokenAddress: reserves[i]
                });
                continue;
            }
            reservesTokens[i] = TokenData({
                symbol: IERC20Detailed(reserves[i]).symbol(),
                tokenAddress: reserves[i]
            });
        }
        return reservesTokens;
    }

    function getAllATokens(uint64 trancheId)
        external
        view
        returns (TokenData[] memory)
    {
        ILendingPool pool = ILendingPool(ADDRESSES_PROVIDER.getLendingPool());
        address[] memory reserves = pool.getReservesList(trancheId);
        TokenData[] memory aTokens = new TokenData[](reserves.length);
        for (uint256 i = 0; i < reserves.length; i++) {
            // uint64 trancheId = uint8(i % DataTypes.NUM_TRANCHES);
            DataTypes.ReserveData memory reserveData = pool.getReserveData(
                reserves[i],
                trancheId
            );

            aTokens[i] = TokenData({
                symbol: IERC20Detailed(reserveData.aTokenAddress).symbol(),
                tokenAddress: reserveData.aTokenAddress
            });
        }
        return aTokens;
    }

    struct CalculateUserAccountDataVars {
        uint64 currentTranche;
        uint256 reserveUnitPrice;
        uint256 tokenUnit;
        uint256 compoundedLiquidityBalance;
        uint256 compoundedBorrowBalance;
        uint256 decimals;
        uint256 ltv;
        uint256 liquidationThreshold;
        uint256 i;
        uint256 healthFactor;
        uint256 totalCollateralInETH;
        uint256 totalDebtInETH;
        uint256 avgLtv;
        uint256 avgLiquidationThreshold;
        uint256 reservesLength;
        bool healthFactorBelowThreshold;
        address currentReserveAddress;
        bool usageAsCollateralEnabled;
        bool userUsesReserveAsCollateral;
        uint256 liquidityBalanceETH;
    }

    struct getReserveConfigurationDataReturn {
            uint256 decimals;
            uint256 ltv;
            uint256 liquidationThreshold;
            uint256 liquidationBonus;
            uint256 reserveFactor;
            uint256 VMEXReserveFactor;
            uint256 supplyCap;
            uint256 borrowCap;
            uint256 borrowFactor;
            bool usageAsCollateralEnabled;
            bool borrowingEnabled;
            bool isActive;
            bool isFrozen;
    }

    function getReserveFlags(address asset, uint64 trancheId)
        external
        view
        returns (
            bool isActive,
            bool isFrozen,
            bool borrowingEnabled
        )
    {
        IAssetMappings a = IAssetMappings(ADDRESSES_PROVIDER.getAssetMappings());
        DataTypes.ReserveConfigurationMap memory configuration = ILendingPool(
            ADDRESSES_PROVIDER.getLendingPool()
        ).getConfiguration(asset, trancheId);

        (
            isActive,
            isFrozen,
            borrowingEnabled
        ) = configuration.getFlagsMemory(asset, a);
    }

    function getReserveConfigurationData(address asset, uint64 trancheId)
        external
        view
        returns (
            getReserveConfigurationDataReturn memory ret
        )
    {
        IAssetMappings a = IAssetMappings(ADDRESSES_PROVIDER.getAssetMappings());
        DataTypes.ReserveConfigurationMap memory configuration = ILendingPool(
            ADDRESSES_PROVIDER.getLendingPool()
        ).getConfiguration(asset, trancheId);

        (
            ret.ltv,
            ret.liquidationThreshold,
            ret.liquidationBonus,
            ret.decimals,
            ret.borrowFactor
        ) = a.getParams(asset);
        ret.supplyCap = a.getSupplyCap(asset);
        ret.borrowCap = a.getBorrowCap(asset);

        ret.reserveFactor = configuration.getReserveFactor();
        ret.VMEXReserveFactor = IAssetMappings(ADDRESSES_PROVIDER.getAssetMappings()).getVMEXReserveFactor(asset);

        (
            ret.isActive,
            ret.isFrozen,
            ret.borrowingEnabled
        ) = configuration.getFlagsMemory(asset, IAssetMappings(ADDRESSES_PROVIDER.getAssetMappings()));

        ret.usageAsCollateralEnabled =  configuration.getCollateralEnabled(asset, a);//liquidationThreshold > 0;
    }

    function getReserveData(address asset, uint64 trancheId)
        external
        view
        returns (
            uint256 availableLiquidity,
            uint256 totalSupplied,
            uint256 totalVariableDebt,
            uint256 liquidityRate,
            uint256 variableBorrowRate,
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            uint40 lastUpdateTimestamp
        )
    {
        DataTypes.ReserveData memory reserve = ILendingPool(
            ADDRESSES_PROVIDER.getLendingPool()
        ).getReserveData(asset, trancheId);

        return (
            IERC20Detailed(asset).balanceOf(reserve.aTokenAddress),
            IERC20Detailed(reserve.aTokenAddress).totalSupply(),
            IERC20Detailed(reserve.variableDebtTokenAddress).totalSupply(),
            reserve.currentLiquidityRate,
            reserve.currentVariableBorrowRate,
            reserve.liquidityIndex,
            reserve.variableBorrowIndex,
            reserve.lastUpdateTimestamp
        );
    }

    function getUserReserveData(
        address asset,
        uint64 trancheId,
        address user
    )
        external
        view
        returns (
            uint256 currentATokenBalance,
            uint256 currentVariableDebt,
            uint256 scaledVariableDebt,
            uint256 liquidityRate,
            bool usageAsCollateralEnabled
        )
    {
        DataTypes.ReserveData memory reserve = ILendingPool(
            ADDRESSES_PROVIDER.getLendingPool()
        ).getReserveData(asset, trancheId);

        DataTypes.UserConfigurationMap memory userConfig = ILendingPool(
            ADDRESSES_PROVIDER.getLendingPool()
        ).getUserConfiguration(user, trancheId);

        currentATokenBalance = IERC20Detailed(reserve.aTokenAddress).balanceOf(
            user
        );
        currentVariableDebt = IERC20Detailed(reserve.variableDebtTokenAddress)
            .balanceOf(user);
        scaledVariableDebt = IVariableDebtToken(
            reserve.variableDebtTokenAddress
        ).scaledBalanceOf(user);
        liquidityRate = reserve.currentLiquidityRate;
        usageAsCollateralEnabled = userConfig.isUsingAsCollateral(reserve.id);
    }

    function getReserveTokensAddresses(address asset, uint64 trancheId)
        external
        view
        returns (
            address aTokenAddress,
            address variableDebtTokenAddress
        )
    {
        DataTypes.ReserveData memory reserve = ILendingPool(
            ADDRESSES_PROVIDER.getLendingPool()
        ).getReserveData(asset, trancheId);

        return (
            reserve.aTokenAddress,
            reserve.variableDebtTokenAddress
        );
    }
}
