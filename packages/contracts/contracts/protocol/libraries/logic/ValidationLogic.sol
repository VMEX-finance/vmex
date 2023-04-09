// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

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
import {DataTypes} from "../types/DataTypes.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {IAssetMappings} from "../../../interfaces/IAssetMappings.sol";
import {IAToken} from "../../../interfaces/IAToken.sol";

/**
 * @title ValidationLogic library
 * @author Aave and VMEX
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
        IAssetMappings _assetMappings
    ) external view {
        (bool isActive, bool isFrozen, ) = reserve.configuration.getFlags(asset, _assetMappings);

        require(amount != 0, Errors.VL_INVALID_AMOUNT);
        require(isActive, Errors.VL_NO_ACTIVE_RESERVE);
        require(!isFrozen, Errors.VL_RESERVE_FROZEN);

        uint256 supplyCap = _assetMappings.getSupplyCap(asset);
        // supply cap of 0 means that there is no cap, unlimited depositing is allowed
        require(
            supplyCap == 0 ||
                (IAToken(reserve.aTokenAddress).totalSupply() + amount) <=
                supplyCap * (10**_assetMappings.getDecimals(asset)),
            Errors.VL_SUPPLY_CAP_EXCEEDED
        );
    }

    /**
     * @dev Validates a withdraw action
     * @param asset The address of the asset in the reserve
     * @param trancheId The trancheId of the reserve
     * @param amount The amount to be withdrawn
     * @param userBalance The balance of the user
     * @param reservesData The reserves state
     * @param userConfig The user configuration
     * @param reserves The addresses of the reserves
     * @param reservesCount The number of reserves
     * @param _addressesProvider The addresses provider
     * @param _assetMappings The asset mappings
     */
    function validateWithdraw(
        address asset,
        uint64 trancheId,
        uint256 amount,
        uint256 userBalance,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap storage userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount,
        ILendingPoolAddressesProvider _addressesProvider,
        IAssetMappings _assetMappings
    ) external {
        require(amount != 0, Errors.VL_INVALID_AMOUNT);
        require(
            amount <= userBalance,
            Errors.VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE
        );

        (bool isActive, , ) = reservesData[asset][trancheId]
            .configuration
            .getFlags(asset, _assetMappings);
        require(isActive, Errors.VL_NO_ACTIVE_RESERVE);

        require(
            GenericLogic.balanceDecreaseAllowed(
                GenericLogic.BalanceDecreaseAllowedParameters(
                    asset,
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
        uint256 avgBorrowFactor;
        uint256 totalAmount;
        bool isActive;
        bool isFrozen;
        bool borrowingEnabled;
    }

    function checkAmount(
        uint256 borrowCap,
        uint256 amount,
        uint256 totalDebt,
        uint256 decimals
    ) internal pure {
        require(amount != 0, Errors.VL_INVALID_AMOUNT);
        if (borrowCap != 0) {
            unchecked {
                require(
                    totalDebt + amount <=
                        borrowCap * 10**decimals,
                    Errors.VL_BORROW_CAP_EXCEEDED
                );
            }
        }
    }

    function validateBorrow(
        DataTypes.ExecuteBorrowParams memory exvars,
        DataTypes.ReserveData storage reserve,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap storage userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount,
        ILendingPoolAddressesProvider _addressesProvider
    ) external returns(uint256){
        ValidateBorrowLocalVars memory vars;

        (
            vars.isActive,
            vars.isFrozen,
            vars.borrowingEnabled
        ) = reserve.configuration.getFlags(exvars.asset, exvars._assetMappings);

        require(vars.isActive, Errors.VL_NO_ACTIVE_RESERVE);
        require(!vars.isFrozen, Errors.VL_RESERVE_FROZEN);

        require(vars.borrowingEnabled, Errors.VL_BORROWING_NOT_ENABLED);

        //precheck so in case we aren't trying to borrow max, and already borrowing over the cap, don't need to run calculateUserAccountData
        if(exvars.amount!=type(uint256).max) {
            checkAmount(
                exvars._assetMappings.getBorrowCap(exvars.asset),
                exvars.amount,
                IERC20(reserve.variableDebtTokenAddress).totalSupply(),
                exvars._assetMappings.getDecimals(exvars.asset)
            );
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
            exvars._assetMappings
        );

        if(exvars.amount == type(uint256).max){
            vars.totalAmount = IERC20(exvars.asset).balanceOf(reserve.aTokenAddress);
            exvars.amount = (
                vars.userCollateralBalanceETH.percentMul(vars.currentLtv) //risk adjusted collateral
                .sub(vars.userBorrowBalanceETH.percentMul(vars.avgBorrowFactor)) //risk adjusted debt
            ) // amount available to use for borrow
            .mul(10**exvars._assetMappings.getDecimals(exvars.asset))
            .percentDiv(exvars._assetMappings.getBorrowFactor(exvars.asset)) //adjust for this asset's borrow factor, in ETH
            .div(exvars.assetPrice); //converted to native token

            if(exvars.amount>vars.totalAmount){
                exvars.amount=vars.totalAmount;
            }
            checkAmount(
                exvars._assetMappings.getBorrowCap(exvars.asset),
                exvars.amount,
                IERC20(reserve.variableDebtTokenAddress).totalSupply(),
                exvars._assetMappings.getDecimals(exvars.asset)
            );
        }
        // amountInETH always has 18 decimals (or if oracle has 8 decimals, this also has 8 decimals), since the assetPrice always has 18 decimals. Scaling by amount/asset decimals.
        uint256 amountInETH = exvars.assetPrice.mul(exvars.amount).div(
                10**exvars._assetMappings.getDecimals(exvars.asset)
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
        //risk adjusted debt
        vars.amountOfCollateralNeededETH = vars
            .userBorrowBalanceETH
            .percentMul(vars.avgBorrowFactor)
            .add(amountInETH.percentMul(exvars._assetMappings.getBorrowFactor(exvars.asset))) //this amount that we are borrowing also has a borrow factor that increases the actual debt
            .percentDiv(vars.currentLtv); //LTV is calculated in percentage

        require(
            vars.amountOfCollateralNeededETH <= vars.userCollateralBalanceETH,
            Errors.VL_COLLATERAL_CANNOT_COVER_NEW_BORROW
        );

        return exvars.amount;
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
        uint256 variableDebt,
        address asset,
        IAssetMappings a
    ) external view {
        bool isActive = reserve.configuration.getActive(asset, a);

        require(isActive, Errors.VL_NO_ACTIVE_RESERVE);

        require(amountSent > 0, Errors.VL_INVALID_AMOUNT);

        require(variableDebt > 0, Errors.VL_NO_DEBT_OF_SELECTED_TYPE);

        require(
            amountSent != type(uint256).max || msg.sender == onBehalfOf,
            Errors.VL_NO_EXPLICIT_AMOUNT_TO_REPAY_ON_BEHALF
        );
    }

    /**
     * @dev Validates the action of setting an asset as collateral
     * @param asset The address of the reserve
     * @param reservesData The data of all the reserves
     * @param userConfig The state of the user for the specific reserve
     * @param reserves The addresses of all the active reserves
     * @param _addressesProvider The price oracle
     */
    function validateSetUseReserveAsCollateral(
        address asset,
        uint64 trancheId,
        bool useAsCollateral,
        mapping(address => mapping(uint64 => DataTypes.ReserveData))
            storage reservesData,
        DataTypes.UserConfigurationMap storage userConfig,
        mapping(uint256 => address) storage reserves,
        uint256 reservesCount,
        ILendingPoolAddressesProvider _addressesProvider,
        IAssetMappings _assetMappings
    ) external {
        // if the user is trying to set the reserve as collateral, then the asset must be collateralizable
        require(!useAsCollateral || _assetMappings.getAssetCollateralizable(asset), Errors.VL_COLLATERAL_DISABLED);

        DataTypes.ReserveData storage reserve = reservesData[asset][trancheId];
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
                    GenericLogic.BalanceDecreaseAllowedParameters(
                        asset,
                        trancheId,
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
     * @dev Validates the liquidation action
     * @param collateralReserve The reserve data of the collateral
     * @param principalReserve The reserve data of the principal
     * @param userConfig The user configuration
     * @param userHealthFactor The user's health factor
     * @param userVariableDebt Total variable debt balance of the user
     **/
    function validateLiquidationCall(
        DataTypes.ReserveData storage collateralReserve,
        DataTypes.ReserveData storage principalReserve,
        DataTypes.UserConfigurationMap storage userConfig,
        uint256 userHealthFactor,
        uint256 userVariableDebt,
        address collateralAsset,
        address principalAsset,
        IAssetMappings a
    ) internal view returns (uint256, string memory) {
        if (
            !collateralReserve.configuration.getActive(collateralAsset, a) ||
            !principalReserve.configuration.getActive(principalAsset, a)
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
            .getCollateralEnabled(collateralAsset, a) &&
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

        if (userVariableDebt == 0) {
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
        IAssetMappings _assetMappings
    ) internal {
        (, , , , uint256 healthFactor,) = GenericLogic.calculateUserAccountData(
            DataTypes.AcctTranche(from, trancheId),
            reservesData,
            userConfig,
            reserves,
            reservesCount,
            _addressesProvider,
            _assetMappings
        );
        // uint256 healthFactor = 1;
        require(
            healthFactor >= GenericLogic.HEALTH_FACTOR_LIQUIDATION_THRESHOLD,
            Errors.VL_TRANSFER_NOT_ALLOWED
        );
    }
}
