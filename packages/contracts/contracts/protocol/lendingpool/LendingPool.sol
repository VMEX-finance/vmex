// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPoolConfigurator} from "../../interfaces/ILendingPoolConfigurator.sol";
import {IAToken} from "../../interfaces/IAToken.sol";
import {IVariableDebtToken} from "../../interfaces/IVariableDebtToken.sol";
import {IPriceOracleGetter} from "../../interfaces/IPriceOracleGetter.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {VersionedInitializable} from "../../dependencies/aave-upgradeability/VersionedInitializable.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {WadRayMath} from "../libraries/math/WadRayMath.sol";
import {ReserveLogic} from "../libraries/logic/ReserveLogic.sol";
import {GenericLogic} from "../libraries/logic/GenericLogic.sol";
import {ValidationLogic} from "../libraries/logic/ValidationLogic.sol";
import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
import {UserConfiguration} from "../libraries/configuration/UserConfiguration.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {LendingPoolStorage} from "./LendingPoolStorage.sol";
import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";
import {DepositWithdrawLogic} from "../libraries/logic/DepositWithdrawLogic.sol";
/**
 * @title LendingPool contract
 * @dev Main point of interaction with a VMEX protocol's market
 * - Users can:
 *   # Deposit
 *   # Withdraw
 *   # Borrow
 *   # Repay
 *   # Enable/disable their deposits as collateral
 *   # Liquidate positions
 * - To be covered by a proxy contract, owned by the LendingPoolAddressesProvider of the specific market
 * - All admin functions are callable by the LendingPoolConfigurator contract defined also in the
 *   LendingPoolAddressesProvider
 * @author Aave and VMEX
 **/
contract LendingPool is
    VersionedInitializable,
    ILendingPool,
    LendingPoolStorage
{
    using SafeMath for uint256;
    using WadRayMath for uint256;
    using SafeERC20 for IERC20;
    using ReserveLogic for DataTypes.ReserveData;
    using UserConfiguration for DataTypes.UserConfigurationMap;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using DepositWithdrawLogic for DataTypes.ReserveData;

    uint256 public constant LENDINGPOOL_REVISION = 0x1;

    modifier whenTrancheNotPausedAndExists(uint64 trancheId) {
        _whenTrancheNotPausedAndExists(trancheId);
        _;
    }
    function _whenTrancheNotPausedAndExists(uint64 trancheId) internal view {
        require(!trancheParams[trancheId].paused && !_everythingPaused, Errors.LP_IS_PAUSED);
        uint64 totalTranches = ILendingPoolConfigurator(_addressesProvider.getLendingPoolConfigurator()).totalTranches();
        require(trancheId<totalTranches, Errors.INVALID_TRANCHE);
    }

    modifier onlyLendingPoolConfigurator() {
        _onlyLendingPoolConfigurator();
        _;
    }

    function _onlyLendingPoolConfigurator() internal view {
        require(
            _addressesProvider.getLendingPoolConfigurator() == msg.sender,
            Errors.LP_CALLER_NOT_LENDING_POOL_CONFIGURATOR
        );
    }

    function _checkWhitelistBlacklist(uint64 trancheId, address user) internal view {
        if(trancheParams[trancheId].isUsingWhitelist){
            require(_usersConfig[user][trancheId].configuration.getWhitelist(), Errors.LP_NOT_WHITELISTED_TRANCHE_PARTICIPANT);
        }
        require(!_usersConfig[user][trancheId].configuration.getBlacklist(), Errors.LP_BLACKLISTED_TRANCHE_PARTICIPANT);
    }

    function checkWhitelistBlacklist(uint64 trancheId, address onBehalfOf) internal view {
        _checkWhitelistBlacklist(trancheId, msg.sender);
        if(onBehalfOf != msg.sender){
            _checkWhitelistBlacklist(trancheId, onBehalfOf);
        }
    }

    function getRevision() internal pure override returns (uint256) {
        return LENDINGPOOL_REVISION;
    }

    /**
     * @dev Function is invoked by the proxy contract when the LendingPool contract is added to the
     * LendingPoolAddressesProvider of the market.
     * - Caching the address of the LendingPoolAddressesProvider in order to reduce gas consumption
     *   on subsequent operations
     * @param provider The address of the LendingPoolAddressesProvider
     **/
    function initialize(ILendingPoolAddressesProvider provider)
        public
        initializer
    {
        _addressesProvider = provider;
        _assetMappings =  IAssetMappings(_addressesProvider.getAssetMappings());
        assert(address(_assetMappings)!=address(0));
    }

    /**
     * @dev Deposits an `amount` of underlying asset into the reserve, receiving in return overlying aTokens.
     * If the reserve has collateral enabled, the user's deposit should by default be marked as collateral.
     * - E.g. User deposits 100 USDC and gets in return 100 aUSDC
     * @param asset The address of the underlying asset to deposit
     * @param trancheId The trancheId of the underlying asset to deposit
     * @param amount The amount to be deposited
     * @param onBehalfOf The address that will receive the aTokens, same as msg.sender if the user
     *   wants to receive them on his own wallet, or a different address if the beneficiary of aTokens
     *   is a different wallet
     * @param referralCode Code used to register the integrator originating the operation, for potential rewards.
     *   0 if the action is executed directly by the user, without any middle-man. Currently unused.
     **/
    function deposit(
        address asset,
        uint64 trancheId,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    )
        external
        override
        whenTrancheNotPausedAndExists(trancheId)
    {
        checkWhitelistBlacklist(trancheId, onBehalfOf);
        DataTypes.DepositVars memory vars = DataTypes.DepositVars(
                asset,
                trancheId,
                address(_addressesProvider),
                _assetMappings,
                amount,
                onBehalfOf,
                referralCode
            );

        uint256 actualAmount = _reserves[asset][trancheId]._deposit(
            vars,
            _usersConfig[onBehalfOf][trancheId].configuration
        );

        emit Deposit(
            vars.asset,
            vars.trancheId,
            msg.sender,
            vars.onBehalfOf,
            actualAmount,
            vars.referralCode
        );
    }

    /**
     * @dev Withdraws an `amount` of underlying asset from the reserve, burning the equivalent aTokens owned
     * E.g. User has 100 aUSDC, calls withdraw() and receives 100 USDC, burning the 100 aUSDC
     * @param asset The address of the underlying asset to withdraw
     * @param trancheId The trancheId of the underlying asset to withdraw
     * @param amount The underlying amount to be withdrawn
     *   - Send the value type(uint256).max in order to withdraw the whole aToken balance
     * @param to Address that will receive the underlying, same as msg.sender if the user
     *   wants to receive it on his own wallet, or a different address if the beneficiary is a
     *   different wallet
     * @return The final amount withdrawn
     **/
    function withdraw(
        address asset,
        uint64 trancheId,
        uint256 amount,
        address to
    )
        external
        override
        whenTrancheNotPausedAndExists(trancheId)
        returns (uint256)
    {
        // note: no check whitelist and blacklist here, cause if users are blacklisted or taken out of whitelist
        // after tranche creation, they should be able to withdraw their funds
        uint256 actualAmount = DepositWithdrawLogic._withdraw(
                _reserves,
                _usersConfig[msg.sender][trancheId].configuration,
                _reservesList[trancheId],
                DataTypes.WithdrawParams(
                    uint8(trancheParams[trancheId].reservesCount),
                    asset,
                    trancheId,
                    amount,
                    to
                ),
                _addressesProvider,
                _assetMappings
            );

        emit Withdraw(asset, trancheId, msg.sender, to, actualAmount);
        return actualAmount;
    }

    /**
     * @dev Allows users to borrow a specific `amount` of the reserve underlying asset, provided that the borrower
     * already deposited enough collateral, or he was given enough allowance by a credit delegator on the
     * VariableDebtToken
     * - E.g. User borrows 100 USDC passing as `onBehalfOf` his own address, receiving the 100 USDC in his wallet
     *   and 100 variable debt tokens
     * @param asset The address of the underlying asset to borrow
     * @param trancheId The trancheId of the underlying asset to borrow
     * @param amount The amount to be borrowed
     * @param referralCode Code used to register the integrator originating the operation, for potential rewards.
     *   0 if the action is executed directly by the user, without any middle-man
     * @param onBehalfOf Address of the user who will receive the debt. Should be the address of the borrower itself
     * calling the function if he wants to borrow against his own collateral, or the address of the credit delegator
     * if he has been given credit delegation allowance
     **/
    function borrow(
        address asset,
        uint64 trancheId,
        uint256 amount,
        uint16 referralCode,
        address onBehalfOf
    )
        external
        override
        whenTrancheNotPausedAndExists(trancheId)
    {
        checkWhitelistBlacklist(trancheId, onBehalfOf);

        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        DataTypes.ExecuteBorrowParams memory vars = DataTypes.ExecuteBorrowParams(
                amount,
                trancheParams[trancheId].reservesCount,
                IPriceOracleGetter(
                    _addressesProvider.getPriceOracle()
                ).getAssetPrice(asset),
                trancheId,
                referralCode,
                asset,
                msg.sender,
                onBehalfOf,
                reserve.aTokenAddress,
                true,
                _assetMappings
            );


        DataTypes.UserConfigurationMap storage userConfig = _usersConfig[
            onBehalfOf
        ][trancheId].configuration;


        uint256 actualAmount = DepositWithdrawLogic._borrowHelper(
            _reserves,
            _reservesList[trancheId],
            userConfig,
            _addressesProvider,
            vars
        );

        emit Borrow(
            vars.asset,
            trancheId,
            vars.user,
            vars.onBehalfOf,
            actualAmount,
            reserve.currentVariableBorrowRate,
            vars.referralCode
        );
    }

    /**
     * @notice Repays a borrowed `amount` on a specific reserve, burning the equivalent debt tokens owned
     * - E.g. User repays 100 USDC, burning 100 variable debt tokens of the `onBehalfOf` address
     * @param asset The address of the borrowed underlying asset previously borrowed
     * @param trancheId The trancheId of the borrowed underlying asset previously borrowed
     * @param amount The amount to repay
     * - Send the value type(uint256).max in order to repay the whole debt for `asset` on the specific `debtMode`
     * @param onBehalfOf Address of the user who will get his debt reduced/removed. Should be the address of the
     * user calling the function if he wants to reduce/remove his own debt, or the address of any other
     * other borrower whose debt should be removed
     * @return The final amount repaid
     **/
    function repay(
        address asset,
        uint64 trancheId,
        uint256 amount,
        address onBehalfOf
    ) external override whenTrancheNotPausedAndExists(trancheId) returns (uint256) {
        // note: no check whitelist and blacklist here, cause if users are blacklisted or taken out of whitelist
        // after tranche creation, they should be able to repay their loans
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        uint256 variableDebt = Helpers.getUserCurrentDebt(
            onBehalfOf,
            reserve
        );

        ValidationLogic.validateRepay(
            reserve,
            amount,
            onBehalfOf,
            variableDebt,
            asset,
            _assetMappings
        );

        uint256 paybackAmount = variableDebt;

        if (amount < paybackAmount) {
            paybackAmount = amount;
        }

        reserve.updateState(_assetMappings.getVMEXReserveFactor(asset));

        IVariableDebtToken(reserve.variableDebtTokenAddress).burn(
            onBehalfOf,
            paybackAmount,
            reserve.variableBorrowIndex
        );

        reserve.updateInterestRates(asset, trancheId, paybackAmount, 0, _assetMappings.getVMEXReserveFactor(asset));

        if (variableDebt.sub(paybackAmount) == 0) {
            _usersConfig[onBehalfOf][trancheId].configuration.setBorrowing(reserve.id, false);
        }

        IERC20(asset).safeTransferFrom(msg.sender, reserve.aTokenAddress, paybackAmount);
        // this call is a noop as it currently calls an empty function.
        // IAToken(reserve.aToken).handleRepayment(msg.sender, paybackAmount);
        emit Repay(asset, trancheId, onBehalfOf, msg.sender, paybackAmount);

        return paybackAmount;
    }

    /**
     * @dev Allows depositors to enable/disable a specific deposited asset as collateral
     * @param asset The address of the underlying asset deposited
     * @param trancheId The trancheId of the underlying asset
     * @param useAsCollateral `true` if the user wants to use the deposit as collateral, `false` otherwise
     **/
    function setUserUseReserveAsCollateral(
        address asset,
        uint64 trancheId,
        bool useAsCollateral
    ) external override whenTrancheNotPausedAndExists(trancheId) {
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        ValidationLogic.validateSetUseReserveAsCollateral(
            asset,
            trancheId,
            useAsCollateral,
            _reserves,
            _usersConfig[msg.sender][trancheId].configuration,
            _reservesList[trancheId],
            trancheParams[trancheId].reservesCount,
            _addressesProvider,
            _assetMappings
        );

        _usersConfig[msg.sender][trancheId].configuration.setUsingAsCollateral(
            reserve.id,
            useAsCollateral
        );

        if (useAsCollateral) {
            emit ReserveUsedAsCollateralEnabled(asset, trancheId, msg.sender);
        } else {
            emit ReserveUsedAsCollateralDisabled(asset, trancheId, msg.sender);
        }
    }

    /**
     * @dev Function to liquidate a non-healthy position collateral-wise, with Health Factor below 1
     * - The caller (liquidator) covers `debtToCover` amount of debt of the user getting liquidated, and receives
     *   a proportionally amount of the `collateralAsset` plus a bonus to cover market risk
     * @param collateralAsset The address of the underlying asset used as collateral, to receive as result of the liquidation
     * @param debtAsset The address of the underlying borrowed asset to be repaid with the liquidation
     * @param trancheId The trancheId of the tranche this liquidation is occurring in
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
    )
        external
        override
        whenTrancheNotPausedAndExists(trancheId)
    {
        // note: liquidators should not be restricted to whitelisted users and ban blacklisted users

        address collateralManager = _addressesProvider
            .getLendingPoolCollateralManager();

        //solium-disable-next-line
        (bool success, bytes memory result) = collateralManager.delegatecall(
            abi.encodeWithSignature(
                "liquidationCall(address,address,uint64,address,uint256,bool)",
                collateralAsset,
                debtAsset,
                trancheId,
                user,
                debtToCover,
                receiveAToken
            )
        );

        require(success, Errors.LP_LIQUIDATION_CALL_FAILED);

        (uint256 returnCode, string memory returnMessage) = abi.decode(
            result,
            (uint256, string)
        );

        require(returnCode == 0, string(abi.encodePacked(returnMessage)));
    }

    /**
     * @dev Returns the state and configuration of the reserve
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @return The state of the reserve
     **/
    function getReserveData(address asset, uint64 trancheId)
        external
        view
        override
        returns (DataTypes.ReserveData memory)
    {
        return _reserves[asset][trancheId];
    }

    /**
     * @dev Returns the user account data across all the reserves in a specific trancheId
     * @param user The address of the user
     * @param trancheId The trancheId
     * @return totalCollateralETH the total collateral in ETH of the user
     * @return totalDebtETH the total debt in ETH of the user
     * @return availableBorrowsETH the borrowing power left of the user
     * @return currentLiquidationThreshold the liquidation threshold of the user
     * @return ltv the loan to value of the user
     * @return healthFactor the current health factor of the user
     * @return avgBorrowFactor the weighted average of all debt position borrow factors
     **/
    function getUserAccountData(address user, uint64 trancheId)
        external
        override
        returns (
            uint256 totalCollateralETH,
            uint256 totalDebtETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor,
            uint256 avgBorrowFactor
        )
    {
        (
            totalCollateralETH,
            totalDebtETH,
            ltv,
            currentLiquidationThreshold,
            healthFactor,
            avgBorrowFactor
        ) = GenericLogic.calculateUserAccountData(
            DataTypes.AcctTranche(user, trancheId),
            _reserves,
            _usersConfig[user][trancheId].configuration,
            _reservesList[trancheId],
            trancheParams[trancheId].reservesCount,
            _addressesProvider,
            _assetMappings
        );

        availableBorrowsETH = GenericLogic.calculateAvailableBorrowsETH(
            totalCollateralETH,
            totalDebtETH,
            ltv,
            avgBorrowFactor
        );
    }

    /**
     * @dev Returns the configuration of the reserve
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @return The configuration of the reserve
     **/
    function getConfiguration(address asset, uint64 trancheId)
        external
        view
        override
        returns (DataTypes.ReserveConfigurationMap memory)
    {
        return _reserves[asset][trancheId].configuration;
    }

    /**
     * @dev Returns the configuration of the user across all the reserves
     * @param user The user address
     * @param trancheId The trancheId of all the reserves
     * @return The configuration of the user
     **/
    function getUserConfiguration(address user, uint64 trancheId)
        external
        view
        override
        returns (DataTypes.UserConfigurationMap memory)
    {
        return _usersConfig[user][trancheId].configuration;
    }

    /**
     * @dev Returns the normalized income per unit of asset
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @return The reserve's normalized income
     */
    function getReserveNormalizedIncome(address asset, uint64 trancheId)
        external
        view
        virtual
        override
        returns (uint256)
    {
        return _reserves[asset][trancheId].getNormalizedIncome();
    }

    /**
     * @dev Returns the normalized variable debt per unit of asset
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @return The reserve normalized variable debt
     */
    function getReserveNormalizedVariableDebt(address asset, uint64 trancheId)
        external
        view
        override
        returns (uint256)
    {
        return _reserves[asset][trancheId].getNormalizedDebt();
    }

    /**
     * @dev Returns if the LendingPool tranche is paused
     * @param trancheId The trancheId
     */
    function paused(uint64 trancheId) external view override returns (bool) {
        return trancheParams[trancheId].paused;
    }

    /**
     * @dev Returns the list of the initialized reserves.
     * @param trancheId The trancheId of the reserves to look at
     **/
    function getReservesList(uint64 trancheId)
        external
        view
        override
        returns (address[] memory)
    {
        uint8 reservesCount = trancheParams[trancheId].reservesCount;
        address[] memory _activeReserves = new address[](reservesCount);

        for (uint256 i = 0; i < reservesCount; i++) {
            _activeReserves[i] = _reservesList[trancheId][i];
        }
        return _activeReserves;
    }

    /**
     * @dev Returns the cached LendingPoolAddressesProvider connected to this contract
     **/
    function getAddressesProvider()
        external
        view
        override
        returns (ILendingPoolAddressesProvider)
    {
        return _addressesProvider;
    }

    /**
     * @dev Validates and finalizes an aToken transfer
     * - Only callable by the overlying aToken of the `asset`
     * @param asset The address of the underlying asset of the aToken
     * @param trancheId The tranche id of the aToken
     * @param from The user from which the aTokens are transferred
     * @param to The user receiving the aTokens
     * @param amount The amount being transferred/withdrawn
     * @param balanceFromBefore The aToken balance of the `from` user before the transfer
     * @param balanceToBefore The aToken balance of the `to` user before the transfer
     */
    function finalizeTransfer(
        address asset,
        uint64 trancheId,
        address from,
        address to,
        uint256 amount,
        uint256 balanceFromBefore,
        uint256 balanceToBefore
    ) external override whenTrancheNotPausedAndExists(trancheId) {
        require(
            msg.sender == _reserves[asset][trancheId].aTokenAddress,
            Errors.LP_CALLER_MUST_BE_AN_ATOKEN
        );
        checkWhitelistBlacklist(trancheId, to);

        ValidationLogic.validateTransfer(
            from,
            trancheId,
            _reserves,
            _usersConfig[from][trancheId].configuration,
            _reservesList[trancheId],
            trancheParams[trancheId].reservesCount,
            _addressesProvider,
            _assetMappings
        );

        DataTypes.ReserveData memory reserve = _reserves[asset][trancheId];


        if (from != to) {
            if (balanceFromBefore.sub(amount) == 0) {
                DataTypes.UserConfigurationMap
                    storage fromConfig = _usersConfig[from][trancheId].configuration;
                fromConfig.setUsingAsCollateral(reserve.id, false);
                emit ReserveUsedAsCollateralDisabled(asset, trancheId, from);
            }

            if (balanceToBefore == 0 && amount != 0) {
                DataTypes.UserConfigurationMap storage toConfig = _usersConfig[
                    to
                ][trancheId].configuration;
                toConfig.setUsingAsCollateral(
                    reserve.id,
                    reserve.configuration
                        .getCollateralEnabled(asset, _assetMappings)
                );
                emit ReserveUsedAsCollateralEnabled(asset, trancheId, to);
            }
        }
    }

    /**
     * @dev Initializes a reserve, activating it, assigning an aToken and debt tokens and an
     * interest rate strategy
     * - Only callable by the LendingPoolConfigurator contract
     * @param underlyingAsset The address of the underlying asset (like USDC)
     * @param trancheId The tranche id
     * @param interestRateStrategyAddress The address of the interest rate strategy
     * @param aTokenAddress The address of the aToken that will be assigned to the reserve
     * @param variableDebtAddress The address of the VariableDebtToken that will be assigned to the reserve
     **/
    function initReserve(
        address underlyingAsset,
        uint64 trancheId,
        address interestRateStrategyAddress,
        address aTokenAddress,
        address variableDebtAddress
    ) external override onlyLendingPoolConfigurator {
        require(
            Address.isContract(underlyingAsset),
            Errors.LP_NOT_CONTRACT
        );
        _reserves[underlyingAsset][trancheId].init(
            aTokenAddress,
            variableDebtAddress,
            interestRateStrategyAddress
        );

        _addReserveToList(underlyingAsset, trancheId);
    }

    /**
     * @dev Updates the address of the interest rate strategy contract
     * - Only callable by the LendingPoolConfigurator contract
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The tranche id of the reserve
     * @param rateStrategyAddress The address of the interest rate strategy contract
     **/
    function setReserveInterestRateStrategyAddress(
        address asset,
        uint64 trancheId,
        address rateStrategyAddress
    ) external override onlyLendingPoolConfigurator {
        _reserves[asset][trancheId]
            .interestRateStrategyAddress = rateStrategyAddress;
    }

    /**
     * @dev Sets the configuration bitmap of the reserve as a whole
     * - Only callable by the LendingPoolConfigurator contract
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The tranche id of the reserve
     * @param configuration The new configuration bitmap
     **/
    function setConfiguration(
        address asset,
        uint64 trancheId,
        uint256 configuration
    ) external override onlyLendingPoolConfigurator {
        _reserves[asset][trancheId].configuration.data = configuration;
    }

    /**
     * @dev Set the _pause state of the entire lending pool
     * - Only callable by the LendingPoolConfigurator contract
     * @param val `true` to pause the reserve, `false` to un-pause it
     */
    function setPauseEverything(bool val)
        external
        override
        onlyLendingPoolConfigurator
    {
        _everythingPaused = val;
        if (_everythingPaused) {
            emit EverythingPaused();
        } else {
            emit EverythingUnpaused();
        }
    }

    /**
     * @dev Set the _pause state of a tranche
     * - Only callable by the LendingPoolConfigurator contract
     * @param val `true` to pause the reserve, `false` to un-pause it
     */
    function setPause(bool val, uint64 trancheId)
        external
        override
        onlyLendingPoolConfigurator
    {
        trancheParams[trancheId].paused = val;
        if (trancheParams[trancheId].paused) {
            emit Paused(trancheId);
        } else {
            emit Unpaused(trancheId);
        }
    }

    function _addReserveToList(address asset, uint64 trancheId) internal {
        uint256 reservesCount = trancheParams[trancheId].reservesCount;

        require(
            reservesCount < UserConfiguration.MAX_RESERVES,
            Errors.LP_NO_MORE_RESERVES_ALLOWED
        );

        // all reserves start at zero, so if it is not zero then it was already added OR
        // the first asset that was added will have id = 0, so we need to make sure that that asset wasn't already added
        bool reserveAlreadyAdded = _reserves[asset][trancheId].id != 0 ||
            _reservesList[trancheId][0] == asset;

        if (!reserveAlreadyAdded) {
            _reserves[asset][trancheId].id = uint8(reservesCount);
            _reservesList[trancheId][reservesCount] = asset;

            trancheParams[trancheId].reservesCount = uint8(reservesCount + 1);
        }
    }

    /**
     * @dev Enables or disables the whitelist for a tranche
     * - Only callable by the LendingPoolConfigurator contract
     * @param trancheId The tranche id to change whitelist on
     * @param isUsingWhitelist `true` to enable whitelist, `false` to disable whitelist
     */
    function setWhitelistEnabled(
        uint64 trancheId,
        bool isUsingWhitelist
    ) external override onlyLendingPoolConfigurator{
        trancheParams[trancheId].isUsingWhitelist = isUsingWhitelist;
    }

    /**
     * @dev Add/remove a user from the whitelist, enabling the whitelist if it was not enabled
     * - Only callable by the LendingPoolConfigurator contract
     * @param trancheId The tranche id to configure the user on
     * @param user The address of the user to configure
     * @param isWhitelisted `true` to add the user to the whitelist, `false` to remove user from whitelist
     */
    function addToWhitelist(
        uint64 trancheId,
        address user,
        bool isWhitelisted
    ) external override onlyLendingPoolConfigurator {
        // adding a user to the whitelist enables the whitelist
        if(isWhitelisted && !trancheParams[trancheId].isUsingWhitelist) {
            trancheParams[trancheId].isUsingWhitelist = true;
        }

        _usersConfig[user][trancheId].configuration.setWhitelist(isWhitelisted);

        if (isWhitelisted) {
            // remove from blacklist to avoid conflicts
            _usersConfig[user][trancheId].configuration.setBlacklist(false);
        }
    }

    /**
     * @dev Add/remove a user from the blacklist
     * - Only callable by the LendingPoolConfigurator contract
     * @param trancheId The tranche id to configure the user on
     * @param user The address of the user to configure
     * @param isBlacklisted `true` to add the user to the blacklist, `false` to remove user from blacklist
     */
    function addToBlacklist(
        uint64 trancheId,
        address user,
        bool isBlacklisted
    ) external override onlyLendingPoolConfigurator {
        _usersConfig[user][trancheId].configuration.setBlacklist(isBlacklisted);
        if (isBlacklisted) {
            // remove from whitelist to avoid conflicts
            _usersConfig[user][trancheId].configuration.setWhitelist(false);
        }
    }
}
