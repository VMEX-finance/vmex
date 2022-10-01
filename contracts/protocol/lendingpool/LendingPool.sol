// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {IAToken} from "../../interfaces/IAToken.sol";
import {IVariableDebtToken} from "../../interfaces/IVariableDebtToken.sol";
import {IFlashLoanReceiver} from "../../flashloan/interfaces/IFlashLoanReceiver.sol";
import {IPriceOracleGetter} from "../../interfaces/IPriceOracleGetter.sol";
import {IStableDebtToken} from "../../interfaces/IStableDebtToken.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {VersionedInitializable} from "../libraries/aave-upgradeability/VersionedInitializable.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {WadRayMath} from "../libraries/math/WadRayMath.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {ReserveLogic} from "../libraries/logic/ReserveLogic.sol";
import {GenericLogic} from "../libraries/logic/GenericLogic.sol";
import {ValidationLogic} from "../libraries/logic/ValidationLogic.sol";
import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
import {UserConfiguration} from "../libraries/configuration/UserConfiguration.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {LendingPoolStorage} from "./LendingPoolStorage.sol";

import {DepositWithdrawLogic} from "../libraries/logic/DepositWithdrawLogic.sol";

/**
 * @title LendingPool contract
 * @dev Main point of interaction with an Aave protocol's market
 * - Users can:
 *   # Deposit
 *   # Withdraw
 *   # Borrow
 *   # Repay
 *   # Swap their loans between variable and stable rate
 *   # Enable/disable their deposits as collateral rebalance stable rate borrow positions
 *   # Liquidate positions
 *   # Execute Flash Loans
 * - To be covered by a proxy contract, owned by the LendingPoolAddressesProvider of the specific market
 * - All admin functions are callable by the LendingPoolConfigurator contract defined also in the
 *   LendingPoolAddressesProvider
 * @author Aave

 * New function: TransferTranche
 **/
contract LendingPool is
    VersionedInitializable,
    ILendingPool,
    LendingPoolStorage
{
    using SafeMath for uint256;
    using WadRayMath for uint256;
    using PercentageMath for uint256;
    using SafeERC20 for IERC20;
    using ReserveLogic for *;
    using UserConfiguration for *;
    using ReserveConfiguration for *;
    using DepositWithdrawLogic for DataTypes.ReserveData;

    uint256 public constant LENDINGPOOL_REVISION = 0x2;

    modifier whenNotPaused(uint64 trancheId) {
        {
            require(!_paused[trancheId], Errors.LP_IS_PAUSED);
        }

        _;
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
        _maxStableRateBorrowSizePercent = 2500;
        _flashLoanPremiumTotal = 9;
        _maxNumberOfReserves = 128; //this might actually be fine since this is max number of reserves per trancheId?
    }

    /**
     * @dev Deposits an `amount` of underlying asset into the reserve, receiving in return overlying aTokens.
     * - E.g. User deposits 100 USDC and gets in return 100 aUSDC
     * @param asset The address of the underlying asset to deposit
     * @param amount The amount to be deposited
     * @param onBehalfOf The address that will receive the aTokens, same as msg.sender if the user
     *   wants to receive them on his own wallet, or a different address if the beneficiary of aTokens
     *   is a different wallet
     * @param referralCode Code used to register the integrator originating the operation, for potential rewards.
     *   0 if the action is executed directly by the user, without any middle-man
     **/
    function deposit(
        //allowing collateral changes here opens up possibility of attack where someone can try to change the collateral status of someone else, but this can only be done for the initial deposit
        //confusing interface where users can choose their isCollateral but it only matters for the first deposit
        address asset,
        uint64 trancheId,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) public override whenNotPaused(trancheId) {
        //changed scope to public so transferTranche can call it
        DataTypes.DepositVars memory vars;
        {
            vars = DataTypes.DepositVars(
                asset,
                trancheId,
                address(_addressesProvider),
                amount,
                onBehalfOf,
                referralCode
            );
        }
        {
            _reserves[asset][trancheId]._deposit(
                vars,
                _usersConfig[onBehalfOf][trancheId]
            );
        }
    }

    /**
     * @dev Withdraws an `amount` of underlying asset from the reserve, burning the equivalent aTokens owned
     * E.g. User has 100 aUSDC, calls withdraw() and receives 100 USDC, burning the 100 aUSDC
     * @param asset The address of the underlying asset to withdraw
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
    ) public override whenNotPaused(trancheId) returns (uint256) {
        return
            DepositWithdrawLogic._withdraw(
                _reserves,
                _usersConfig[msg.sender][trancheId],
                _reservesList[trancheId],
                DataTypes.WithdrawParams(
                    _reservesCount[trancheId],
                    asset,
                    trancheId,
                    amount,
                    to
                ),
                _addressesProvider,
                assetDatas
            );
    }

    /**
     * @dev Allows users to borrow a specific `amount` of the reserve underlying asset, provided that the borrower
     * already deposited enough collateral, or he was given enough allowance by a credit delegator on the
     * corresponding debt token (StableDebtToken or VariableDebtToken)
     * - E.g. User borrows 100 USDC passing as `onBehalfOf` his own address, receiving the 100 USDC in his wallet
     *   and 100 stable/variable debt tokens, depending on the `interestRateMode`
     * @param asset The address of the underlying asset to borrow
     * @param amount The amount to be borrowed
     * @param interestRateMode The interest rate mode at which the user wants to borrow: 1 for Stable, 2 for Variable
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
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) public override whenNotPaused(trancheId) {
        DataTypes.ReserveData storage reserve;
        DataTypes.ExecuteBorrowParams memory vars;

        {
            reserve = _reserves[asset][trancheId];
        }

        {
            vars = DataTypes.ExecuteBorrowParams(
                asset,
                trancheId,
                msg.sender,
                onBehalfOf,
                amount,
                interestRateMode,
                reserve.aTokenAddress,
                referralCode,
                true,
                _maxStableRateBorrowSizePercent,
                _reservesCount[trancheId]
            );
        }

        DataTypes.UserConfigurationMap storage userConfig = _usersConfig[
            onBehalfOf
        ][trancheId];

        DepositWithdrawLogic._borrowHelper(
            _reserves,
            _reservesList[trancheId],
            userConfig,
            assetDatas,
            _addressesProvider,
            vars
        );
    }

    /**
     * @notice Repays a borrowed `amount` on a specific reserve, burning the equivalent debt tokens owned
     * - E.g. User repays 100 USDC, burning 100 variable/stable debt tokens of the `onBehalfOf` address
     * @param asset The address of the borrowed underlying asset previously borrowed
     * @param amount The amount to repay
     * - Send the value type(uint256).max in order to repay the whole debt for `asset` on the specific `debtMode`
     * @param rateMode The interest rate mode at of the debt the user wants to repay: 1 for Stable, 2 for Variable
     * @param onBehalfOf Address of the user who will get his debt reduced/removed. Should be the address of the
     * user calling the function if he wants to reduce/remove his own debt, or the address of any other
     * other borrower whose debt should be removed
     * @return The final amount repaid
     **/
    function repay(
        address asset,
        uint64 trancheId,
        uint256 amount,
        uint256 rateMode,
        address onBehalfOf
    ) external override returns (uint256) {
        {
            require(!_paused[trancheId], Errors.LP_IS_PAUSED);
        }
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        (uint256 stableDebt, uint256 variableDebt) = Helpers.getUserCurrentDebt(
            onBehalfOf,
            reserve
        );

        DataTypes.InterestRateMode interestRateMode = DataTypes
            .InterestRateMode(rateMode);

        ValidationLogic.validateRepay(
            reserve,
            amount,
            interestRateMode,
            onBehalfOf,
            stableDebt,
            variableDebt
        );

        uint256 paybackAmount = interestRateMode ==
            DataTypes.InterestRateMode.STABLE
            ? stableDebt
            : variableDebt;

        if (amount < paybackAmount) {
            paybackAmount = amount;
        }

        reserve.updateState();

        if (interestRateMode == DataTypes.InterestRateMode.STABLE) {
            IStableDebtToken(reserve.stableDebtTokenAddress).burn(
                onBehalfOf,
                paybackAmount
            );
        } else {
            IVariableDebtToken(reserve.variableDebtTokenAddress).burn(
                onBehalfOf,
                paybackAmount,
                reserve.variableBorrowIndex
            );
        }

        address aToken = reserve.aTokenAddress;
        reserve.updateInterestRates(asset, aToken, paybackAmount, 0);

        if (stableDebt.add(variableDebt).sub(paybackAmount) == 0) {
            _usersConfig[onBehalfOf][trancheId].setBorrowing(reserve.id, false);
        }

        IERC20(asset).safeTransferFrom(msg.sender, aToken, paybackAmount);

        IAToken(aToken).handleRepayment(msg.sender, paybackAmount);

        emit Repay(asset, onBehalfOf, msg.sender, paybackAmount);

        return paybackAmount;
    }

    /**
     * @dev Allows a borrower to swap his debt between stable and variable mode, or viceversa
     * @param asset The address of the underlying asset borrowed
     * @param rateMode The rate mode that the user wants to swap to
     **/
    function swapBorrowRateMode(
        address asset,
        uint64 trancheId,
        uint256 rateMode
    ) external override whenNotPaused(trancheId) {
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        (uint256 stableDebt, uint256 variableDebt) = Helpers.getUserCurrentDebt(
            msg.sender,
            reserve
        );

        DataTypes.InterestRateMode interestRateMode = DataTypes
            .InterestRateMode(rateMode);

        ValidationLogic.validateSwapRateMode(
            reserve,
            _usersConfig[msg.sender][trancheId],
            stableDebt,
            variableDebt,
            interestRateMode
        );

        reserve.updateState();

        if (interestRateMode == DataTypes.InterestRateMode.STABLE) {
            IStableDebtToken(reserve.stableDebtTokenAddress).burn(
                msg.sender,
                stableDebt
            );
            IVariableDebtToken(reserve.variableDebtTokenAddress).mint(
                msg.sender,
                msg.sender,
                stableDebt,
                reserve.variableBorrowIndex
            );
        } else {
            IVariableDebtToken(reserve.variableDebtTokenAddress).burn(
                msg.sender,
                variableDebt,
                reserve.variableBorrowIndex
            );
            IStableDebtToken(reserve.stableDebtTokenAddress).mint(
                msg.sender,
                msg.sender,
                variableDebt,
                reserve.currentStableBorrowRate
            );
        }

        reserve.updateInterestRates(asset, reserve.aTokenAddress, 0, 0);

        emit Swap(asset, msg.sender, rateMode);
    }

    /**
     * @dev Rebalances the stable interest rate of a user to the current stable rate defined on the reserve.
     * - Users can be rebalanced if the following conditions are satisfied:
     *     1. Usage ratio is above 95%
     *     2. the current deposit APY is below REBALANCE_UP_THRESHOLD * maxVariableBorrowRate, which means that too much has been
     *        borrowed at a stable rate and depositors are not earning enough
     * @param asset The address of the underlying asset borrowed
     * @param user The address of the user to be rebalanced
     **/
    function rebalanceStableBorrowRate(
        address asset,
        uint64 trancheId,
        address user
    ) external override whenNotPaused(trancheId) {
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        IERC20 stableDebtToken = IERC20(reserve.stableDebtTokenAddress);
        IERC20 variableDebtToken = IERC20(reserve.variableDebtTokenAddress);
        address aTokenAddress = reserve.aTokenAddress;

        uint256 stableDebt = IERC20(stableDebtToken).balanceOf(user);

        ValidationLogic.validateRebalanceStableBorrowRate(
            reserve,
            asset,
            stableDebtToken,
            variableDebtToken,
            aTokenAddress
        );

        reserve.updateState();

        IStableDebtToken(address(stableDebtToken)).burn(user, stableDebt);
        IStableDebtToken(address(stableDebtToken)).mint(
            user,
            user,
            stableDebt,
            reserve.currentStableBorrowRate
        );

        reserve.updateInterestRates(asset, aTokenAddress, 0, 0);

        emit RebalanceStableBorrowRate(asset, user);
    }

    /**
     * @dev Allows depositors to enable/disable a specific deposited asset as collateral
     * @param asset The address of the underlying asset deposited
     * @param useAsCollateral `true` if the user wants to use the deposit as collateral, `false` otherwise
     **/
    function setUserUseReserveAsCollateral(
        address asset,
        uint64 trancheId,
        bool useAsCollateral
    ) external override whenNotPaused(trancheId) {
        // require(
        //     assetDatas[asset].isLendable,
        //     "nonlendable assets must be set as collateral"
        // ); //not sure if something like this is needed
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        {
            ValidationLogic.validateSetUseReserveAsCollateral(
                reserve,
                asset,
                useAsCollateral,
                _reserves,
                _usersConfig[msg.sender][trancheId],
                _reservesList[trancheId],
                _reservesCount[trancheId],
                _addressesProvider,
                assetDatas
            );
        }

        _usersConfig[msg.sender][trancheId].setUsingAsCollateral(
            reserve.id,
            useAsCollateral
        );

        if (useAsCollateral) {
            emit ReserveUsedAsCollateralEnabled(asset, msg.sender);
        } else {
            emit ReserveUsedAsCollateralDisabled(asset, msg.sender);
        }
    }

    /**
     * @dev Function to liquidate a non-healthy position collateral-wise, with Health Factor below 1
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
        address user,
        uint256 debtToCover,
        bool receiveAToken
    ) external override whenNotPaused(trancheId) {
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

    struct FlashLoanLocalVars {
        IFlashLoanReceiver receiver;
        address oracle;
        uint256 i;
        address currentAsset;
        uint64 currentTranche;
        address currentATokenAddress;
        uint256 currentAmount;
        uint256 currentPremium;
        uint256 currentAmountPlusPremium;
        address debtToken;
    }

    /**
     * @dev Allows smartcontracts to access the liquidity of the pool within one transaction,
     * as long as the amount taken plus a fee is returned.
     * IMPORTANT There are security concerns for developers of flashloan receiver contracts that must be kept into consideration.
     * For further details please visit https://developers.aave.com
     * @param receiverAddress The address of the contract receiving the funds, implementing the IFlashLoanReceiver interface
     * @param assets The addresses of the assets being flash-borrowed
     * @param amounts The amounts amounts being flash-borrowed
     * @param modes Types of the debt to open if the flash loan is not returned:
     *   0 -> Don't open any debt, just revert if funds can't be transferred from the receiver
     *   1 -> Open debt at stable rate for the value of the amount flash-borrowed to the `onBehalfOf` address
     *   2 -> Open debt at variable rate for the value of the amount flash-borrowed to the `onBehalfOf` address
     * @param onBehalfOf The address  that will receive the debt in the case of using on `modes` 1 or 2
     * @param params Variadic packed params to pass to the receiver as extra information
     * @param referralCode Code used to register the integrator originating the operation, for potential rewards.
     *   0 if the action is executed directly by the user, without any middle-man
     **/
    function flashLoan(
        address receiverAddress,
        address[] calldata assets,
        uint64 trancheId,
        uint256[] calldata amounts,
        uint256[] calldata modes,
        address onBehalfOf,
        bytes calldata params,
        uint16 referralCode
    ) external override {
        {
            require(!_paused[trancheId], Errors.LP_IS_PAUSED);
        }
        DataTypes.UserConfigurationMap storage userConfig = _usersConfig[
            onBehalfOf
        ][trancheId];
        DataTypes.flashLoanVars memory callvars;

        {
            callvars = DataTypes.flashLoanVars(
                receiverAddress,
                assets,
                trancheId,
                amounts,
                modes,
                onBehalfOf,
                params,
                referralCode,
                _flashLoanPremiumTotal,
                _addressesProvider.getAavePriceOracle(), //TODO: For now we are assuming that the assets we are flashloaning are not lendable so it would always be this oracle. Also this isn't even used lol
                _maxStableRateBorrowSizePercent,
                address(_addressesProvider)
            );
        }
        DepositWithdrawLogic._flashLoan(
            callvars,
            assetDatas,
            _reserves,
            _reservesList,
            _reservesCount,
            userConfig
        );
    }

    /**
     * @dev Returns the state and configuration of the reserve
     * @param asset The address of the underlying asset of the reserve
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

    function getAssetData(address asset)
        external
        view
        override
        returns (DataTypes.ReserveAssetType)
    {
        return assetDatas[asset];
    }

    /**
     * @dev Returns the user account data across all the reserves in a specific trancheId
     * @param user The address of the user
     * @return totalCollateralETH the total collateral in ETH of the user
     * @return totalDebtETH the total debt in ETH of the user
     * @return availableBorrowsETH the borrowing power left of the user
     * @return currentLiquidationThreshold the liquidation threshold of the user
     * @return ltv the loan to value of the user
     * @return healthFactor the current health factor of the user
     **/
    function getUserAccountData(address user, uint64 trancheId)
        external
        view
        override
        returns (
            uint256 totalCollateralETH,
            uint256 totalDebtETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        (
            totalCollateralETH,
            totalDebtETH,
            ltv,
            currentLiquidationThreshold,
            healthFactor
        ) = GenericLogic.calculateUserAccountData(
            DataTypes.AcctTranche(user, trancheId),
            _reserves,
            _usersConfig[user][trancheId],
            _reservesList[trancheId],
            _reservesCount[trancheId],
            _addressesProvider,
            assetDatas
        );
        // (uint256(14), uint256(14), uint256(14), uint256(14), uint256(14));

        availableBorrowsETH = GenericLogic.calculateAvailableBorrowsETH(
            totalCollateralETH,
            totalDebtETH,
            ltv
        );
    }

    /**
     * @dev Returns the configuration of the reserve
     * @param asset The address of the underlying asset of the reserve
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
     * @return The configuration of the user
     **/
    function getUserConfiguration(address user, uint64 trancheId)
        external
        view
        override
        returns (DataTypes.UserConfigurationMap memory)
    {
        return _usersConfig[user][trancheId];
    }

    /**
     * @dev Returns the normalized income per unit of asset
     * @param asset The address of the underlying asset of the reserve
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
     * @dev Returns if the LendingPool is paused
     */
    function paused(uint64 trancheId) external view override returns (bool) {
        return _paused[trancheId];
    }

    /**
     * @dev Returns the list of the initialized reserves. This is just placeholder, looking at tranche 0.
     **/
    function getReservesList(uint64 trancheId)
        external
        view
        override
        returns (address[] memory)
    {
        address[] memory _activeReserves = new address[](
            _reservesCount[trancheId]
        );

        for (uint256 i = 0; i < _reservesCount[trancheId]; i++) {
            _activeReserves[i] = _reservesList[trancheId][i];
        }
        return _activeReserves;
    }

    /**
     * @dev Returns the list of the initialized reserves
     **/
    // function getReservesList(uint64 trancheId)
    //     external
    //     view
    //     override
    //     returns (address[] memory)
    // {
    //     address[] memory _activeReserves = new address[](_reservesCount[trancheId]);

    //     for (uint256 i = 0; i < _reservesCount[trancheId]; i++) {
    //         _activeReserves[i] = _reservesList[trancheId][i];
    //     }
    //     return _activeReserves;
    // }

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
     * @dev Returns the percentage of available liquidity that can be borrowed at once at stable rate
     */
    // function MAX_STABLE_RATE_BORROW_SIZE_PERCENT()
    //     public
    //     view
    //     returns (uint256)
    // {
    //     return _maxStableRateBorrowSizePercent;
    // }

    /**
     * @dev Returns the fee on flash loans
     */
    function FLASHLOAN_PREMIUM_TOTAL() public view returns (uint256) {
        return _flashLoanPremiumTotal;
    }

    /**
     * @dev Returns the maximum number of reserves supported to be listed in this LendingPool
     */
    // function MAX_NUMBER_RESERVES() public view returns (uint256) {
    //     return _maxNumberOfReserves;
    // }

    /**
     * @dev Validates and finalizes an aToken transfer
     * - Only callable by the overlying aToken of the `asset`
     * @param asset The address of the underlying asset of the aToken
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
    ) external override whenNotPaused(trancheId) {
        require(
            msg.sender == _reserves[asset][trancheId].aTokenAddress,
            Errors.LP_CALLER_MUST_BE_AN_ATOKEN
        );

        ValidationLogic.validateTransfer(
            from,
            trancheId,
            _reserves,
            _usersConfig[from][trancheId],
            _reservesList[trancheId],
            _reservesCount[trancheId],
            _addressesProvider,
            assetDatas
        );

        uint256 reserveId = _reserves[asset][trancheId].id;

        if (from != to) {
            if (balanceFromBefore.sub(amount) == 0) {
                DataTypes.UserConfigurationMap
                    storage fromConfig = _usersConfig[from][trancheId];
                fromConfig.setUsingAsCollateral(reserveId, false);
                emit ReserveUsedAsCollateralDisabled(asset, from);
            }

            if (balanceToBefore == 0 && amount != 0) {
                DataTypes.UserConfigurationMap storage toConfig = _usersConfig[
                    to
                ][trancheId];
                toConfig.setUsingAsCollateral(reserveId, true);
                emit ReserveUsedAsCollateralEnabled(asset, to);
            }
        }
    }

    /**
     * @dev Initializes a reserve, activating it, assigning an aToken and debt tokens and an
     * interest rate strategy
     * - Only callable by the LendingPoolConfigurator contract
     * @param aTokenAddress The address of the aToken that will be assigned to the reserve
     * @param stableDebtAddress The address of the StableDebtToken that will be assigned to the reserve
     * @param aTokenAddress The address of the VariableDebtToken that will be assigned to the reserve
     **/
    function initReserve(
        DataTypes.InitReserveInput calldata input,
        address aTokenAddress,
        address stableDebtAddress,
        address variableDebtAddress,
        uint64 trancheId
    ) external override onlyLendingPoolConfigurator {
        require(
            Address.isContract(input.underlyingAsset),
            Errors.LP_NOT_CONTRACT
        );
        //considering requiring _reservesCount[trancheId] = 0, but you can add another asset to an existing tranche too.
        _reserves[input.underlyingAsset][trancheId].init(
            aTokenAddress,
            stableDebtAddress,
            variableDebtAddress,
            input,
            trancheId
        );

        // TODO: update for tranches
        _addReserveToList(input.underlyingAsset, trancheId);
    }

    function setAssetData(address asset, uint8 _assetType)
        external
        override
        onlyLendingPoolConfigurator
    {
        //TODO: edit permissions. Right now is onlyLendingPoolConfigurator
        assetDatas[asset] = DataTypes.ReserveAssetType(_assetType);
    }

    /**
     * @dev Updates the address of the interest rate strategy contract
     * - Only callable by the LendingPoolConfigurator contract
     * @param asset The address of the underlying asset of the reserve
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
     * @dev Set the _pause state of a reserve
     * - Only callable by the LendingPoolConfigurator contract
     * @param val `true` to pause the reserve, `false` to un-pause it
     */
    function setPause(bool val, uint64 trancheId)
        external
        override
        onlyLendingPoolConfigurator
    {
        _paused[trancheId] = val;
        if (_paused[trancheId]) {
            emit Paused();
        } else {
            emit Unpaused();
        }
    }

    function _addReserveToList(address asset, uint64 trancheId) internal {
        uint256 reservesCount = _reservesCount[trancheId];

        require(
            reservesCount < _maxNumberOfReserves,
            Errors.LP_NO_MORE_RESERVES_ALLOWED
        );

        bool reserveAlreadyAdded = _reserves[asset][trancheId].id != 0 || //all reserves start at zero, so if it is not zero then it was already added
            _reservesList[trancheId][0] == asset; //this is since the first asset that was added will have id = 0, so we need to make sure that that asset wasn't already added

        if (!reserveAlreadyAdded) {
            _reserves[asset][trancheId].id = uint8(reservesCount);
            _reservesList[trancheId][reservesCount] = asset;

            _reservesCount[trancheId] = reservesCount + 1;
        }
    }
}
