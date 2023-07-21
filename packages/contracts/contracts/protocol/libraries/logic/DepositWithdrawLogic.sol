// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {WadRayMath} from "../math/WadRayMath.sol";
import {PercentageMath} from "../math/PercentageMath.sol";
import {SafeERC20} from "../../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {ReserveConfiguration} from "../configuration/ReserveConfiguration.sol";
import {UserConfiguration} from "../configuration/UserConfiguration.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {ReserveLogic} from "./ReserveLogic.sol";
import {ValidationLogic} from "./ValidationLogic.sol";
import {IAToken} from "../../../interfaces/IAToken.sol";
import {IVariableDebtToken} from "../../../interfaces/IVariableDebtToken.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {GenericLogic} from "./GenericLogic.sol";
import {IAssetMappings} from "../../../interfaces/IAssetMappings.sol";
/**
 * @title DepositWithdrawLogic library
 * @author VMEX
 * @notice Implements functions to deposit and withdraw
 */
library DepositWithdrawLogic {
    using WadRayMath for uint256;
    using PercentageMath for uint256;
    using SafeERC20 for IERC20;
    using ReserveLogic for *;
    using UserConfiguration for *;
    using ReserveConfiguration for *;

    /**
     * @dev Emitted on setUserUseReserveAsCollateral()
     * @param reserve The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @param user The address of the user enabling the usage as collateral
     **/
    event ReserveUsedAsCollateralEnabled(
        address indexed reserve,
        uint64 trancheId,
        address indexed user
    );

    /**
     * @dev Called by deposit function in LendingPool, to save bytecode in LendingPool.sol
     **/
    function _deposit(
        DataTypes.ReserveData storage self,
        DataTypes.DepositVars memory vars,
        DataTypes.UserConfigurationMap storage user
    ) external returns(uint256){
        if (vars.amount == type(uint256).max) {
            // if amount is type(uint256).max, this indicates the user wants to deposit the maximum possible
            vars.amount = IERC20(vars.asset).balanceOf(msg.sender);
        }
        address aToken = self.aTokenAddress;

        self.updateState(vars._assetMappings.getVMEXReserveFactor(vars.asset));

        ValidationLogic.validateDeposit(vars.asset, self, vars.amount, vars._assetMappings);

        self.updateInterestRates(
            vars._assetMappings,
            vars.asset,
            vars.trancheId,
            vars.amount,
            0
        );

        IERC20(vars.asset).safeTransferFrom(msg.sender, aToken, vars.amount);

        bool isFirstDeposit = IAToken(aToken).mint(
            vars.onBehalfOf,
            vars.amount,
            self.liquidityIndex
        );

        // require the sender to be the same as onBehalfOf in order to turn collateral on
        // Response to yAudit vulnerability where attacker can deposit dust to victim to increase gas fees of a victim
        if (isFirstDeposit && vars.onBehalfOf == msg.sender) {
            // if collateral is enabled, by default the user's deposit is marked as collateral
            user.setUsingAsCollateral(self.id, self.configuration.getCollateralEnabled(vars.asset, vars._assetMappings));
        }
        return vars.amount;
    }

    /**
     * @dev Emitted on setUserUseReserveAsCollateral()
     * @param reserve The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @param user The address of the user enabling the usage as collateral
     **/
    event ReserveUsedAsCollateralDisabled(
        address indexed reserve,
        uint64 trancheId,
        address indexed user
    );

    /**
     * @dev Called by withdraw function in LendingPool, to save bytecode in LendingPool.sol
     **/
    function _withdraw(
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage _reserves,
        DataTypes.UserConfigurationMap storage user,
        mapping(uint256 => address) storage _reservesList,
        DataTypes.WithdrawParams memory vars,
        ILendingPoolAddressesProvider _addressesProvider,
        IAssetMappings _assetMappings
    ) external returns (uint256) {
        DataTypes.ReserveData storage reserve = _reserves[vars.asset][vars.trancheId];
        address aToken = reserve.aTokenAddress;

        uint256 userBalance = IAToken(aToken).balanceOf(msg.sender);

        if (vars.amount == type(uint256).max) {
            vars.amount = userBalance;
        }

        reserve.updateState(_assetMappings.getVMEXReserveFactor(vars.asset));

        ValidationLogic.validateWithdraw(
            vars.asset,
            vars.trancheId,
            vars.amount,
            userBalance,
            _reserves,
            user,
            _reservesList,
            vars._reservesCount,
            _addressesProvider,
            _assetMappings
        );

        reserve.updateInterestRates(_assetMappings, vars.asset, vars.trancheId, 0, vars.amount);

        if (vars.amount == userBalance) {
            user.setUsingAsCollateral(reserve.id, false);
            emit ReserveUsedAsCollateralDisabled(vars.asset, vars.trancheId, msg.sender);
        }

        IAToken(aToken).burn(
            msg.sender,
            vars.to,
            vars.amount,
            reserve.liquidityIndex
        );

        return vars.amount;
    }

    /**
     * @dev Called by borrow function in LendingPool, to save bytecode in LendingPool.sol
     **/
    function _borrowHelper(
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage _reserves,
        mapping(uint256 => address) storage _reservesList,
        DataTypes.UserConfigurationMap storage userConfig, //config of onBehalfOf user
        ILendingPoolAddressesProvider _addressesProvider,
        DataTypes.ExecuteBorrowParams memory vars
    ) external returns(uint256){
        DataTypes.ReserveData storage reserve = _reserves[vars.asset][vars.trancheId];

        reserve.updateState(vars._assetMappings.getVMEXReserveFactor(vars.asset));

        vars.amount = ValidationLogic.validateBorrow(
            vars,
            reserve,
            _reserves,
            userConfig,
            _reservesList,
            vars._reservesCount,
            _addressesProvider
        );

        bool isFirstBorrowing = IVariableDebtToken(
            reserve.variableDebtTokenAddress
        ).mint(
            vars.user, //msg.sender is the delegatee
            vars.onBehalfOf, //onBehalfOf is the one with collateral, takes the debt tokens on behalf of the msg.sender
            vars.amount,
            reserve.variableBorrowIndex
        );

        if (isFirstBorrowing) {
            userConfig.setBorrowing(reserve.id, true);
        }

        reserve.updateInterestRates(
            vars._assetMappings,
            vars.asset,
            vars.trancheId,
            0,
            vars.releaseUnderlying ? vars.amount : 0
        );

        if (vars.releaseUnderlying) {
            IAToken(vars.aTokenAddress).transferUnderlyingTo(
                vars.user,
                vars.amount
            );
        }

        return vars.amount;
    }
}
