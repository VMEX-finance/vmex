// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IERC20} from "../../dependencies/openzeppelin/contracts//IERC20.sol";
import {IAToken} from "../../interfaces/IAToken.sol";
import {IVariableDebtToken} from "../../interfaces/IVariableDebtToken.sol";
import {IPriceOracleGetter} from "../../interfaces/IPriceOracleGetter.sol";
import {ILendingPoolCollateralManager} from "../../interfaces/ILendingPoolCollateralManager.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {GenericLogic} from "../libraries/logic/GenericLogic.sol";
import {WadRayMath} from "../libraries/math/WadRayMath.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";
import {ValidationLogic} from "../libraries/logic/ValidationLogic.sol";
import {ReserveLogic} from "../libraries/logic/ReserveLogic.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {UserConfiguration} from "../libraries/configuration/UserConfiguration.sol";
import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
import {LendingPoolStorage} from "./LendingPoolStorage.sol";

import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";

/**
 * @title LendingPoolCollateralManager contract
 * @author Aave and VMEX
 * @dev Implements actions involving management of collateral in the protocol, the main one being the liquidations
 * IMPORTANT This contract will run always via DELEGATECALL, through the LendingPool, so the chain of inheritance
 * is the same as the LendingPool, to have compatible storage layouts
 **/
contract LendingPoolCollateralManager is
    ILendingPoolCollateralManager,
    Initializable,
    LendingPoolStorage
{
    using SafeERC20 for IERC20;
    using WadRayMath for uint256;
    using PercentageMath for uint256;
    using ReserveLogic for *;
    using UserConfiguration for *;
    using ReserveConfiguration for *;
    using GenericLogic for *;

    uint256 internal constant PERCENTAGEMATH_NUM_DECIMALS = 18;

    uint256 internal constant LIQUIDATION_CLOSE_FACTOR_PERCENT = 5000*10**(PERCENTAGEMATH_NUM_DECIMALS-4);

    struct LiquidationCallLocalVars {
        uint256 userCollateralBalance;
        uint256 userVariableDebt;
        uint256 maxLiquidatableDebt;
        uint256 actualDebtToLiquidate;
        uint256 liquidationRatio;
        uint256 maxAmountCollateralToLiquidate;
        uint256 maxCollateralToLiquidate;
        uint256 debtAmountNeeded;
        uint256 healthFactor;
        uint256 liquidatorPreviousATokenBalance;
        uint256 errorCode;
        string errorMsg;
        IAssetMappings _assetMappings;
        bool isCollateralEnabled;
        DataTypes.InterestRateMode borrowRateMode;
        address debtAsset;
        address collateralAsset;
        address collateralAToken;
    }

    /**
     * @dev Function to liquidate a position if its Health Factor drops below 1
     * - The caller (liquidator) covers `debtToCover` amount of debt of the user getting liquidated, and receives
     *   a proportionally amount of the `collateralAsset` plus a bonus to cover market risk
     * @param collateralAsset The address of the underlying asset used as collateral, to receive as result of the liquidation
     * @param debtAsset The address of the underlying borrowed asset to be repaid with the liquidation
     * @param trancheId The tranche id where the liquidation occurs
     * @param user The address of the borrower getting liquidated
     * @param debtToCover The debt amount of borrowed `asset` the liquidator wants to cover
     * @param receiveAToken `true` if the liquidators wants to receive the collateral aTokens, `false` if he wants
     * to receive the underlying collateral asset directly
     **/
    function liquidationCall(
        address collateralAsset,
        address debtAsset,
        uint64 trancheId,
        address user,
        uint256 debtToCover,
        bool receiveAToken
    ) external override returns (uint256, string memory) {
        DataTypes.UserConfigurationMap storage userConfig = _usersConfig[user][
            trancheId
        ].configuration;

        LiquidationCallLocalVars memory vars;
        vars._assetMappings = _assetMappings;
        vars.debtAsset = debtAsset;
        vars.collateralAsset = collateralAsset;


        (, , , , vars.healthFactor,) = GenericLogic.calculateUserAccountData(
            DataTypes.AcctTranche(user, trancheId),
            _reserves,
            userConfig,
            _reservesList[trancheId],
            trancheParams[trancheId].reservesCount,
            _addressesProvider,
            vars._assetMappings
        );

        DataTypes.ReserveData storage collateralReserve = _reserves[
            vars.collateralAsset
        ][trancheId];
        vars.collateralAToken = collateralReserve.aTokenAddress;

        DataTypes.ReserveData storage debtReserve = _reserves[vars.debtAsset][
            trancheId
        ];

        vars.userVariableDebt = Helpers.getUserCurrentDebt(
            user,
            debtReserve
        );

        (vars.errorCode, vars.errorMsg) = ValidationLogic
            .validateLiquidationCall(
                collateralReserve,
                debtReserve,
                userConfig,
                vars.healthFactor,
                vars.userVariableDebt,
                vars.collateralAsset,
                vars.debtAsset,
                vars._assetMappings
            );

        if (
            Errors.CollateralManagerErrors(vars.errorCode) !=
            Errors.CollateralManagerErrors.NO_ERROR
        ) {
            return (vars.errorCode, vars.errorMsg);
        }

        vars.userCollateralBalance = IAToken(vars.collateralAToken).balanceOf(user);

        //user's total debt * 50% (you can only liquidate half of user's debt)
        vars.maxLiquidatableDebt = vars.userVariableDebt
            .percentMul(LIQUIDATION_CLOSE_FACTOR_PERCENT);

        vars.actualDebtToLiquidate = debtToCover > vars.maxLiquidatableDebt
            ? vars.maxLiquidatableDebt
            : debtToCover;

        (
            vars.maxCollateralToLiquidate,
            vars.debtAmountNeeded
        ) = _calculateAvailableCollateralToLiquidate(
            vars.collateralAsset,
            vars.debtAsset,
            vars.actualDebtToLiquidate,
            vars.userCollateralBalance,
            trancheId
        );

        // If debtAmountNeeded < actualDebtToLiquidate, there isn't enough
        // collateral to cover the actual amount that is being liquidated, hence we liquidate
        // a smaller amount

        if (vars.debtAmountNeeded < vars.actualDebtToLiquidate) {
            vars.actualDebtToLiquidate = vars.debtAmountNeeded;
        }

        // If the liquidator reclaims the underlying asset, we make sure there is enough available liquidity in the
        // collateral reserve
        if (!receiveAToken) {
            uint256 currentAvailableCollateral = IERC20(vars.collateralAsset)
                .balanceOf(vars.collateralAToken);
            currentAvailableCollateral = currentAvailableCollateral + IAToken(vars.collateralAToken).getStakedAmount();

            if (currentAvailableCollateral < vars.maxCollateralToLiquidate) {
                return (
                    uint256(
                        Errors.CollateralManagerErrors.NOT_ENOUGH_LIQUIDITY
                    ),
                    Errors.LPCM_NOT_ENOUGH_LIQUIDITY_TO_LIQUIDATE
                );
            }
        }

        debtReserve.updateState(vars._assetMappings.getVMEXReserveFactor(vars.debtAsset));

        if (vars.userVariableDebt >= vars.actualDebtToLiquidate) {
            IVariableDebtToken(debtReserve.variableDebtTokenAddress).burn(
                user,
                vars.actualDebtToLiquidate,
                debtReserve.variableBorrowIndex
            );
        } else {
            // If the user doesn't have variable debt, no need to try to burn variable debt tokens
            if (vars.userVariableDebt != 0) {
                IVariableDebtToken(debtReserve.variableDebtTokenAddress).burn(
                    user,
                    vars.userVariableDebt,
                    debtReserve.variableBorrowIndex
                );
            }
        }
        debtReserve.updateInterestRates(
            _assetMappings,
            vars.debtAsset,
            trancheId,
            vars.actualDebtToLiquidate,
            0
        );

        if (receiveAToken) {
            vars.liquidatorPreviousATokenBalance = IERC20((vars.collateralAToken))
                .balanceOf(msg.sender);
            IAToken(vars.collateralAToken).transferOnLiquidation(
                user,
                msg.sender,
                vars.maxCollateralToLiquidate
            );

            if (vars.liquidatorPreviousATokenBalance == 0) {
                DataTypes.UserConfigurationMap
                    storage liquidatorConfig = _usersConfig[msg.sender][
                        trancheId
                    ].configuration;
                liquidatorConfig.setUsingAsCollateral(
                    collateralReserve.id,
                    collateralReserve.configuration
                        .getCollateralEnabled(vars.collateralAsset, _assetMappings)
                );
                emit ReserveUsedAsCollateralEnabled(
                    vars.collateralAsset,
                    trancheId,
                    msg.sender
                );
            }
        } else {

            collateralReserve.updateState(vars._assetMappings.getVMEXReserveFactor(collateralAsset));
            collateralReserve.updateInterestRates(
                _assetMappings,
                vars.collateralAsset,
                trancheId,
                0,
                vars.maxCollateralToLiquidate
            );
            // Burn the equivalent amount of aToken, sending the underlying to the liquidator
            IAToken(vars.collateralAToken).burn(
                user,
                msg.sender,
                vars.maxCollateralToLiquidate,
                collateralReserve.liquidityIndex
            );
        }

        // If the collateral being liquidated is equal to the user balance,
        // we set the currency as not being used as collateral anymore
        if (vars.maxCollateralToLiquidate == vars.userCollateralBalance) {
            userConfig.setUsingAsCollateral(collateralReserve.id, false);
            emit ReserveUsedAsCollateralDisabled(vars.collateralAsset, trancheId, user);
        }

        // Transfers the debt asset being repaid to the aToken, where the liquidity is kept
        IERC20(vars.debtAsset).safeTransferFrom(
            msg.sender,
            debtReserve.aTokenAddress,
            vars.actualDebtToLiquidate
        );

        emit LiquidationCall(
            vars.collateralAsset,
            vars.debtAsset,
            trancheId,
            user,
            vars.actualDebtToLiquidate,
            vars.maxCollateralToLiquidate,
            msg.sender,
            receiveAToken
        );

        return (
            uint256(Errors.CollateralManagerErrors.NO_ERROR),
            Errors.LPCM_NO_ERRORS
        );
    }

    struct AvailableCollateralToLiquidateLocalVars {
        uint256 userCompoundedBorrowBalance;
        uint256 liquidationBonus;
        uint256 collateralPrice;
        uint256 debtAssetPrice;
        uint256 maxAmountCollateralToLiquidate;
        uint256 debtAssetDecimals;
        uint256 collateralDecimals;
    }

    /**
     * @dev Calculates how much of a specific collateral can be liquidated, given
     * a certain amount of debt asset.
     * - This function needs to be called after all the checks to validate the liquidation have been performed,
     *   otherwise it might fail.
     * @param collateralAsset The address of the underlying asset used as collateral, to receive as result of the liquidation
     * @param debtAsset The address of the underlying borrowed asset to be repaid with the liquidation
     * @param debtToCover The debt amount of borrowed `asset` the liquidator wants to cover
     * @param userCollateralBalance The collateral balance for the specific `collateralAsset` of the user being liquidated
     * @return collateralAmount: The maximum amount that is possible to liquidate given all the liquidation constraints
     *                           (user balance, close factor)
     * @return debtAmountNeeded: The amount to repay with the liquidation
     **/
    function _calculateAvailableCollateralToLiquidate(
        address collateralAsset,
        address debtAsset,
        uint256 debtToCover,
        uint256 userCollateralBalance,
        uint64 trancheId
    ) internal returns (uint256, uint256) {
        uint256 collateralAmount;
        uint256 debtAmountNeeded;

        AvailableCollateralToLiquidateLocalVars memory vars;
        {
            address oracleAddress = _addressesProvider.getPriceOracle();

            IPriceOracleGetter oracle = IPriceOracleGetter(oracleAddress);
            vars.collateralPrice = oracle.getAssetPrice(collateralAsset);

            oracle = IPriceOracleGetter(oracleAddress);
            vars.debtAssetPrice = oracle.getAssetPrice(debtAsset);
        }
        (
            ,
            ,
            vars.liquidationBonus,
            vars.collateralDecimals,

        ) = _assetMappings.getParams(collateralAsset, trancheId);
        vars.debtAssetDecimals = _assetMappings.getDecimals(debtAsset);

        // This is the maximum possible amount of the selected collateral that can be liquidated, given the
        // max amount of liquidatable debt
        vars.maxAmountCollateralToLiquidate = (vars.debtAssetPrice * debtToCover * 10**vars.collateralDecimals)
            .percentMul(vars.liquidationBonus)
            / (vars.collateralPrice * 10**vars.debtAssetDecimals);

        if (vars.maxAmountCollateralToLiquidate > userCollateralBalance) {
            collateralAmount = userCollateralBalance;
            debtAmountNeeded = (vars.collateralPrice * collateralAmount * 10**vars.debtAssetDecimals
                / (vars.debtAssetPrice * 10**vars.collateralDecimals))
                .percentDiv(vars.liquidationBonus);
        } else {
            collateralAmount = vars.maxAmountCollateralToLiquidate;
            debtAmountNeeded = debtToCover;
        }
        return (collateralAmount, debtAmountNeeded);
    }
}
