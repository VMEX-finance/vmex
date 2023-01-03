// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {SafeMath} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {ReserveLogic} from "./ReserveLogic.sol";
import {ReserveConfiguration} from "../configuration/ReserveConfiguration.sol";
import {UserConfiguration} from "../configuration/UserConfiguration.sol";
import {WadRayMath} from "../math/WadRayMath.sol";
import {PercentageMath} from "../math/PercentageMath.sol";
import {IPriceOracleGetter} from "../../../interfaces/IPriceOracleGetter.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {Errors} from "../helpers/Errors.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {AssetMappings} from "../../lendingpool/AssetMappings.sol";
import {IAToken} from "../../../interfaces/IAToken.sol";
/**
 * @title GenericLogic library
 * @author Aave
 * @title Implements protocol-level logic to calculate and validate the state of a user
 */
library GenericLogic {
    using ReserveLogic for DataTypes.ReserveData;
    using SafeMath for uint256;
    using WadRayMath for uint256;
    using PercentageMath for uint256;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using UserConfiguration for DataTypes.UserConfigurationMap;

    uint256 public constant HEALTH_FACTOR_LIQUIDATION_THRESHOLD = 1 ether;

    struct balanceDecreaseAllowedLocalVars {
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

    //  * @param asset The address of the underlying asset of the reserve
    //  * @param user The address of the user
    //  * @param amount The amount to decrease
    struct balanceDecreaseAllowedParameters {
        address asset;
        uint64 trancheId;
        address user;
        uint256 amount;
        ILendingPoolAddressesProvider _addressesProvider;
        AssetMappings _assetMappings;
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
        balanceDecreaseAllowedParameters calldata params,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap calldata userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount
    ) external view returns (bool) {
        if (
            !userConfig.isBorrowingAny() ||
            !userConfig.isUsingAsCollateral(
                reservesData[params.asset][params.trancheId].id
            )
        ) {
            return true;
        }

        balanceDecreaseAllowedLocalVars memory vars;

        (, vars.liquidationThreshold, , vars.decimals, ) = params._assetMappings.getParams(params.asset);
        

        if (reservesData[params.asset][params.trancheId].configuration.getCollateralEnabled()==false){//(vars.liquidationThreshold == 0) {
            return true;
        }

        

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
            params._addressesProvider,
            params._assetMappings,
            true //this function is only used in the context of withdrawing or setting as not collateral, so it should be true
        );

        if (vars.totalDebtInETH == 0) {
            return true;
        }

        

        //using current price instead of 24 hour average
        vars.currentPrice= IPriceOracleGetter(
            params._addressesProvider.getPriceOracle(
            )
        ).getAssetPrice(params.asset);
        
        vars.amountToDecreaseInETH  = vars.currentPrice.mul(params.amount).div(10**vars.decimals);

        vars.collateralBalanceAfterDecrease = vars.totalCollateralInETH.sub(
            vars.amountToDecreaseInETH
        );

        //if there is a borrow, there can't be 0 collateral
        if (vars.collateralBalanceAfterDecrease == 0) {
            return false;
        }
        


        vars.liquidationThresholdAfterDecrease = vars
            .totalCollateralInETH
            .mul(vars.avgLiquidationThreshold)
            .sub(vars.amountToDecreaseInETH.mul(vars.liquidationThreshold))
            .div(vars.collateralBalanceAfterDecrease);


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
        uint64 currentTranche;
        uint64 trancheId;
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
        uint256 reserveTwapUnitPrice;
        uint256 liquidityBalanceETHTWAP;
        address currentReserveAddress;
        address oracle;
        address user;
        bool healthFactorBelowThreshold;
        bool usageAsCollateralEnabled;
        bool userUsesReserveAsCollateral;
        bool useTwap;
    }

    /**
     * @dev Calculates the user data across the reserves.
     * this includes the total liquidity/collateral/borrow balances in ETH,
     * the average Loan To Value, the average Liquidation Ratio, and the Health factor.
     * @param actTranche The address of the user and trancheId
     * @param reservesData Data of all the reserves
     * @param userConfig The configuration of the user
     * @param reserves The list of the available reserves
     * @param _addressesProvider The price oracle address
     * @return The total collateral and total debt of the user in ETH, the avg ltv, liquidation threshold and the HF
     **/
    function calculateUserAccountData(
        DataTypes.AcctTranche memory actTranche,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap memory userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount,
        ILendingPoolAddressesProvider _addressesProvider,
        AssetMappings _assetMappings,
        bool useTwap
    )
        internal
        view
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
        {
            vars.user = actTranche.user;
            vars.trancheId = actTranche.trancheId;
            vars.useTwap = useTwap;
        }

        // require(!userConfig.isEmpty(), "userConfig is empty");
        if (userConfig.isEmpty()) {
            return (0, 0, 0, 0, type(uint256).max, 0);
        }
        // assert(reservesCount == reserves.length);
        for (vars.i = 0; vars.i < reservesCount; vars.i++) {
            if (!userConfig.isUsingAsCollateralOrBorrowing(vars.i)) {
                continue;
            }

            vars.currentReserveAddress = reserves[vars.i];
            DataTypes.ReserveData storage currentReserve = reservesData[
                vars.currentReserveAddress
            ][vars.trancheId];

            {
                vars.oracle = _addressesProvider.getPriceOracle(
                );
            }

            require(
                currentReserve.trancheId == vars.trancheId,
                "calculateUserAccountData trancheId does not line up"
            );

            (
                vars.ltv,
                vars.liquidationThreshold,
                ,
                vars.decimals,
                vars.borrowFactor
            ) = _assetMappings.getParams(vars.currentReserveAddress);

            vars.tokenUnit = 10**vars.decimals;
            vars.reserveUnitPrice = IPriceOracleGetter(vars.oracle)
                .getAssetPrice(vars.currentReserveAddress);

            //decide whether to do on or off chain
            vars.reserveTwapUnitPrice = IPriceOracleGetter(vars.oracle)
                .getAssetTWAPPrice(vars.currentReserveAddress); //from uniswap

            if (
                currentReserve.configuration.getCollateralEnabled()==true &&//vars.liquidationThreshold != 0 &&
                userConfig.isUsingAsCollateral(vars.i)
            ) {
                //the check vars.liquidationThreshold != 0 means reserves that are disabled as collateral (vars.liquidationThreshold = 0) won't count
                vars.compoundedLiquidityBalance = IERC20(
                    currentReserve.aTokenAddress
                ).balanceOf(vars.user);

                vars.liquidityBalanceETH = vars
                    .reserveUnitPrice
                    .mul(vars.compoundedLiquidityBalance)
                    .div(vars.tokenUnit);
                
                if(vars.useTwap){
                    vars.liquidityBalanceETHTWAP = vars
                        .reserveTwapUnitPrice
                        .mul(vars.compoundedLiquidityBalance)
                        .div(vars.tokenUnit);
                    
                    //this means the borrow must satisfy both current price and twap price
                    if(vars.liquidityBalanceETHTWAP < vars.liquidityBalanceETH){
                        vars.liquidityBalanceETH = vars.liquidityBalanceETHTWAP; 
                    }
                }
                
                vars.totalCollateralInETH = vars.totalCollateralInETH.add(
                    vars.liquidityBalanceETH
                );

                vars.avgLtv = vars.avgLtv.add(
                    vars.liquidityBalanceETH.mul(vars.ltv)//.percentMul(vars.borrowFactor) //borrow factor is property of borrowed asset, not collateral asset
                );
                vars.avgLiquidationThreshold = vars.avgLiquidationThreshold.add(
                    vars.liquidityBalanceETH.mul(vars.liquidationThreshold)//.percentMul(vars.borrowFactor)
                );
            }

            if (userConfig.isBorrowing(vars.i)) {
                vars.compoundedBorrowBalance = IERC20(
                    currentReserve.stableDebtTokenAddress
                ).balanceOf(vars.user);
                vars.compoundedBorrowBalance = vars.compoundedBorrowBalance.add(
                    IERC20(currentReserve.variableDebtTokenAddress).balanceOf(
                        vars.user
                    )
                );

                

                if(!useTwap || vars.reserveTwapUnitPrice<vars.reserveUnitPrice){ //debt uses the larger value of price
                //if not using twap or if not using twap has higher price, then use the regular price
                    vars.thisDebtInEth = vars.reserveUnitPrice.mul(vars.compoundedBorrowBalance).div(
                            vars.tokenUnit
                        );
                }
                else{
                    vars.thisDebtInEth = vars.reserveTwapUnitPrice.mul(vars.compoundedBorrowBalance).div(
                            vars.tokenUnit
                        );
                }

                vars.totalDebtInETH = vars.totalDebtInETH.add(
                    vars.thisDebtInEth
                );

                if(vars.borrowFactor != 0){
                    vars.avgBorrowFactor = vars.avgBorrowFactor.add(
                        vars.thisDebtInEth.mul(vars.borrowFactor)
                    );
                }
            }
        }

        vars.avgLtv = vars.totalCollateralInETH > 0
            ? vars.avgLtv.div(vars.totalCollateralInETH)
            : 0; //weighted average of all ltv's across all supplied assets
        vars.avgLiquidationThreshold = vars.totalCollateralInETH > 0
            ? vars.avgLiquidationThreshold.div(vars.totalCollateralInETH)
            : 0;
        vars.avgBorrowFactor = vars.totalDebtInETH > 0
            ? vars.avgBorrowFactor.div(vars.totalDebtInETH)
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

        availableBorrowsETH = availableBorrowsETH.sub(totalDebtInETH.percentMul(avgBorrowFactor));
        return availableBorrowsETH;
    }
}
