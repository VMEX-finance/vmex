// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {SafeMath} from "../../dependencies/openzeppelin/contracts//SafeMath.sol";
import {IERC20} from "../../dependencies/openzeppelin/contracts//IERC20.sol";
import {IAToken} from "../../interfaces/IAToken.sol";
import {IStableDebtToken} from "../../interfaces/IStableDebtToken.sol";
import {IVariableDebtToken} from "../../interfaces/IVariableDebtToken.sol";
import {IPriceOracleGetter} from "../../interfaces/IPriceOracleGetter.sol";
import {ILendingPoolCollateralManager} from "../../interfaces/ILendingPoolCollateralManager.sol";
import {VersionedInitializable} from "../libraries/aave-upgradeability/VersionedInitializable.sol";
import {GenericLogic} from "../libraries/logic/GenericLogic.sol";
// import {Helpers} from "../libraries/helpers/Helpers.sol";
import {WadRayMath} from "../libraries/math/WadRayMath.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {ValidationLogic} from "../libraries/logic/ValidationLogic.sol";
import {ReserveLogic} from "../libraries/logic/ReserveLogic.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {UserConfiguration} from "../libraries/configuration/UserConfiguration.sol";
import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
import {LendingPoolStorage} from "./LendingPoolStorage.sol";

import {IBaseStrategy} from "../../interfaces/IBaseStrategy.sol";

import {AssetMappings} from "./AssetMappings.sol";
//import "hardhat/console.sol";

/**
 * @title LendingPoolCollateralManager contract
 * @author Aave
 * @dev Implements actions involving management of collateral in the protocol, the main one being the liquidations
 * IMPORTANT This contract will run always via DELEGATECALL, through the LendingPool, so the chain of inheritance
 * is the same as the LendingPool, to have compatible storage layouts
 **/
contract LendingPoolCollateralManager is
    ILendingPoolCollateralManager,
    VersionedInitializable,
    LendingPoolStorage
{
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
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
        uint256 userStableDebt;
        uint256 userVariableDebt;
        uint256 maxLiquidatableDebt;
        uint256 actualDebtToLiquidate;
        uint256 liquidationRatio;
        uint256 maxAmountCollateralToLiquidate;
        uint256 userStableRate;
        uint256 maxCollateralToLiquidate;
        uint256 debtAmountNeeded;
        uint256 healthFactor;
        uint256 liquidatorPreviousATokenBalance;
        IAToken collateralAtoken;
        bool isCollateralEnabled;
        DataTypes.InterestRateMode borrowRateMode;
        uint256 errorCode;
        string errorMsg;
        AssetMappings _assetMappings;
        address debtAsset;
        address collateralAsset;
    }

    /**
     * @dev As thIS contract extends the VersionedInitializable contract to match the state
     * of the LendingPool contract, the getRevision() function is needed, but the value is not
     * important, as the initialize() function will never be called here
     */
    function getRevision() internal pure override returns (uint256) {
        return 0;
    }

    function getUserCurrentDebt(
        address user,
        DataTypes.ReserveData storage reserve
    ) internal view returns (uint256, uint256) {
        return (
            IERC20(reserve.stableDebtTokenAddress).balanceOf(user),
            IERC20(reserve.variableDebtTokenAddress).balanceOf(user)
        );
    }

    /**
     * @dev Function to liquidate a position if its Health Factor drops below 1
     * - The caller (liquidator) covers `debtToCover` amount of debt of the user getting liquidated, and receives
     *   a proportionally amount of the `collateralAsset` plus a bonus to cover market risk
     * @param collateralAsset The address of the underlying asset used as collateral, to receive as result of the liquidation
     * @param debtAsset The address of the underlying borrowed asset to be repaid with the liquidation
     * @param user The address of the borrower getting liquidated
     * @param debtToCover The debt amount of borrowed `asset` the liquidator wants to cover
     * @param receiveAToken `true` if the liquidators wants to receive the collateral aTokens, `false` if he wants
     * to receive the underlying collateral asset directly
     **/
    function liquidationCall(
        address collateralAsset,
        address debtAsset,
        uint64 trancheId,
        // uint8 debtAssetTranche, //this would actually be the same trancheId as the collateral (you can only borrow from the same trancheId that your collateral is in)
        address user,
        uint256 debtToCover,
        bool receiveAToken
    ) external override returns (uint256, string memory) {
        DataTypes.UserConfigurationMap storage userConfig = _usersConfig[user][
            trancheId
        ];

        LiquidationCallLocalVars memory vars;
        {
            vars._assetMappings = _assetMappings;
            vars.debtAsset = debtAsset;
            vars.collateralAsset = collateralAsset;
        }
        

        { //health factor is based on lowest collateral value between twap and chainlink
            (, , , , vars.healthFactor,) = GenericLogic.calculateUserAccountData(
                DataTypes.AcctTranche(user, trancheId),
                _reserves,
                userConfig,
                _reservesList[trancheId],
                _reservesCount[trancheId],
                _addressesProvider,
                vars._assetMappings,
                false //liquidations don't want to use twap
            );
        }

        DataTypes.ReserveData storage collateralReserve = _reserves[
            vars.collateralAsset
        ][trancheId];
        DataTypes.ReserveData storage debtReserve = _reserves[vars.debtAsset][
            trancheId
        ];

        (vars.userStableDebt, vars.userVariableDebt) = getUserCurrentDebt(
            user,
            debtReserve
        );

        (vars.errorCode, vars.errorMsg) = ValidationLogic
            .validateLiquidationCall(
                collateralReserve,
                debtReserve,
                userConfig,
                vars.healthFactor,
                vars.userStableDebt,
                vars.userVariableDebt
            );

        if (
            Errors.CollateralManagerErrors(vars.errorCode) !=
            Errors.CollateralManagerErrors.NO_ERROR
        ) {
//            console.log("Error in validating liquidation: ", vars.errorMsg);
            return (vars.errorCode, vars.errorMsg);
        }

        vars.collateralAtoken = IAToken(collateralReserve.aTokenAddress);

        vars.userCollateralBalance = vars.collateralAtoken.balanceOf(user);

        //user's total debt * 50% (you can only liquidate half of user's debt)
        vars.maxLiquidatableDebt = vars
            .userStableDebt
            .add(vars.userVariableDebt)
            .percentMul(LIQUIDATION_CLOSE_FACTOR_PERCENT);

//        console.log("maxLiquidatableDebt: ",vars.maxLiquidatableDebt);
//        console.log("debtToCover: ",debtToCover);

        vars.actualDebtToLiquidate = debtToCover > vars.maxLiquidatableDebt
            ? vars.maxLiquidatableDebt
            : debtToCover;

        (
            vars.maxCollateralToLiquidate, //considers exchange rate between debt token and collateral
            vars.debtAmountNeeded
        ) = _calculateAvailableCollateralToLiquidate(
            vars.collateralAsset,
            vars.debtAsset,
            vars.actualDebtToLiquidate,
            vars.userCollateralBalance
        );
//        console.log("vars.debtAmountNeeded: ",vars.debtAmountNeeded);

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
                .balanceOf(address(vars.collateralAtoken));

            // there is a strategy associated with the collateral token, add the balance of strategy
            // to available collateral
            if (IAToken(vars.collateralAtoken).getStrategy() != address(0)) {
                currentAvailableCollateral = currentAvailableCollateral.add(
                    IBaseStrategy(IAToken(vars.collateralAtoken).getStrategy())
                        .balanceOf()
                );
            }
            if (currentAvailableCollateral < vars.maxCollateralToLiquidate) {
//                console.log("Error in validating liquidation 2: LPCM_NOT_ENOUGH_LIQUIDITY_TO_LIQUIDATE");
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
//            console.log("actualDebtToLiquidate", vars.actualDebtToLiquidate);
            IVariableDebtToken(debtReserve.variableDebtTokenAddress).burn(
                user,
                vars.actualDebtToLiquidate,
                debtReserve.variableBorrowIndex
            );
        } else {
            // If the user doesn't have variable debt, no need to try to burn variable debt tokens
            if (vars.userVariableDebt > 0) {
                IVariableDebtToken(debtReserve.variableDebtTokenAddress).burn(
                    user,
                    vars.userVariableDebt,
                    debtReserve.variableBorrowIndex
                );
            }
            IStableDebtToken(debtReserve.stableDebtTokenAddress).burn(
                user,
                vars.actualDebtToLiquidate.sub(vars.userVariableDebt)
            );
        }
        debtReserve.updateInterestRates(
            vars.debtAsset,
            debtReserve.aTokenAddress,
            vars.actualDebtToLiquidate,
            0,
            vars._assetMappings.getVMEXReserveFactor(vars.debtAsset)
        );

        if (receiveAToken) {
            vars.liquidatorPreviousATokenBalance = IERC20(vars.collateralAtoken)
                .balanceOf(msg.sender);
            vars.collateralAtoken.transferOnLiquidation(
                user,
                msg.sender,
                vars.maxCollateralToLiquidate
            );

            if (vars.liquidatorPreviousATokenBalance == 0) {
                DataTypes.UserConfigurationMap
                    storage liquidatorConfig = _usersConfig[msg.sender][
                        trancheId
                    ];
                liquidatorConfig.setUsingAsCollateral(
                    collateralReserve.id,
                    true
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
                vars.collateralAsset,
                address(vars.collateralAtoken),
                0,
                vars.maxCollateralToLiquidate,
                vars._assetMappings.getVMEXReserveFactor(vars.collateralAsset)
            );
            // Burn the equivalent amount of aToken, sending the underlying to the liquidator
            vars.collateralAtoken.burn(
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

//        console.log("Liquidation no error!");

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
     *         debtAmountNeeded: The amount to repay with the liquidation
     **/
    function _calculateAvailableCollateralToLiquidate(
        address collateralAsset,
        address debtAsset,
        uint256 debtToCover,
        uint256 userCollateralBalance
    ) internal view returns (uint256, uint256) {
        uint256 collateralAmount = 0;
        uint256 debtAmountNeeded = 0;

        AvailableCollateralToLiquidateLocalVars memory vars;
        {
            address oracleAddress = _addressesProvider.getPriceOracle(); //using just chainlink current price oracle, not using 24 hour twap

            IPriceOracleGetter oracle = IPriceOracleGetter(oracleAddress);
            vars.collateralPrice = oracle.getAssetPrice(collateralAsset);

            oracleAddress = _addressesProvider.getPriceOracle(
            );

            oracle = IPriceOracleGetter(oracleAddress);
            vars.debtAssetPrice = oracle.getAssetPrice(debtAsset);
        }
        (
            ,
            ,
            vars.liquidationBonus,
            vars.collateralDecimals,

        ) = _assetMappings.getParams(collateralAsset);
        vars.debtAssetDecimals = _assetMappings.getDecimals(debtAsset);

        // This is the maximum possible amount of the selected collateral that can be liquidated, given the
        // max amount of liquidatable debt
        vars.maxAmountCollateralToLiquidate = vars
            .debtAssetPrice
            .mul(debtToCover)
            .mul(10**vars.collateralDecimals)
            .percentMul(vars.liquidationBonus)
            .div(vars.collateralPrice.mul(10**vars.debtAssetDecimals));

        if (vars.maxAmountCollateralToLiquidate > userCollateralBalance) {
            collateralAmount = userCollateralBalance;
            debtAmountNeeded = vars
                .collateralPrice
                .mul(collateralAmount)
                .mul(10**vars.debtAssetDecimals)
                .div(vars.debtAssetPrice.mul(10**vars.collateralDecimals))
                .percentDiv(vars.liquidationBonus);
        } else {
            collateralAmount = vars.maxAmountCollateralToLiquidate;
            debtAmountNeeded = debtToCover;
        }
        return (collateralAmount, debtAmountNeeded);
    }
}
