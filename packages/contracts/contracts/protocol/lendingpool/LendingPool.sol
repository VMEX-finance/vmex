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
import {AssetMappings} from "./AssetMappings.sol";
import {DepositWithdrawLogic} from "../libraries/logic/DepositWithdrawLogic.sol";
//import "hardhat/console.sol";
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
        _whenNotPaused(trancheId);
        _;
    }
    function _whenNotPaused(uint64 trancheId) internal view {
        require(!_paused[trancheId], Errors.LP_IS_PAUSED);
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

    // modifier onlyATokensAndRatesHelperOrConfigurator() {
    //     //this contract handles the updates to the configuration
    //     _onlyATokensAndRatesHelperOrConfigurator();
    //     _;
    // }

    // function _onlyATokensAndRatesHelperOrConfigurator() internal view {
    //     //this contract handles the updates to the configuration
    //     require(
    //         _addressesProvider.getATokenAndRatesHelper() == msg.sender ||
    //             _addressesProvider.getLendingPoolConfigurator() == msg.sender,
    //         "Caller is not ATokensAndRatesHelper"
    //     );
    // }

    modifier onlyWhitelistedDepositBorrow(uint64 trancheId) {
        _onlyWhitelistedDepositBorrow(trancheId);
        _;
    }

    function _onlyWhitelistedDepositBorrow(uint64 trancheId) internal view {
        if (isWhitelistedDepositBorrow[msg.sender] == false) {
            require(
                lastUserBorrow[msg.sender][trancheId] != block.number,
                "User is not whitelisted to borrow and deposit in same block"
            );
        }
    }

    function addWhitelistedDepositBorrow(address user)
        external
        override
        onlyLendingPoolConfigurator
    {
        isWhitelistedDepositBorrow[user] = true;
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
        _maxNumberOfReserves = 128; //this might actually be fine since this is max number of reserves per trancheId?
        _assetMappings =  AssetMappings(_addressesProvider.getAssetMappings());
    }

    /**
     * @dev Deposits an `amount` of underlying asset into the reserve, receiving in return overlying aTokens.
     * - E.g. User deposits 100 USDC and gets in return 100 aUSDC
     * @param asset The address of the underlying asset to deposit
     * @param trancheId The trancheId of the underlying asset to deposit
     * @param amount The amount to be deposited
     * @param onBehalfOf The address that will receive the aTokens, same as msg.sender if the user
     *   wants to receive them on his own wallet, or a different address if the beneficiary of aTokens
     *   is a different wallet
     * @param referralCode Code used to register the integrator originating the operation, for potential rewards.
     *   0 if the action is executed directly by the user, without any middle-man
     **/
    function deposit(
        //TODO: has this been addressed yet?
        // allowing collateral changes here opens up possibility of attack where someone can try to change the collateral status of someone else, but this can only be done for the initial deposit
        //confusing interface where users can choose their isCollateral but it only matters for the first deposit
        address asset,
        uint64 trancheId,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    )
        public
        override
        whenNotPaused(trancheId)
        onlyWhitelistedDepositBorrow(trancheId)
    {
        if(isUsingWhitelist[trancheId]){
            require(whitelist[trancheId][msg.sender], "Tranche requires whitelist");
        }
        require(blacklist[trancheId][msg.sender]==false, "You are blacklisted from this tranche");
        //changed scope to public so transferTranche can call it
        if (isWhitelistedDepositBorrow[msg.sender] == false) {
            require(
                lastUserBorrow[msg.sender][trancheId] != block.number,
                "User is not whitelisted to borrow and deposit in same block"
            );
        }
        DataTypes.DepositVars memory vars = DataTypes.DepositVars(
                asset,
                trancheId,
                address(_addressesProvider),
                _assetMappings,
                amount,
                onBehalfOf,
                referralCode
            );

        _reserves[asset][trancheId]._deposit(
            vars,
            _usersConfig[onBehalfOf][trancheId]
        );

        lastUserDeposit[msg.sender][trancheId] = block.number;

        emit Deposit(
            vars.asset,
            vars.trancheId,
            msg.sender,
            vars.onBehalfOf,
            vars.amount,
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
    ) public override whenNotPaused(trancheId) returns (uint256) {
        if(isUsingWhitelist[trancheId]){
            require(whitelist[trancheId][msg.sender], "Tranche requires whitelist");
        }
        require(blacklist[trancheId][msg.sender]==false, "You are blacklisted from this tranche");

        uint256 actualAmount = DepositWithdrawLogic._withdraw(
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
                _assetMappings
            );

        emit Withdraw(asset, trancheId, msg.sender, to, actualAmount);
        return actualAmount;
    }

    /**
     * @dev Allows users to borrow a specific `amount` of the reserve underlying asset, provided that the borrower
     * already deposited enough collateral, or he was given enough allowance by a credit delegator on the
     * corresponding debt token (StableDebtToken or VariableDebtToken)
     * - E.g. User borrows 100 USDC passing as `onBehalfOf` his own address, receiving the 100 USDC in his wallet
     *   and 100 stable/variable debt tokens, depending on the `interestRateMode`
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
        public
        override
        whenNotPaused(trancheId)
        onlyWhitelistedDepositBorrow(trancheId)
    {
        if(isUsingWhitelist[trancheId]){
            require(whitelist[trancheId][msg.sender], "Tranche requires whitelist");
        }
        require(blacklist[trancheId][msg.sender]==false, "You are blacklisted from this tranche");
        if (isWhitelistedDepositBorrow[msg.sender] == false) {
            require(
                lastUserDeposit[msg.sender][trancheId] != block.number,
                "User is not whitelisted to borrow and deposit in same block"
            );
        }
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        DataTypes.ExecuteBorrowParams memory vars = DataTypes.ExecuteBorrowParams(
                asset,
                trancheId,
                msg.sender,
                onBehalfOf,
                amount,
                reserve.aTokenAddress,
                referralCode,
                true,
                _reservesCount[trancheId],
                _assetMappings
            );


        DataTypes.UserConfigurationMap storage userConfig = _usersConfig[
            onBehalfOf
        ][trancheId];

        DepositWithdrawLogic._borrowHelper(
            _reserves,
            _reservesList[trancheId],
            userConfig,
            _addressesProvider,
            vars
        );

        lastUserBorrow[msg.sender][trancheId] = block.number;

        emit Borrow(
            vars.asset,
            trancheId,
            vars.user,
            vars.onBehalfOf,
            vars.amount,
            reserve.currentVariableBorrowRate,
            vars.referralCode
        );
    }

    /**
     * @notice Repays a borrowed `amount` on a specific reserve, burning the equivalent debt tokens owned
     * - E.g. User repays 100 USDC, burning 100 variable/stable debt tokens of the `onBehalfOf` address
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
    ) external override returns (uint256) {
        require(!_paused[trancheId], Errors.LP_IS_PAUSED);
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        (, uint256 variableDebt) = Helpers.getUserCurrentDebt(
            onBehalfOf,
            reserve
        );

        ValidationLogic.validateRepay(
            reserve,
            amount,
            onBehalfOf,
            variableDebt
        );

        uint256 paybackAmount = variableDebt;

        if (amount < paybackAmount) {
            paybackAmount = amount;
        }

        reserve.updateState();

        IVariableDebtToken(reserve.variableDebtTokenAddress).burn(
            onBehalfOf,
            paybackAmount,
            reserve.variableBorrowIndex
        );

        address aToken = reserve.aTokenAddress;
        reserve.updateInterestRates(asset, aToken, paybackAmount, 0);

        if (variableDebt.sub(paybackAmount) == 0) {
            _usersConfig[onBehalfOf][trancheId].setBorrowing(reserve.id, false);
        }

        IERC20(asset).safeTransferFrom(msg.sender, aToken, paybackAmount);

        IAToken(aToken).handleRepayment(msg.sender, paybackAmount);

        emit Repay(asset, trancheId, onBehalfOf, msg.sender, paybackAmount);

        return paybackAmount;
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
        // ); // TODO: not sure if something like this is needed
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];

        ValidationLogic.validateSetUseReserveAsCollateral(
            reserve,
            asset,
            useAsCollateral,
            _reserves,
            _usersConfig[msg.sender][trancheId],
            _reservesList[trancheId],
            _reservesCount[trancheId],
            _addressesProvider,
            _assetMappings
        );

        _usersConfig[msg.sender][trancheId].setUsingAsCollateral(
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
    ) external override whenNotPaused(trancheId) {
        if(isUsingWhitelist[trancheId]){
            require(whitelist[trancheId][msg.sender], "Tranche requires whitelist");
        }
        require(blacklist[trancheId][msg.sender]==false, "You are blacklisted from this tranche");
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

//        console.log(string(abi.encodePacked(result)));

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
     * @dev Sets the liquidity index calculated from strategy
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @param newLiquidityIndex The new liquidity index of the reserve
     **/
    function setReserveDataLI(address asset, uint64 trancheId, uint128 newLiquidityIndex)
        external
        override
    {
        //onlyStrategy modifier
        DataTypes.ReserveData storage reserve = _reserves[asset][trancheId];
        require(msg.sender == IAToken(reserve.aTokenAddress).getStrategy(), "Caller must be strategy that is attached to the reserve" );
        reserve.liquidityIndex = newLiquidityIndex;
    }

    /**
     * @dev Returns the user account data across all the reserves in a specific trancheId
     * @param user The address of the user
     * @param trancheId The trancheId
     * @param useTwap 'true' if calculations should use TWAP, 'false' otherwise
     * @return totalCollateralETH the total collateral in ETH of the user
     * @return totalDebtETH the total debt in ETH of the user
     * @return availableBorrowsETH the borrowing power left of the user
     * @return currentLiquidationThreshold the liquidation threshold of the user
     * @return ltv the loan to value of the user
     * @return healthFactor the current health factor of the user
     **/
    function getUserAccountData(address user, uint64 trancheId, bool useTwap)
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
            _assetMappings,
            useTwap
        );

        availableBorrowsETH = GenericLogic.calculateAvailableBorrowsETH(
            totalCollateralETH,
            totalDebtETH,
            ltv
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
        return _usersConfig[user][trancheId];
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
        return _paused[trancheId];
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
            _assetMappings
        );

        uint256 reserveId = _reserves[asset][trancheId].id;

        if (from != to) {
            if (balanceFromBefore.sub(amount) == 0) {
                DataTypes.UserConfigurationMap
                    storage fromConfig = _usersConfig[from][trancheId];
                fromConfig.setUsingAsCollateral(reserveId, false);
                emit ReserveUsedAsCollateralDisabled(asset, trancheId, from);
            }

            if (balanceToBefore == 0 && amount != 0) {
                DataTypes.UserConfigurationMap storage toConfig = _usersConfig[
                    to
                ][trancheId];
                toConfig.setUsingAsCollateral(reserveId, true);
                emit ReserveUsedAsCollateralEnabled(asset, trancheId, to);
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
        address underlyingAsset,
        uint64 trancheId,
        address interestRateStrategyAddress,
        address aTokenAddress,
        address stableDebtAddress,
        address variableDebtAddress
    ) external override onlyLendingPoolConfigurator {
        require(
            Address.isContract(underlyingAsset),
            Errors.LP_NOT_CONTRACT
        );
        //considering requiring _reservesCount[trancheId] = 0, but you can add another asset to an existing tranche too.
        _reserves[underlyingAsset][trancheId].init(
            aTokenAddress,
            stableDebtAddress,
            variableDebtAddress,
            interestRateStrategyAddress,
            trancheId
        );

        // TODO: update for tranches
        _addReserveToList(underlyingAsset, trancheId);
    }

    // function setAssetData(address asset, uint8 _assetType)
    //     external
    //     override
    //     onlyLendingPoolConfigurator
    // {
    //     //TODO: edit permissions. Right now is onlyLendingPoolConfigurator
    //     assetDatas[asset] = DataTypes.ReserveAssetType(_assetType);
    // }

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
        onlyLendingPoolConfigurator     // TODO: change to onlyTrancheAdmin
    {
        _paused[trancheId] = val;
        if (_paused[trancheId]) {
            emit Paused(trancheId);
        } else {
            emit Unpaused(trancheId);
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



    function setAndApproveStrategy(
        address asset,
        uint64 trancheId,
        address strategy
    ) external override{
        IAToken(_reserves[asset][trancheId].aTokenAddress)
            .setAndApproveStrategy(strategy);
    }

    function withdrawFromStrategy(
        address asset,
        uint64 trancheId,
        uint256 amount
    ) external override onlyLendingPoolConfigurator {
        IAToken(_reserves[asset][trancheId].aTokenAddress).withdrawFromStrategy(
                amount
            );
    }

    function addToWhitelist(uint64 trancheId, address user, bool isWhitelisted) external override onlyLendingPoolConfigurator {
        if(!isUsingWhitelist[trancheId]){
            isUsingWhitelist[trancheId] = true;
        }
        whitelist[trancheId][user] = isWhitelisted;
    }

    function addToBlacklist(uint64 trancheId, address user, bool isBlacklisted) external override onlyLendingPoolConfigurator {
        blacklist[trancheId][user] = isBlacklisted;
    }
}
