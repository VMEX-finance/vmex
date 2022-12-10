// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {SafeMath} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {WadRayMath} from "../math/WadRayMath.sol";
import {PercentageMath} from "../math/PercentageMath.sol";
import {SafeERC20} from "../../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {ReserveConfiguration} from "../configuration/ReserveConfiguration.sol";
import {UserConfiguration} from "../configuration/UserConfiguration.sol";
import {Errors} from "../helpers/Errors.sol";
import {IReserveInterestRateStrategy} from "../../../interfaces/IReserveInterestRateStrategy.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {ReserveLogic} from "./ReserveLogic.sol";
import {ValidationLogic} from "./ValidationLogic.sol";
import {IAToken} from "../../../interfaces/IAToken.sol";
import {IPriceOracleGetter} from "../../../interfaces/IPriceOracleGetter.sol";
import {IStableDebtToken} from "../../../interfaces/IStableDebtToken.sol";
import {IVariableDebtToken} from "../../../interfaces/IVariableDebtToken.sol";
import {IFlashLoanReceiver} from "../../../flashloan/interfaces/IFlashLoanReceiver.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {GenericLogic} from "./GenericLogic.sol";
import {AssetMappings} from "../../lendingpool/AssetMappings.sol";
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
     * @param trancheId The trancheId of the reserve
     * @param user The address of the user enabling the usage as collateral
     **/
    event ReserveUsedAsCollateralEnabled(
        address indexed reserve,
        uint64 trancheId,
        address indexed user
    );

    function _deposit(
        DataTypes.ReserveData storage self,
        DataTypes.DepositVars memory vars,
        DataTypes.UserConfigurationMap storage user
    ) external {
        ValidationLogic.validateDeposit(self, vars.amount);

        address aToken = self.aTokenAddress;

        // if (assetData.isLendable) {
        //these will simply not be used for collateral vault, and even if it is, it won't change anything, so this will just save gas
        self.updateState();
        self.updateInterestRates(vars.asset, aToken, vars.amount, 0);
        {
            address oracle = ILendingPoolAddressesProvider(vars._addressesProvider).getPriceOracle(
                        AssetMappings(ILendingPoolAddressesProvider(vars._addressesProvider).getAssetMappings()).getAssetType(vars.asset)
                    );
            IPriceOracleGetter(oracle).updateTWAP(vars.asset);
        }

        // }

        IERC20(vars.asset).safeTransferFrom(msg.sender, aToken, vars.amount); //msg.sender should still be the user, not the contract

        bool isFirstDeposit = IAToken(aToken).mint(
            vars.onBehalfOf,
            vars.amount,
            self.liquidityIndex
        ); //this also considers if it is a first deposit into a trancheId, not just a specific asset

        if (isFirstDeposit) {
            user.setUsingAsCollateral(self.id, true); //default collateral is true
        }
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

    function _withdraw(
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage _reserves,
        DataTypes.UserConfigurationMap storage user,
        mapping(uint256 => address) storage _reservesList,
        DataTypes.WithdrawParams memory vars,
        ILendingPoolAddressesProvider _addressesProvider
    ) public returns (uint256) {
        DataTypes.ReserveData storage reserve = _reserves[vars.asset][
            vars.trancheId
        ];
        address aToken = reserve.aTokenAddress;

        uint256 userBalance = IAToken(aToken).balanceOf(msg.sender);
        //balanceOf actually multiplies the atokens that the user has by the liquidity index.
        //User A deposits 1000 DAI at the liquidity index of 1.1. He is actually minted 1000/1.1 = 909 scaled aTokens. But when he checks his balance, he finds 909 *1.1 = 1000
        //User B deposits another amount into the same pool. The liquidity index is now 1.2. User A now checks 909*1.2 = 1090.9, so he gets "interest" despite his scaled aTokens remaining the same
        //liquidityIndex is not 1 to 1 with pool amount. So there are additional funds left in pool in above case.

        if (vars.amount == type(uint256).max) {
            vars.amount = userBalance; //amount to withdraw
        }

        ValidationLogic.validateWithdraw(
            vars.asset,
            vars.trancheId,
            vars.amount,
            userBalance,
            _reserves,
            user,
            _reservesList,
            vars._reservesCount,
            _addressesProvider
        );

        reserve.updateState();
        reserve.updateInterestRates(vars.asset, aToken, 0, vars.amount);

        {
            address oracle = ILendingPoolAddressesProvider(_addressesProvider).getPriceOracle(
                        AssetMappings(_addressesProvider.getAssetMappings()).getAssetType(vars.asset)
                    );
            IPriceOracleGetter(oracle).updateTWAP(vars.asset);
        }

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

    function _borrowHelper(
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage _reserves,
        mapping(uint256 => address) storage _reservesList,
        DataTypes.UserConfigurationMap storage userConfig,
        ILendingPoolAddressesProvider _addressesProvider,
        DataTypes.ExecuteBorrowParams memory vars
    ) public {
        {
            address oracle = ILendingPoolAddressesProvider(_addressesProvider).getPriceOracle(
                        AssetMappings(_addressesProvider.getAssetMappings()).getAssetType(vars.asset)
                    );
            IPriceOracleGetter(oracle).updateTWAP(vars.asset);
        }

        DataTypes.ReserveData storage reserve = _reserves[vars.asset][
            vars.trancheId
        ];

        //The mocks are in ETH, but when deploying to mainnet we probably want to convert to USD
        //This is really amount in WEI. getAssetPrice gets the asset price in wei
        //The units are consistent. The reserve decimals will be the lp token decimals (usually 18). Then it's basically like multiplying some small 1.02 or some factor to the geometric mean wei price. By dividing by 10**decimals we are getting back wei.

        uint256 amountInETH = IPriceOracleGetter( //if we change the address of the oracle to give the price in usd, it should still work
            _addressesProvider.getPriceOracle(
                AssetMappings(_addressesProvider.getAssetMappings()).getAssetType(vars.asset)
            )
        ).getAssetPrice(vars.asset).mul(vars.amount).div(
                10**reserve.configuration.getDecimals()
            ); //lp token decimals are 18, like ETH

        ValidationLogic.validateBorrow(
            vars,
            reserve,
            amountInETH,
            _reserves,
            userConfig,
            _reservesList,
            vars._reservesCount,
            _addressesProvider
        );

        reserve.updateState();

        bool isFirstBorrowing = IVariableDebtToken(
                reserve.variableDebtTokenAddress
            ).mint(
                    vars.user,
                    vars.onBehalfOf,
                    vars.amount,
                    reserve.variableBorrowIndex
                );

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
    }
}
