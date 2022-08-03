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
        uint8 risk,
        address asset,
        uint8 tranche,
        bool isCollateral,
        uint256 amount,
        address onBehalfOf,
        DataTypes.UserConfigurationMap storage user,
        uint16 referralCode
    ) external {
        ValidationLogic.validateDeposit(self, amount);

        address aToken = self.aTokenAddress;

        //these will simply not be used for collateral vault
        self.updateState();
        self.updateInterestRates(asset, aToken, amount, 0);

        IERC20(asset).safeTransferFrom(msg.sender, aToken, amount); //msg.sender should still be the user, not the contract

        bool isFirstDeposit =
            IAToken(aToken).mint(onBehalfOf, amount, self.liquidityIndex); //this also considers if it is a first deposit into a tranche, not just a specific asset

        if (isFirstDeposit) {
            ValidationLogic.validateCollateralRisk(isCollateral, risk, tranche);
            user.setUsingAsCollateral(self.id, isCollateral);
            if (isCollateral) {
                emit ReserveUsedAsCollateralEnabled(asset, onBehalfOf);
            }
        }

        emit Deposit(
            asset,
            tranche,
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
}
