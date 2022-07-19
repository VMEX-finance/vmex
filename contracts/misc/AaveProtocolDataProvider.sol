// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {
    IERC20Detailed
} from "../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {
    ILendingPoolAddressesProvider
} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../interfaces/ILendingPool.sol";
import {IStableDebtToken} from "../interfaces/IStableDebtToken.sol";
import {IVariableDebtToken} from "../interfaces/IVariableDebtToken.sol";
import {
    ReserveConfiguration
} from "../protocol/libraries/configuration/ReserveConfiguration.sol";
import {
    UserConfiguration
} from "../protocol/libraries/configuration/UserConfiguration.sol";
import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeMath} from "../dependencies/openzeppelin/contracts/SafeMath.sol";

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

    constructor(ILendingPoolAddressesProvider addressesProvider) public {
        ADDRESSES_PROVIDER = addressesProvider;
    }

    function getAllReservesTokens() external view returns (TokenData[] memory) {
        ILendingPool pool = ILendingPool(ADDRESSES_PROVIDER.getLendingPool());
        address[] memory reserves = pool.getReservesList();
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

    function getAllATokens() external view returns (TokenData[] memory) {
        ILendingPool pool = ILendingPool(ADDRESSES_PROVIDER.getLendingPool());
        address[] memory reserves = pool.getReservesList();
        TokenData[] memory aTokens = new TokenData[](reserves.length);
        for (uint256 i = 0; i < reserves.length; i++) {
            uint8 tranche = uint8(i % DataTypes.NUM_TRANCHES);
            DataTypes.ReserveData memory reserveData =
                pool.getReserveData(reserves[i], tranche);

            assert(reserveData.tranche == tranche);

            aTokens[i] = TokenData({
                symbol: IERC20Detailed(reserveData.aTokenAddress).symbol(),
                tokenAddress: reserveData.aTokenAddress
            });
        }
        return aTokens;
    }

    struct CalculateUserAccountDataVars {
        uint8 currentTranche;
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

    struct getUserConfigRet {
        bool isCollateral;
        string symbol;
        uint8 tranche;
        uint256 balance;
    }

    function getUserConfig(address user)
        external
        view
        returns (getUserConfigRet[] memory)
    {
        ILendingPool pool = ILendingPool(ADDRESSES_PROVIDER.getLendingPool());
        DataTypes.UserConfigurationMap memory userConfig =
            pool.getUserConfiguration(user);
        address[] memory reserves = pool.getReservesList();

        CalculateUserAccountDataVars memory vars;
        require(!userConfig.isEmpty(), "userConfig is empty");
        uint256 numCollat = 0;
        getUserConfigRet[] memory ret = new getUserConfigRet[](reserves.length);
        // assert(reservesCount == reserves.length);
        for (vars.i = 0; vars.i < reserves.length; vars.i++) {
            if (!userConfig.isUsingAsCollateralOrBorrowing(vars.i)) {
                continue;
            }

            vars.currentReserveAddress = reserves[vars.i];
            vars.currentTranche = uint8((vars.i + 2) % DataTypes.NUM_TRANCHES);
            DataTypes.ReserveData memory currentReserve =
                pool.getReserveData(
                    vars.currentReserveAddress,
                    vars.currentTranche
                );

            // if this fails, come up with better solution than modulo
            assert(currentReserve.tranche == vars.currentTranche);

            (vars.ltv, vars.liquidationThreshold, , vars.decimals, ) = (
                1,
                2,
                3,
                4,
                5
            );

            vars.tokenUnit = 10**vars.decimals;
            vars.reserveUnitPrice = 500;

            ret[vars.i] = (
                getUserConfigRet(
                    userConfig.isUsingAsCollateral(vars.i),
                    IERC20Detailed(currentReserve.aTokenAddress).symbol(),
                    vars.currentTranche,
                    IERC20(currentReserve.aTokenAddress).balanceOf(user)
                )
            );

            if (
                vars.liquidationThreshold != 0 &&
                userConfig.isUsingAsCollateral(vars.i)
            ) {
                numCollat += 1;
                vars.compoundedLiquidityBalance = IERC20(
                    currentReserve
                        .aTokenAddress
                )
                    .balanceOf(user);

                vars.liquidityBalanceETH = vars
                    .reserveUnitPrice
                    .mul(vars.compoundedLiquidityBalance)
                    .div(vars.tokenUnit);

                vars.totalCollateralInETH = vars.totalCollateralInETH.add(
                    vars.liquidityBalanceETH
                );

                vars.avgLtv = vars.avgLtv.add(
                    vars.liquidityBalanceETH.mul(vars.ltv)
                );
                vars.avgLiquidationThreshold = vars.avgLiquidationThreshold.add(
                    vars.liquidityBalanceETH.mul(vars.liquidationThreshold)
                );
            }
        }

        return ret;
    }

    function getReserveConfigurationData(address asset, uint8 tranche)
        external
        view
        returns (
            uint256 decimals,
            uint256 ltv,
            uint256 liquidationThreshold,
            uint256 liquidationBonus,
            uint256 reserveFactor,
            bool usageAsCollateralEnabled,
            bool borrowingEnabled,
            bool stableBorrowRateEnabled,
            bool isActive,
            bool isFrozen
        )
    {
        DataTypes.ReserveConfigurationMap memory configuration =
            ILendingPool(ADDRESSES_PROVIDER.getLendingPool()).getConfiguration(
                asset,
                tranche
            );

        (
            ltv,
            liquidationThreshold,
            liquidationBonus,
            decimals,
            reserveFactor
        ) = configuration.getParamsMemory();

        (
            isActive,
            isFrozen,
            borrowingEnabled,
            stableBorrowRateEnabled
        ) = configuration.getFlagsMemory();

        usageAsCollateralEnabled = liquidationThreshold > 0;
    }

    function getReserveData(address asset, uint8 tranche)
        external
        view
        returns (
            uint256 availableLiquidity,
            uint256 totalStableDebt,
            uint256 totalVariableDebt,
            uint256 liquidityRate,
            uint256 variableBorrowRate,
            uint256 stableBorrowRate,
            uint256 averageStableBorrowRate,
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            uint40 lastUpdateTimestamp
        )
    {
        DataTypes.ReserveData memory reserve =
            ILendingPool(ADDRESSES_PROVIDER.getLendingPool()).getReserveData(
                asset,
                tranche
            );

        return (
            IERC20Detailed(asset).balanceOf(reserve.aTokenAddress),
            IERC20Detailed(reserve.stableDebtTokenAddress).totalSupply(),
            IERC20Detailed(reserve.variableDebtTokenAddress).totalSupply(),
            reserve.currentLiquidityRate,
            reserve.currentVariableBorrowRate,
            reserve.currentStableBorrowRate,
            IStableDebtToken(reserve.stableDebtTokenAddress)
                .getAverageStableRate(),
            reserve.liquidityIndex,
            reserve.variableBorrowIndex,
            reserve.lastUpdateTimestamp
        );
    }

    function getUserReserveData(
        address asset,
        uint8 tranche,
        address user
    )
        external
        view
        returns (
            uint256 currentATokenBalance,
            uint256 currentStableDebt,
            uint256 currentVariableDebt,
            uint256 principalStableDebt,
            uint256 scaledVariableDebt,
            uint256 stableBorrowRate,
            uint256 liquidityRate,
            uint40 stableRateLastUpdated,
            bool usageAsCollateralEnabled
        )
    {
        DataTypes.ReserveData memory reserve =
            ILendingPool(ADDRESSES_PROVIDER.getLendingPool()).getReserveData(
                asset,
                tranche
            );

        DataTypes.UserConfigurationMap memory userConfig =
            ILendingPool(ADDRESSES_PROVIDER.getLendingPool())
                .getUserConfiguration(user);

        currentATokenBalance = IERC20Detailed(reserve.aTokenAddress).balanceOf(
            user
        );
        currentVariableDebt = IERC20Detailed(reserve.variableDebtTokenAddress)
            .balanceOf(user);
        currentStableDebt = IERC20Detailed(reserve.stableDebtTokenAddress)
            .balanceOf(user);
        principalStableDebt = IStableDebtToken(reserve.stableDebtTokenAddress)
            .principalBalanceOf(user);
        scaledVariableDebt = IVariableDebtToken(
            reserve
                .variableDebtTokenAddress
        )
            .scaledBalanceOf(user);
        liquidityRate = reserve.currentLiquidityRate;
        stableBorrowRate = IStableDebtToken(reserve.stableDebtTokenAddress)
            .getUserStableRate(user);
        stableRateLastUpdated = IStableDebtToken(reserve.stableDebtTokenAddress)
            .getUserLastUpdated(user);
        usageAsCollateralEnabled = userConfig.isUsingAsCollateral(reserve.id);
    }

    function getReserveTokensAddresses(address asset, uint8 tranche)
        external
        view
        returns (
            address aTokenAddress,
            address stableDebtTokenAddress,
            address variableDebtTokenAddress
        )
    {
        DataTypes.ReserveData memory reserve =
            ILendingPool(ADDRESSES_PROVIDER.getLendingPool()).getReserveData(
                asset,
                tranche
            );

        return (
            reserve.aTokenAddress,
            reserve.stableDebtTokenAddress,
            reserve.variableDebtTokenAddress
        );
    }
}
