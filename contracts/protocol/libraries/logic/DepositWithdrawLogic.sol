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

        self.updateState();
        self.updateInterestRates(asset, aToken, amount, 0);

        IERC20(asset).safeTransferFrom(msg.sender, aToken, amount); //msg.sender should still be the user, not the contract

        bool isFirstDeposit =
            IAToken(aToken).mint(onBehalfOf, amount, self.liquidityIndex);

        if (isFirstDeposit) {
            ValidationLogic.validateCollateralRisk(isCollateral, risk, tranche);
            user.setUsingAsCollateral(self.id, isCollateral);
            emit ReserveUsedAsCollateralEnabled(asset, onBehalfOf);
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

    // /**
    //  * @dev Emitted on setUserUseReserveAsCollateral()
    //  * @param reserve The address of the underlying asset of the reserve
    //  * @param user The address of the user enabling the usage as collateral
    //  **/
    // event ReserveUsedAsCollateralDisabled(
    //     address indexed reserve,
    //     address indexed user
    // );

    // /**
    //  * @dev Emitted on withdraw()
    //  * @param reserve The address of the underlyng asset being withdrawn
    //  * @param user The address initiating the withdrawal, owner of aTokens
    //  * @param to Address that will receive the underlying
    //  * @param amount The amount to be withdrawn
    //  **/
    // event Withdraw(
    //     address indexed reserve,
    //     address indexed user,
    //     address indexed to,
    //     uint256 amount
    // );

    // /**
    //  * @dev Withdraws an `amount` of underlying asset from the reserve, burning the equivalent aTokens owned
    //  * E.g. User has 100 aUSDC, calls withdraw() and receives 100 USDC, burning the 100 aUSDC
    //  * @param asset The address of the underlying asset to withdraw
    //  * @param amount The underlying amount to be withdrawn
    //  *   - Send the value type(uint256).max in order to withdraw the whole aToken balance
    //  * @param to Address that will receive the underlying, same as msg.sender if the user
    //  *   wants to receive it on his own wallet, or a different address if the beneficiary is a
    //  *   different wallet
    //  * @return The final amount withdrawn
    //  **/
    // function _withdraw(
    //     mapping(address => mapping(uint8 => DataTypes.ReserveData))
    //         storage _reserves,
    //     DataTypes.UserConfigurationMap storage user,
    //     mapping(uint256 => address) storage _reservesList,
    //     uint256 _reservesCount,
    //     address oracle,
    //     address asset,
    //     uint8 tranche,
    //     uint256 amount,
    //     address to
    // ) public returns (uint256) {
    //     DataTypes.ReserveData storage reserve = _reserves[asset][tranche];
    //     address aToken = reserve.aTokenAddress;

    //     uint256 userBalance = IAToken(aToken).balanceOf(msg.sender);

    //     uint256 amountToWithdraw = amount;

    //     if (amount == type(uint256).max) {
    //         amountToWithdraw = userBalance;
    //     }

    //     ValidationLogic.validateWithdraw(
    //         asset,
    //         tranche,
    //         amountToWithdraw,
    //         userBalance,
    //         _reserves,
    //         user,
    //         _reservesList,
    //         _reservesCount,
    //         oracle
    //     );

    //     reserve.updateState();

    //     reserve.updateInterestRates(asset, aToken, 0, amountToWithdraw);

    //     if (amountToWithdraw == userBalance) {
    //         user.setUsingAsCollateral(reserve.id, false);
    //         emit ReserveUsedAsCollateralDisabled(asset, msg.sender);
    //     }

    //     IAToken(aToken).burn(
    //         msg.sender,
    //         to,
    //         amountToWithdraw,
    //         reserve.liquidityIndex
    //     );

    //     emit Withdraw(asset, msg.sender, to, amountToWithdraw);

    //     return amountToWithdraw;
    // }
}
