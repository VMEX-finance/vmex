// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {SafeMath} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {ReserveLogic} from "./ReserveLogic.sol";
import {GenericLogic} from "./GenericLogic.sol";
import {WadRayMath} from "../math/WadRayMath.sol";
import {PercentageMath} from "../math/PercentageMath.sol";
import {SafeERC20} from "../../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {ReserveConfiguration} from "../configuration/ReserveConfiguration.sol";
import {UserConfiguration} from "../configuration/UserConfiguration.sol";
import {Errors} from "../helpers/Errors.sol";
import {IReserveInterestRateStrategy} from "../../../interfaces/IReserveInterestRateStrategy.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {AssetMappings} from "../../lendingpool/AssetMappings.sol";
import {IAToken} from "../../../interfaces/IAToken.sol";
import {IVariableDebtToken} from "../../../interfaces/IVariableDebtToken.sol";

/**
 * @title ReserveLogic library
 * @author Aave
 * @notice Implements functions to validate the different actions of the protocol
 */
library ValidationLogic {
    using ReserveLogic for DataTypes.ReserveData;
    using SafeMath for uint256;
    using WadRayMath for uint256;
    using PercentageMath for uint256;
    using SafeERC20 for IERC20;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using UserConfiguration for DataTypes.UserConfigurationMap;

    uint256 public constant REBALANCE_UP_LIQUIDITY_RATE_THRESHOLD = 4000;
    uint256 public constant REBALANCE_UP_USAGE_RATIO_THRESHOLD = 0.95 * 1e27; //usage ratio of 95%

    /**
     * @dev Validates a deposit action
     * @param reserve The reserve object on which the user is depositing
     * @param amount The amount to be deposited
     */
    function validateDeposit(
        address asset,
        DataTypes.ReserveData storage reserve,
        uint256 amount,
        AssetMappings _assetMappings
    ) external view {
        (bool isActive, bool isFrozen, , ) = reserve.configuration.getFlags();

        require(amount != 0, Errors.VL_INVALID_AMOUNT);
        require(isActive, Errors.VL_NO_ACTIVE_RESERVE);
        require(!isFrozen, Errors.VL_RESERVE_FROZEN);

        uint256 supplyCap = _assetMappings.getSupplyCap(asset);
        require(
        supplyCap == 0 ||
            (IAToken(reserve.aTokenAddress).totalSupply() + amount) <=
            supplyCap * (10**_assetMappings.getDecimals(asset)),
        Errors.SUPPLY_CAP_EXCEEDED
        );
    }

    /**
     * @dev Validates a withdraw action
     * @param reserveAddress The address of the reserve
     * @param amount The amount to be withdrawn
     * @param userBalance The balance of the user
     * @param reservesData The reserves state
     * @param userConfig The user configuration
     * @param reserves The addresses of the reserves
     * @param reservesCount The number of reserves
     * @param _addressesProvider The price oracle
     */
    function validateWithdraw(
        address reserveAddress,
        uint64 trancheId,
        uint256 amount,
        uint256 userBalance,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap storage userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount,
        ILendingPoolAddressesProvider _addressesProvider,
        AssetMappings _assetMappings
    ) external view {
        require(amount != 0, Errors.VL_INVALID_AMOUNT);
        require(
            amount <= userBalance,
            Errors.VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE
        );

        (bool isActive, , , ) = reservesData[reserveAddress][trancheId]
            .configuration
            .getFlags();
        require(isActive, Errors.VL_NO_ACTIVE_RESERVE);

        require(
            GenericLogic.balanceDecreaseAllowed(
                GenericLogic.balanceDecreaseAllowedParameters(
                    reserveAddress,
                    trancheId,
                    msg.sender,
                    amount,
                    _addressesProvider,
                    _assetMappings
                ),
                reservesData,
                userConfig,
                reserves,
                reservesCount
            ),
            Errors.VL_TRANSFER_NOT_ALLOWED
        );
    }

    struct ValidateBorrowLocalVars {
        uint256 currentLtv;
        uint256 currentLiquidationThreshold;
        uint256 amountOfCollateralNeededETH;
        uint256 userCollateralBalanceETH;
        uint256 userBorrowBalanceETH;
        uint256 availableLiquidity;
        uint256 healthFactor;
        uint256 borrowCap;
        uint256 avgBorrowFactor;

        bool isActive;
        bool isFrozen;
        bool borrowingEnabled;
        bool stableRateBorrowingEnabled;
    }

    function validateBorrow(
        DataTypes.ExecuteBorrowParams memory exvars,
        DataTypes.ReserveData storage reserve,
        uint256 amountInETH,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap storage userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount,
        ILendingPoolAddressesProvider _addressesProvider
    ) external view {
        ValidateBorrowLocalVars memory vars;

        (
            vars.isActive,
            vars.isFrozen,
            vars.borrowingEnabled,
            vars.stableRateBorrowingEnabled
        ) = reserve.configuration.getFlags();

        require(vars.isActive, Errors.VL_NO_ACTIVE_RESERVE);
        require(!vars.isFrozen, Errors.VL_RESERVE_FROZEN);
        require(exvars.amount != 0, Errors.VL_INVALID_AMOUNT);

        require(vars.borrowingEnabled, Errors.VL_BORROWING_NOT_ENABLED);

        vars.borrowCap = exvars._assetMappings.getBorrowCap(exvars.asset);

        if (vars.borrowCap != 0) {
            unchecked {
                require(IERC20(reserve.variableDebtTokenAddress).totalSupply() + exvars.amount <= vars.borrowCap * 10**exvars._assetMappings.getDecimals(exvars.asset), Errors.BORROW_CAP_EXCEEDED);
            }
        }

        (
            vars.userCollateralBalanceETH,
            vars.userBorrowBalanceETH,
            vars.currentLtv,
            vars.currentLiquidationThreshold,
            vars.healthFactor,
            vars.avgBorrowFactor
        ) = GenericLogic.calculateUserAccountData(
            DataTypes.AcctTranche(exvars.user, exvars.trancheId),
            reservesData,
            userConfig,
            reserves,
            reservesCount,
            _addressesProvider,
            exvars._assetMappings,
            true //borrows need to use twap
        );

        //(uint256(14), uint256(14), uint256(14), uint256(14), uint256(14));

        require(
            vars.userCollateralBalanceETH > 0,
            Errors.VL_COLLATERAL_BALANCE_IS_0
        );

        require(
            vars.healthFactor >
                GenericLogic.HEALTH_FACTOR_LIQUIDATION_THRESHOLD,
            Errors.VL_HEALTH_FACTOR_LOWER_THAN_LIQUIDATION_THRESHOLD
        );

        //add the current already borrowed amount to the amount requested to calculate the total collateral needed.
        vars.amountOfCollateralNeededETH = vars
            .userBorrowBalanceETH
            .percentMul(vars.avgBorrowFactor)
            .add(amountInETH.percentMul(exvars._assetMappings.getBorrowFactor(exvars.asset))) //this amount that we are borrowing also has a borrow factor that increases the actual debt
            .percentDiv(vars.currentLtv); //LTV is calculated in percentage

        require(
            vars.amountOfCollateralNeededETH <= vars.userCollateralBalanceETH,
            Errors.VL_COLLATERAL_CANNOT_COVER_NEW_BORROW
        );
    }

    /**
     * @dev Validates a repay action
     * @param reserve The reserve state from which the user is repaying
     * @param amountSent The amount sent for the repayment. Can be an actual value or type(uint256).max
     * @param onBehalfOf The address of the user msg.sender is repaying for
     * @param variableDebt The borrow balance of the user
     */
    function validateRepay(
        DataTypes.ReserveData storage reserve,
        uint256 amountSent,
        address onBehalfOf,
        uint256 variableDebt
    ) external view {
        bool isActive = reserve.configuration.getActive();

        require(isActive, Errors.VL_NO_ACTIVE_RESERVE);

        require(amountSent > 0, Errors.VL_INVALID_AMOUNT);

        require(variableDebt > 0, Errors.VL_NO_DEBT_OF_SELECTED_TYPE);

        require(
            amountSent != type(uint256).max || msg.sender == onBehalfOf,
            Errors.VL_NO_EXPLICIT_AMOUNT_TO_REPAY_ON_BEHALF
        );
    }

    // NOTE: removed because stable rate is removed
    // /**
    //  * @dev Validates a swap of borrow rate mode.
    //  * @param reserve The reserve state on which the user is swapping the rate
    //  * @param userConfig The user reserves configuration
    //  * @param stableDebt The stable debt of the user
    //  * @param variableDebt The variable debt of the user
    //  * @param currentRateMode The rate mode of the borrow
    //  */
    // function validateSwapRateMode(
    //     DataTypes.ReserveData storage reserve,
    //     DataTypes.UserConfigurationMap storage userConfig,
    //     uint256 stableDebt,
    //     uint256 variableDebt,
    //     DataTypes.InterestRateMode currentRateMode
    // ) external view {
    //     (bool isActive, bool isFrozen, , bool stableRateEnabled) = reserve
    //         .configuration
    //         .getFlags();

    //     require(isActive, Errors.VL_NO_ACTIVE_RESERVE);
    //     require(!isFrozen, Errors.VL_RESERVE_FROZEN);

    //     if (currentRateMode == DataTypes.InterestRateMode.STABLE) {
    //         require(stableDebt > 0, Errors.VL_NO_STABLE_RATE_LOAN_IN_RESERVE);
    //     } else if (currentRateMode == DataTypes.InterestRateMode.VARIABLE) {
    //         require(
    //             variableDebt > 0,
    //             Errors.VL_NO_VARIABLE_RATE_LOAN_IN_RESERVE
    //         );
    //         /**
    //          * user wants to swap to stable, before swapping we need to ensure that
    //          * 1. stable borrow rate is enabled on the reserve
    //          * 2. user is not trying to abuse the reserve by depositing
    //          * more collateral than he is borrowing, artificially lowering
    //          * the interest rate, borrowing at variable, and switching to stable
    //          **/
    //         require(stableRateEnabled, Errors.VL_STABLE_BORROWING_NOT_ENABLED);

    //         require(
    //             !userConfig.isUsingAsCollateral(reserve.id) ||
    //                 reserve.configuration.getLtv() == 0 ||
    //                 stableDebt.add(variableDebt) >
    //                 IERC20(reserve.aTokenAddress).balanceOf(msg.sender),
    //             Errors.VL_COLLATERAL_SAME_AS_BORROWING_CURRENCY
    //         );
    //     } else {
    //         revert(Errors.VL_INVALID_INTEREST_RATE_MODE_SELECTED);
    //     }
    // }

    // /**
    //  * @dev Validates a stable borrow rate rebalance action
    //  * @param reserve The reserve state on which the user is getting rebalanced
    //  * @param reserveAddress The address of the reserve
    //  * @param stableDebtToken The stable debt token instance
    //  * @param variableDebtToken The variable debt token instance
    //  * @param aTokenAddress The address of the aToken contract
    //  */
    // function validateRebalanceStableBorrowRate(
    //     DataTypes.ReserveData storage reserve,
    //     address reserveAddress,
    //     IERC20 stableDebtToken,
    //     IERC20 variableDebtToken,
    //     address aTokenAddress
    // ) external view {
    //     (bool isActive, , , ) = reserve.configuration.getFlags();

    //     require(isActive, Errors.VL_NO_ACTIVE_RESERVE);

    //     //if the usage ratio is below 95%, no rebalances are needed
    //     uint256 totalDebt = stableDebtToken
    //         .totalSupply()
    //         .add(variableDebtToken.totalSupply())
    //         .wadToRay();
    //     uint256 availableLiquidity = IERC20(reserveAddress)
    //         .balanceOf(aTokenAddress)
    //         .wadToRay();
    //     uint256 usageRatio = totalDebt == 0
    //         ? 0
    //         : totalDebt.rayDiv(availableLiquidity.add(totalDebt));

    //     //if the liquidity rate is below REBALANCE_UP_THRESHOLD of the max variable APR at 95% usage,
    //     //then we allow rebalancing of the stable rate positions.

    //     uint256 currentLiquidityRate = reserve.currentLiquidityRate;
    //     uint256 maxVariableBorrowRate = IReserveInterestRateStrategy(
    //         reserve.interestRateStrategyAddress
    //     ).getMaxVariableBorrowRate();

    //     require(
    //         usageRatio >= REBALANCE_UP_USAGE_RATIO_THRESHOLD &&
    //             currentLiquidityRate <=
    //             maxVariableBorrowRate.percentMul(
    //                 REBALANCE_UP_LIQUIDITY_RATE_THRESHOLD
    //             ),
    //         Errors.LP_INTEREST_RATE_REBALANCE_CONDITIONS_NOT_MET
    //     );
    // }

    /**
     * @dev Validates the action of setting an asset as collateral
     * @param reserve The state of the reserve that the user is enabling or disabling as collateral
     * @param reserveAddress The address of the reserve
     * @param reservesData The data of all the reserves
     * @param userConfig The state of the user for the specific reserve
     * @param reserves The addresses of all the active reserves
     * @param _addressesProvider The price oracle
     */
    function validateSetUseReserveAsCollateral(
        DataTypes.ReserveData storage reserve,
        address reserveAddress,
        bool useAsCollateral,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap storage userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount,
        ILendingPoolAddressesProvider _addressesProvider,
        AssetMappings _assetMappings
    ) external view {
        uint256 underlyingBalance = IERC20(reserve.aTokenAddress).balanceOf(
            msg.sender
        );

        require(
            underlyingBalance > 0,
            Errors.VL_UNDERLYING_BALANCE_NOT_GREATER_THAN_0
        );

        require(
            useAsCollateral ||
                GenericLogic.balanceDecreaseAllowed(
                    GenericLogic.balanceDecreaseAllowedParameters(
                        reserveAddress,
                        reserve.trancheId,
                        msg.sender,
                        underlyingBalance,
                        _addressesProvider,
                        _assetMappings
                    ),
                    reservesData,
                    userConfig,
                    reserves,
                    reservesCount
                ),
            Errors.VL_DEPOSIT_ALREADY_IN_USE
        );
    }

    /**
     * @dev Validates a flashloan action
     * @param assets The assets being flashborrowed
     * @param amounts The amounts for each asset being borrowed
     **/
    function validateFlashloan(
        address[] memory assets,
        uint256[] memory amounts
    ) internal pure {
        require(
            assets.length == amounts.length,
            Errors.VL_INCONSISTENT_FLASHLOAN_PARAMS
        );
    }

    /**
     * @dev Validates the liquidation action
     * @param collateralReserve The reserve data of the collateral
     * @param principalReserve The reserve data of the principal
     * @param userConfig The user configuration
     * @param userHealthFactor The user's health factor
     * @param userStableDebt Total stable debt balance of the user
     * @param userVariableDebt Total variable debt balance of the user
     **/
    function validateLiquidationCall(
        DataTypes.ReserveData storage collateralReserve,
        DataTypes.ReserveData storage principalReserve,
        DataTypes.UserConfigurationMap storage userConfig,
        uint256 userHealthFactor,
        uint256 userStableDebt,
        uint256 userVariableDebt
    ) internal view returns (uint256, string memory) {
        if (
            !collateralReserve.configuration.getActive() ||
            !principalReserve.configuration.getActive()
        ) {
            return (
                uint256(Errors.CollateralManagerErrors.NO_ACTIVE_RESERVE),
                Errors.VL_NO_ACTIVE_RESERVE
            );
        }

        if (
            userHealthFactor >= GenericLogic.HEALTH_FACTOR_LIQUIDATION_THRESHOLD
        ) {
            return (
                uint256(
                    Errors.CollateralManagerErrors.HEALTH_FACTOR_ABOVE_THRESHOLD
                ),
                Errors.LPCM_HEALTH_FACTOR_NOT_BELOW_THRESHOLD
            );
        }

        bool isCollateralEnabled = collateralReserve
            .configuration
            .getCollateralEnabled() &&
            userConfig.isUsingAsCollateral(collateralReserve.id);

        //if collateral isn't enabled as collateral by user, it cannot be liquidated
        if (!isCollateralEnabled) {
            return (
                uint256(
                    Errors
                        .CollateralManagerErrors
                        .COLLATERAL_CANNOT_BE_LIQUIDATED
                ),
                Errors.LPCM_COLLATERAL_CANNOT_BE_LIQUIDATED
            );
        }

        if (userStableDebt == 0 && userVariableDebt == 0) {
            return (
                uint256(Errors.CollateralManagerErrors.CURRRENCY_NOT_BORROWED),
                Errors.LPCM_SPECIFIED_CURRENCY_NOT_BORROWED_BY_USER
            );
        }

        return (
            uint256(Errors.CollateralManagerErrors.NO_ERROR),
            Errors.LPCM_NO_ERRORS
        );
    }

    /**
     * @dev Validates an aToken transfer
     * @param from The user from which the aTokens are being transferred
     * @param reservesData The state of all the reserves
     * @param userConfig The state of the user for the specific reserve
     * @param reserves The addresses of all the active reserves
     * @param _addressesProvider The price oracle
     */
    function validateTransfer(
        address from,
        uint64 trancheId,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap storage userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount,
        ILendingPoolAddressesProvider _addressesProvider,
        AssetMappings _assetMappings
    ) internal view {
        (, , , , uint256 healthFactor,) = GenericLogic.calculateUserAccountData(
            DataTypes.AcctTranche(from, trancheId),
            reservesData,
            userConfig,
            reserves,
            reservesCount,
            _addressesProvider,
            _assetMappings,
            true //same logic as withdraws
        );
        // uint256 healthFactor = 1;
        require(
            healthFactor >= GenericLogic.HEALTH_FACTOR_LIQUIDATION_THRESHOLD,
            Errors.VL_TRANSFER_NOT_ALLOWED
        );
    }
}
