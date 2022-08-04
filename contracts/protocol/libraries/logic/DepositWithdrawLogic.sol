// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {
    SafeMath
} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {WadRayMath} from "../math/WadRayMath.sol";
import {PercentageMath} from "../math/PercentageMath.sol";
import {
    SafeERC20
} from "../../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {ReserveConfiguration} from "../configuration/ReserveConfiguration.sol";
import {UserConfiguration} from "../configuration/UserConfiguration.sol";
import {Errors} from "../helpers/Errors.sol";
import {Helpers} from "../helpers/Helpers.sol";
import {
    IReserveInterestRateStrategy
} from "../../../interfaces/IReserveInterestRateStrategy.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {ReserveLogic} from "./ReserveLogic.sol";
import {ValidationLogic} from "./ValidationLogic.sol";
import {IAToken} from "../../../interfaces/IAToken.sol";
import {IPriceOracleGetter} from "../../../interfaces/IPriceOracleGetter.sol";
import {IStableDebtToken} from "../../../interfaces/IStableDebtToken.sol";
import {IVariableDebtToken} from "../../../interfaces/IVariableDebtToken.sol";

/**
 * @title DepositWithdrawLogic library
 * @author VMEX
 * @notice Implements functions to deposit and withdraw
 */
library DepositWithdrawLogic {
    using SafeMath for uint256;
    using WadRayMath for uint256;
    using PercentageMath for uint256;
    using SafeERC20 for IERC20;
    using ReserveLogic for *;
    using UserConfiguration for *;
    using ReserveConfiguration for *;

    /**
     * @dev Emitted on setUserUseReserveAsCollateral()
     * @param reserve The address of the underlying asset of the reserve
     * @param user The address of the user enabling the usage as collateral
     **/
    event ReserveUsedAsCollateralEnabled(
        address indexed reserve,
        address indexed user
    );

    /**
     * @dev Emitted on deposit()
     * @param reserve The address of the underlying asset of the reserve
     * @param user The address initiating the deposit
     * @param onBehalfOf The beneficiary of the deposit, receiving the aTokens
     * @param amount The amount deposited
     * @param referral The referral code used
     **/
    event Deposit(
        address indexed reserve,
        uint8 tranche,
        address user,
        address indexed onBehalfOf,
        uint256 amount,
        uint16 indexed referral
    );

    function _deposit(
        DataTypes.ReserveData storage self,
        DataTypes.DepositVars memory vars,
        bool isCollateral,
        uint256 amount,
        address onBehalfOf,
        DataTypes.UserConfigurationMap storage user,
        uint16 referralCode
    ) external {
        ValidationLogic.validateDeposit(self, amount);

        address aToken = self.aTokenAddress;

        if (vars.isLendable) {
            //these will simply not be used for collateral vault
            self.updateState();
            self.updateInterestRates(vars.asset, aToken, amount, 0);
        }

        IERC20(vars.asset).safeTransferFrom(msg.sender, aToken, amount); //msg.sender should still be the user, not the contract

        bool isFirstDeposit =
            IAToken(aToken).mint(onBehalfOf, amount, self.liquidityIndex); //this also considers if it is a first deposit into a tranche, not just a specific asset

        if (isFirstDeposit) {
            if (!vars.isLendable) {
                //non lendable assets must be collateral
                isCollateral = true;
            }
            ValidationLogic.validateCollateralRisk(
                isCollateral,
                vars.risk,
                vars.tranche,
                vars.allowHigherTranche
            );
            user.setUsingAsCollateral(self.id, isCollateral);
            if (isCollateral) {
                emit ReserveUsedAsCollateralEnabled(vars.asset, onBehalfOf);
            }
        }

        emit Deposit(
            vars.asset,
            vars.tranche,
            msg.sender,
            onBehalfOf,
            amount,
            referralCode
        );
    }

    /**
     * @dev Emitted on setUserUseReserveAsCollateral()
     * @param reserve The address of the underlying asset of the reserve
     * @param user The address of the user enabling the usage as collateral
     **/
    event ReserveUsedAsCollateralDisabled(
        address indexed reserve,
        address indexed user
    );

    /**
     * @dev Emitted on withdraw()
     * @param reserve The address of the underlyng asset being withdrawn
     * @param user The address initiating the withdrawal, owner of aTokens
     * @param to Address that will receive the underlying
     * @param amount The amount to be withdrawn
     **/
    event Withdraw(
        address indexed reserve,
        address indexed user,
        address indexed to,
        uint256 amount
    );

    function _withdraw(
        mapping(address => mapping(uint8 => DataTypes.ReserveData))
            storage _reserves,
        DataTypes.UserConfigurationMap storage user,
        mapping(uint256 => address) storage _reservesList,
        DataTypes.WithdrawParams memory vars
    ) public returns (uint256) {
        DataTypes.ReserveData storage reserve =
            _reserves[vars.asset][vars.tranche];
        address aToken = reserve.aTokenAddress;

        uint256 userBalance = IAToken(aToken).balanceOf(msg.sender);

        uint256 amountToWithdraw = vars.amount;

        if (vars.amount == type(uint256).max) {
            amountToWithdraw = userBalance;
        }

        ValidationLogic.validateWithdraw(
            vars.asset,
            vars.tranche,
            amountToWithdraw,
            userBalance,
            _reserves,
            user,
            _reservesList,
            vars._reservesCount,
            vars.oracle
        );

        reserve.updateState();

        reserve.updateInterestRates(vars.asset, aToken, 0, amountToWithdraw);

        if (amountToWithdraw == userBalance) {
            user.setUsingAsCollateral(reserve.id, false);
            emit ReserveUsedAsCollateralDisabled(vars.asset, msg.sender);
        }

        IAToken(aToken).burn(
            msg.sender,
            vars.to,
            amountToWithdraw,
            reserve.liquidityIndex
        );

        emit Withdraw(vars.asset, msg.sender, vars.to, amountToWithdraw);

        return amountToWithdraw;
    }

    /**
     * @dev Emitted on borrow() and flashLoan() when debt needs to be opened
     * @param reserve The address of the underlying asset being borrowed
     * @param user The address of the user initiating the borrow(), receiving the funds on borrow() or just
     * initiator of the transaction on flashLoan()
     * @param onBehalfOf The address that will be getting the debt
     * @param amount The amount borrowed out
     * @param borrowRateMode The rate mode: 1 for Stable, 2 for Variable
     * @param borrowRate The numeric rate at which the user has borrowed
     * @param referral The referral code used
     **/
    event Borrow(
        address indexed reserve,
        address user,
        address indexed onBehalfOf,
        uint256 amount,
        uint256 borrowRateMode,
        uint256 borrowRate,
        uint16 indexed referral
    );

    function _borrowHelper(
        mapping(address => mapping(uint8 => DataTypes.ReserveData))
            storage _reserves,
        mapping(uint256 => address) storage _reservesList,
        DataTypes.UserConfigurationMap storage userConfig,
        address oracle,
        DataTypes.ExecuteBorrowParams memory vars
    ) public {
        DataTypes.ReserveData storage reserve =
            _reserves[vars.asset][vars.tranche];
        uint256 amountInETH =
            IPriceOracleGetter(oracle)
                .getAssetPrice(vars.asset)
                .mul(vars.amount)
                .div(10**reserve.configuration.getDecimals());

        // TODO: make sure this works with tranches
        ValidationLogic.validateBorrow(
            vars,
            reserve,
            amountInETH,
            vars._maxStableRateBorrowSizePercent,
            _reserves,
            userConfig,
            _reservesList,
            vars._reservesCount,
            oracle
        );

        reserve.updateState();

        uint256 currentStableRate = 0;

        bool isFirstBorrowing = false;
        if (
            DataTypes.InterestRateMode(vars.interestRateMode) ==
            DataTypes.InterestRateMode.STABLE
        ) {
            currentStableRate = reserve.currentStableBorrowRate;

            isFirstBorrowing = IStableDebtToken(reserve.stableDebtTokenAddress)
                .mint(
                vars.user,
                vars.onBehalfOf,
                vars.amount,
                currentStableRate
            );
        } else {
            isFirstBorrowing = IVariableDebtToken(
                reserve
                    .variableDebtTokenAddress
            )
                .mint(
                vars.user,
                vars.onBehalfOf,
                vars.amount,
                reserve.variableBorrowIndex
            );
        }

        if (isFirstBorrowing) {
            userConfig.setBorrowing(reserve.id, true);
        }

        reserve.updateInterestRates(
            vars.asset,
            vars.aTokenAddress,
            0,
            vars.releaseUnderlying ? vars.amount : 0
        );

        if (vars.releaseUnderlying) {
            IAToken(vars.aTokenAddress).transferUnderlyingTo(
                vars.user,
                vars.amount
            );
        }

        emit Borrow(
            vars.asset,
            vars.user,
            vars.onBehalfOf,
            vars.amount,
            vars.interestRateMode,
            DataTypes.InterestRateMode(vars.interestRateMode) ==
                DataTypes.InterestRateMode.STABLE
                ? currentStableRate
                : reserve.currentVariableBorrowRate,
            vars.referralCode
        );
    }
}
