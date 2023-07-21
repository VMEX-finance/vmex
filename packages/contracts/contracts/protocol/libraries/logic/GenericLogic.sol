// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {ReserveLogic} from "./ReserveLogic.sol";
import {ReserveConfiguration} from "../configuration/ReserveConfiguration.sol";
import {UserConfiguration} from "../configuration/UserConfiguration.sol";
import {WadRayMath} from "../math/WadRayMath.sol";
import {PercentageMath} from "../math/PercentageMath.sol";
import {IPriceOracleGetter} from "../../../interfaces/IPriceOracleGetter.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {IAssetMappings} from "../../../interfaces/IAssetMappings.sol";
/**
 * @title GenericLogic library
 * @author Aave
 * @title Implements protocol-level logic to calculate and validate the state of a user
 */
library GenericLogic {
    using ReserveLogic for DataTypes.ReserveData;
    using WadRayMath for uint256;
    using PercentageMath for uint256;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using UserConfiguration for DataTypes.UserConfigurationMap;

    uint256 public constant HEALTH_FACTOR_LIQUIDATION_THRESHOLD = 1 ether;

    struct BalanceDecreaseAllowedLocalVars {
        uint256 decimals;
        uint256 liquidationThreshold;
        uint256 totalCollateralInETH;
        uint256 totalDebtInETH;
        uint256 avgLiquidationThreshold;
        uint256 avgBorrowFactor;
        uint256 amountToDecreaseInETH;
        uint256 collateralBalanceAfterDecrease;
        uint256 liquidationThresholdAfterDecrease;
        uint256 healthFactorAfterDecrease;
        uint256 currentPrice;
        bool reserveUsageAsCollateralEnabled;

    }

    struct BalanceDecreaseAllowedParameters {
        address asset;
        uint64 trancheId;
        address user;
        uint256 amount;
        ILendingPoolAddressesProvider addressesProvider;
        IAssetMappings assetMappings;
    }

    /**
     * @dev Checks if a specific balance decrease is allowed
     * (i.e. doesn't bring the user borrow position health factor under HEALTH_FACTOR_LIQUIDATION_THRESHOLD)
     * @param reservesData The data of all the reserves
     * @param userConfig The user configuration
     * @param reserves The list of all the active reserves
     * @return true if the decrease of the balance is allowed
     **/
    function balanceDecreaseAllowed(
        BalanceDecreaseAllowedParameters calldata params,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap calldata userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount
    ) external returns (bool) {
        if (
            !userConfig.isBorrowingAny() ||
            !userConfig.isUsingAsCollateral(
                reservesData[params.asset][params.trancheId].id
            )
        ) {
            return true;
        }

        BalanceDecreaseAllowedLocalVars memory vars;

        (, vars.liquidationThreshold, , vars.decimals, ) = params.assetMappings.getParams(params.asset, params.trancheId);

        (
            vars.totalCollateralInETH,
            vars.totalDebtInETH,
            ,
            vars.avgLiquidationThreshold,
            ,
            vars.avgBorrowFactor
        ) = calculateUserAccountData(
            DataTypes.AcctTranche(params.user, params.trancheId),
            reservesData,
            userConfig,
            reserves,
            reservesCount,
            params.addressesProvider,
            params.assetMappings
        );

        if (vars.totalDebtInETH == 0) {
            return true;
        }

        //using current price instead of 24 hour average
        vars.currentPrice= IPriceOracleGetter(
            params.addressesProvider.getPriceOracle(
            )
        ).getAssetPrice(params.asset);

        vars.amountToDecreaseInETH  = vars.currentPrice * params.amount / 10**vars.decimals;

        vars.collateralBalanceAfterDecrease = vars.totalCollateralInETH - vars.amountToDecreaseInETH;

        //if there is a borrow, there can't be 0 collateral
        if (vars.collateralBalanceAfterDecrease == 0) {
            return false;
        }

        vars.liquidationThresholdAfterDecrease = (vars.totalCollateralInETH * vars.avgLiquidationThreshold
            - vars.amountToDecreaseInETH * vars.liquidationThreshold)
            / vars.collateralBalanceAfterDecrease;


        vars.healthFactorAfterDecrease = calculateHealthFactorFromBalances(
            vars.collateralBalanceAfterDecrease,
            vars.totalDebtInETH,
            vars.liquidationThresholdAfterDecrease,
            vars.avgBorrowFactor
        );
        return
            vars.healthFactorAfterDecrease >=
            GenericLogic.HEALTH_FACTOR_LIQUIDATION_THRESHOLD;
    }

    struct CalculateUserAccountDataVars {
        uint256 reserveUnitPrice;
        uint256 tokenUnit;
        uint256 compoundedLiquidityBalance;
        uint256 compoundedBorrowBalance;
        uint256 decimals;
        uint256 ltv;
        uint256 borrowFactor;
        uint256 liquidationThreshold;
        uint256 i;
        uint256 healthFactor;
        uint256 totalCollateralInETH;
        uint256 totalDebtInETH;
        uint256 avgLtv;
        uint256 avgLiquidationThreshold;
        uint256 thisDebtInEth;
        uint256 avgBorrowFactor;
        uint256 reservesLength;
        uint256 liquidityBalanceETH;
        uint64 currentTranche;
        address currentReserveAddress;
        uint64 trancheId;
        address oracle;
        address user;
        bool healthFactorBelowThreshold;
        bool usageAsCollateralEnabled;
        bool userUsesReserveAsCollateral;
    }

    /**
     * @dev Calculates the user data across the reserves.
     * this includes the total liquidity/collateral/borrow balances in ETH,
     * the average Loan To Value, the average Liquidation Ratio, and the Health factor.
     * @param actTranche The address of the user and trancheId
     * @param reservesData Data of all the reserves
     * @param userConfig The configuration of the user
     * @param reserves The list of the available reserves
     * @param addressesProvider The addresses provider address
     * @param assetMappings The addresses provider address
     * @return The total collateral and total debt of the user in ETH, the avg ltv, liquidation threshold, the HF and avg borrow factor
     **/
    function calculateUserAccountData(
        DataTypes.AcctTranche memory actTranche,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap memory userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount,
        ILendingPoolAddressesProvider addressesProvider,
        IAssetMappings assetMappings
    )
        internal
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        CalculateUserAccountDataVars memory vars;
        vars.user = actTranche.user;
        vars.trancheId = actTranche.trancheId;

        if (userConfig.isEmpty()) {
            return (0, 0, 0, 0, type(uint256).max, 0);
        }

        vars.oracle = addressesProvider.getPriceOracle();

        for (vars.i = 0; vars.i < reservesCount; vars.i++) {
            // continue if not allowed. Not allowed will only be set if NO Borrows outstanding, so no chance of unaccounted debt
            if (!userConfig.isUsingAsCollateralOrBorrowing(vars.i) || !assetMappings.getAssetAllowed(reserves[vars.i])) {
                continue;
            }

            vars.currentReserveAddress = reserves[vars.i];
            DataTypes.ReserveData storage currentReserve = reservesData[
                vars.currentReserveAddress
            ][vars.trancheId];

            (
                vars.ltv,
                vars.liquidationThreshold,
                ,
                vars.decimals,
                vars.borrowFactor
            ) = assetMappings.getParams(vars.currentReserveAddress, vars.trancheId);

            vars.tokenUnit = 10**vars.decimals;
            vars.reserveUnitPrice = IPriceOracleGetter(vars.oracle)
                .getAssetPrice(vars.currentReserveAddress);

            if (
                currentReserve.configuration.getCollateralEnabled(vars.currentReserveAddress, assetMappings) &&
                userConfig.isUsingAsCollateral(vars.i)
            ) {
                vars.compoundedLiquidityBalance = IERC20(
                    currentReserve.aTokenAddress
                ).balanceOf(vars.user);
                // could also be in USD if reserveUnitPrice is in USD (with 8 decimals)
                vars.liquidityBalanceETH = vars.reserveUnitPrice * vars.compoundedLiquidityBalance / vars.tokenUnit;

                vars.totalCollateralInETH = vars.totalCollateralInETH + vars.liquidityBalanceETH;

                vars.avgLtv = vars.avgLtv + vars.liquidityBalanceETH * vars.ltv;
                vars.avgLiquidationThreshold = vars.avgLiquidationThreshold + vars.liquidityBalanceETH * vars.liquidationThreshold;
            }

            if (userConfig.isBorrowing(vars.i)) {
                vars.compoundedBorrowBalance =
                    IERC20(currentReserve.variableDebtTokenAddress).balanceOf(vars.user);

                vars.thisDebtInEth = vars.reserveUnitPrice * vars.compoundedBorrowBalance / vars.tokenUnit;

                vars.totalDebtInETH = vars.totalDebtInETH + vars.thisDebtInEth;

                if(vars.borrowFactor != 0){
                    vars.avgBorrowFactor = vars.avgBorrowFactor + vars.thisDebtInEth * vars.borrowFactor;
                }
            }
        }

        vars.avgLtv = vars.totalCollateralInETH > 0
            ? vars.avgLtv / vars.totalCollateralInETH
            : 0; //weighted average of all ltv's across all supplied assets
        vars.avgLiquidationThreshold = vars.totalCollateralInETH > 0
            ? vars.avgLiquidationThreshold / vars.totalCollateralInETH
            : 0;
        vars.avgBorrowFactor = vars.totalDebtInETH > 0
            ? vars.avgBorrowFactor / vars.totalDebtInETH
            : 0;

        vars.healthFactor = calculateHealthFactorFromBalances(
            vars.totalCollateralInETH,
            vars.totalDebtInETH,
            vars.avgLiquidationThreshold,
            vars.avgBorrowFactor
        );
        return (
            vars.totalCollateralInETH,
            vars.totalDebtInETH,
            vars.avgLtv,
            vars.avgLiquidationThreshold,
            vars.healthFactor,
            vars.avgBorrowFactor
        );
    }

    /**
     * @dev Calculates the health factor from the corresponding balances
     * @param totalCollateralInETH The total collateral in ETH
     * @param totalDebtInETH The total debt in ETH
     * @param liquidationThreshold The avg liquidation threshold
     * @param borrowFactor The borrow factor
     * @return The health factor calculated from the balances provided
     **/
    function calculateHealthFactorFromBalances(
        uint256 totalCollateralInETH,
        uint256 totalDebtInETH,
        uint256 liquidationThreshold,
        uint256 borrowFactor
    ) internal pure returns (uint256) {
        if (totalDebtInETH == 0) return type(uint256).max;

        return
            (totalCollateralInETH.percentMul(liquidationThreshold)).wadDiv(
                totalDebtInETH.percentMul(borrowFactor)
            );
    }

    /**
     * @dev Calculates the equivalent amount in ETH that an user can borrow, depending on the available collateral and the
     * average Loan To Value
     * @param totalCollateralInETH The total collateral in ETH
     * @param totalDebtInETH The total borrow balance
     * @param ltv The average loan to value
     * @return the amount available to borrow in ETH for the user
     **/

    function calculateAvailableBorrowsETH(
        uint256 totalCollateralInETH,
        uint256 totalDebtInETH,
        uint256 ltv,
        uint256 avgBorrowFactor
    ) internal pure returns (uint256) {
        uint256 availableBorrowsETH = totalCollateralInETH.percentMul(ltv);

        if (availableBorrowsETH < totalDebtInETH.percentMul(avgBorrowFactor)) {
            return 0;
        }

        availableBorrowsETH = availableBorrowsETH - totalDebtInETH.percentMul(avgBorrowFactor);
        return availableBorrowsETH;
    }
}
