// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {VersionedInitializable} from "../libraries/aave-upgradeability/VersionedInitializable.sol";
import {InitializableImmutableAdminUpgradeabilityProxy} from "../libraries/aave-upgradeability/InitializableImmutableAdminUpgradeabilityProxy.sol";
import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {IInitializableDebtToken} from "../../interfaces/IInitializableDebtToken.sol";
import {IInitializableAToken} from "../../interfaces/IInitializableAToken.sol";
import {IAaveIncentivesController} from "../../interfaces/IAaveIncentivesController.sol";
import {ILendingPoolConfigurator} from "../../interfaces/ILendingPoolConfigurator.sol";
import {IAToken} from "../../interfaces/IAToken.sol";

import "../../dependencies/openzeppelin/contracts/utils/Strings.sol";

/**
 * @title LendingPoolConfigurator contract
 * @author Aave
 * @dev Implements the configuration methods for the Aave protocol
 **/

contract LendingPoolConfigurator is
    VersionedInitializable,
    ILendingPoolConfigurator
{
    using SafeMath for uint256;
    using PercentageMath for uint256;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;

    ILendingPoolAddressesProvider internal addressesProvider;
    ILendingPool internal pool;
    address internal DefaultVMEXTreasury;

    modifier onlyGlobalAdmin() {
        //global admin will be able to have access to other tranches, also can set portion of reserve taken as fee for VMEX admin
        require(
            addressesProvider.getGlobalAdmin() == msg.sender,
            "Caller not global VMEX admin"
        );
        _;
    }

    modifier onlyPoolAdmin(uint64 trancheId) {
        require(
            addressesProvider.getPoolAdmin(trancheId) == msg.sender ||
                addressesProvider.getGlobalAdmin() == msg.sender, //getPoolAdmin(trancheId) gets the admin for a specific tranche
            Errors.CALLER_NOT_POOL_ADMIN
        );
        _;
    }

    modifier onlyEmergencyAdmin(uint64 trancheId) {
        require(
            addressesProvider.getEmergencyAdmin(trancheId) == msg.sender,
            Errors.LPC_CALLER_NOT_EMERGENCY_ADMIN
        );
        _;
    }

    modifier whitelistedAddress() {
        require(
            addressesProvider.isWhitelistedAddress(msg.sender),
            "Sender is not whitelisted to add new tranche"
        );
        _;
    }

    uint256 internal constant CONFIGURATOR_REVISION = 0x1;

    function getRevision() internal pure override returns (uint256) {
        return CONFIGURATOR_REVISION;
    }

    function initialize(address provider) public initializer {
        addressesProvider = ILendingPoolAddressesProvider(provider);
        pool = ILendingPool(addressesProvider.getLendingPool());
    }

    function setDefaultVMEXTreasury(address add) external onlyGlobalAdmin {
        DefaultVMEXTreasury = add;
    }

    /**
     * @dev Initializes reserves in batch. Purpose is for people who want to create their own permissionless tranche, doesn't require any checks besides that trancheId is unique
     **/
    function claimTrancheId(
        uint64 trancheId, //uint256
        address admin,
        address emergencyAdmin
    ) external whitelistedAddress {
        //whitelist only
        addressesProvider.addPoolAdmin(admin, trancheId);
        addressesProvider.addEmergencyAdmin(emergencyAdmin, trancheId);
    }

    /**
     * @dev Initializes reserves in batch. Can be called directly by those who already created tranches and want to add new reserves to their tranche
     **/
    function batchInitReserve(
        DataTypes.InitReserveInput[] calldata input,
        uint64 trancheId
    ) external onlyPoolAdmin(trancheId) {
        ILendingPool cachedPool = pool;
        for (uint256 i = 0; i < input.length; i++) {
            _initReserve(
                cachedPool,
                DataTypes.InitReserveInputInternal(input[i], trancheId)
            );
        }
    }

    //vmex assisted edits
    //modifier onlyGlobalAdmin()

    function _initReserve(
        ILendingPool pool,
        DataTypes.InitReserveInputInternal memory internalInput
    ) internal {
        address aTokenProxyAddress;

        {
            aTokenProxyAddress = _initTokenWithProxy(
                internalInput.input.aTokenImpl,
                abi.encodeWithSelector(
                    IInitializableAToken.initialize.selector,
                    pool,
                    address(this), //lendingPoolConfigurator address
                    internalInput.input.treasury,
                    DefaultVMEXTreasury,
                    internalInput.input.underlyingAsset,
                    internalInput.trancheId,
                    IAaveIncentivesController(
                        internalInput.input.incentivesController
                    ),
                    internalInput.input.underlyingAssetDecimals,
                    string(
                        abi.encodePacked(
                            internalInput.input.aTokenName,
                            Strings.toString(internalInput.trancheId)
                        )
                    ),
                    string(
                        abi.encodePacked(
                            internalInput.input.aTokenSymbol,
                            Strings.toString(internalInput.trancheId)
                        )
                    ),
                    internalInput.input.params
                )
            );
        }
        address stableDebtTokenProxyAddress;
        {
            stableDebtTokenProxyAddress = _initTokenWithProxy(
                internalInput.input.stableDebtTokenImpl,
                abi.encodeWithSelector(
                    IInitializableDebtToken.initialize.selector,
                    pool,
                    internalInput.input.underlyingAsset,
                    internalInput.trancheId,
                    IAaveIncentivesController(
                        internalInput.input.incentivesController
                    ),
                    internalInput.input.underlyingAssetDecimals,
                    string(
                        abi.encodePacked(
                            internalInput.input.stableDebtTokenName,
                            Strings.toString(internalInput.trancheId)
                        )
                    ), //abi.encodePacked(input.stableDebtTokenName, trancheId),
                    string(
                        abi.encodePacked(
                            internalInput.input.stableDebtTokenSymbol,
                            Strings.toString(internalInput.trancheId)
                        )
                    ), //abi.encodePacked(input.stableDebtTokenSymbol, trancheId),
                    internalInput.input.params
                )
            );
        }

        address variableDebtTokenProxyAddress;
        {
            variableDebtTokenProxyAddress = _initTokenWithProxy(
                internalInput.input.variableDebtTokenImpl,
                abi.encodeWithSelector(
                    IInitializableDebtToken.initialize.selector,
                    pool,
                    internalInput.input.underlyingAsset,
                    internalInput.trancheId,
                    IAaveIncentivesController(
                        internalInput.input.incentivesController
                    ),
                    internalInput.input.underlyingAssetDecimals,
                    string(
                        abi.encodePacked(
                            internalInput.input.variableDebtTokenName,
                            Strings.toString(internalInput.trancheId)
                        )
                    ), //abi.encodePacked(input.variableDebtTokenName, trancheId),
                    string(
                        abi.encodePacked(
                            internalInput.input.variableDebtTokenSymbol,
                            Strings.toString(internalInput.trancheId)
                        )
                    ), //abi.encodePacked(input.variableDebtTokenSymbol,trancheId),
                    internalInput.input.params
                )
            );
        }

        pool.initReserve(
            internalInput.input,
            aTokenProxyAddress,
            stableDebtTokenProxyAddress,
            variableDebtTokenProxyAddress,
            internalInput.trancheId
        );

        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(
                internalInput.input.underlyingAsset,
                internalInput.trancheId
            );

        currentConfig.setDecimals(internalInput.input.underlyingAssetDecimals);

        currentConfig.setActive(true);
        currentConfig.setFrozen(false);

        pool.setConfiguration(
            internalInput.input.underlyingAsset,
            internalInput.trancheId,
            currentConfig.data
        );

        pool.setAssetData(
            internalInput.input.underlyingAsset,
            internalInput.input.assetType
        ); //initialize all asset risks

        emit ReserveInitialized(
            internalInput.input.underlyingAsset,
            aTokenProxyAddress,
            stableDebtTokenProxyAddress,
            variableDebtTokenProxyAddress,
            internalInput.input.interestRateStrategyAddress
        );
    }

    function updateTreasuryAddress(
        address newAddress,
        address asset,
        uint64 trancheId
    ) external onlyPoolAdmin(trancheId) {
        ILendingPool cachedPool = pool;
        IAToken(cachedPool.getReserveData(asset, trancheId).aTokenAddress)
            .setTreasury(newAddress);
    }

    function updateVMEXTreasuryAddress(
        address newAddress,
        address asset,
        uint64 trancheId
    ) external onlyGlobalAdmin {
        ILendingPool cachedPool = pool;
        IAToken(cachedPool.getReserveData(asset, trancheId).aTokenAddress)
            .setVMEXTreasury(newAddress);
    }

    struct updateATokenVars {
        address DefaultVMEXTreasury;
        uint256 decimals;
        ILendingPool cachedPool;
        DataTypes.ReserveData reserveData;
    }

    /**
     * @dev Updates the aToken implementation for the reserve
     **/
    function updateAToken(UpdateATokenInput calldata input, uint64 trancheID)
        external
    {
        {
            //placed here instead of modifier because of stack too deep
            require(
                addressesProvider.getPoolAdmin(trancheID) == msg.sender ||
                    addressesProvider.getGlobalAdmin() == msg.sender, //getPoolAdmin(trancheId) gets the admin for a specific tranche
                Errors.CALLER_NOT_POOL_ADMIN
            );
        }
        updateATokenVars memory vars;
        {
            vars.cachedPool = pool;

            vars.reserveData = vars.cachedPool.getReserveData(
                input.asset,
                input.trancheId
            );

            (, , , vars.decimals, ) = vars
                .cachedPool
                .getConfiguration(input.asset, input.trancheId)
                .getParamsMemory();
        }

        bytes memory encodedCall = abi.encodeWithSelector(
            IInitializableAToken.initialize.selector,
            vars.cachedPool,
            address(this),
            input.treasury,
            DefaultVMEXTreasury,
            input.asset,
            input.incentivesController,
            vars.decimals,
            input.name,
            input.symbol,
            input.params
        );

        _upgradeTokenImplementation(
            vars.reserveData.aTokenAddress,
            input.implementation,
            encodedCall
        );

        emit ATokenUpgraded(
            input.asset,
            vars.reserveData.aTokenAddress,
            input.implementation
        );
    }

    /**
     * @dev Updates the stable debt token implementation for the reserve
     **/
    function updateStableDebtToken(
        UpdateDebtTokenInput calldata input,
        uint64 trancheID
    ) external onlyPoolAdmin(trancheID) {
        ILendingPool cachedPool = pool;

        DataTypes.ReserveData memory reserveData = cachedPool.getReserveData(
            input.asset,
            input.trancheId
        );

        (, , , uint256 decimals, ) = cachedPool
            .getConfiguration(input.asset, input.trancheId)
            .getParamsMemory();

        bytes memory encodedCall = abi.encodeWithSelector(
            IInitializableDebtToken.initialize.selector,
            cachedPool,
            input.asset,
            input.incentivesController,
            decimals,
            input.name,
            input.symbol,
            input.params
        );

        _upgradeTokenImplementation(
            reserveData.stableDebtTokenAddress,
            input.implementation,
            encodedCall
        );

        emit StableDebtTokenUpgraded(
            input.asset,
            reserveData.stableDebtTokenAddress,
            input.implementation
        );
    }

    /**
     * @dev Updates the variable debt token implementation for the asset
     **/
    function updateVariableDebtToken(
        UpdateDebtTokenInput calldata input,
        uint64 trancheID
    ) external onlyPoolAdmin(trancheID) {
        ILendingPool cachedPool = pool;

        DataTypes.ReserveData memory reserveData = cachedPool.getReserveData(
            input.asset,
            input.trancheId
        );

        (, , , uint256 decimals, ) = cachedPool
            .getConfiguration(input.asset, input.trancheId)
            .getParamsMemory();

        bytes memory encodedCall = abi.encodeWithSelector(
            IInitializableDebtToken.initialize.selector,
            cachedPool,
            input.asset,
            input.incentivesController,
            decimals,
            input.name,
            input.symbol,
            input.params
        );

        _upgradeTokenImplementation(
            reserveData.variableDebtTokenAddress,
            input.implementation,
            encodedCall
        );

        emit VariableDebtTokenUpgraded(
            input.asset,
            reserveData.variableDebtTokenAddress,
            input.implementation
        );
    }

    /**
     * @dev Enables borrowing on a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param stableBorrowRateEnabled True if stable borrow rate needs to be enabled by default on this reserve
     **/
    function enableBorrowingOnReserve(
        address asset,
        uint64 trancheId,
        bool stableBorrowRateEnabled
    ) external onlyPoolAdmin(trancheId) {
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setBorrowingEnabled(true);
        currentConfig.setStableRateBorrowingEnabled(stableBorrowRateEnabled);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit BorrowingEnabledOnReserve(asset, stableBorrowRateEnabled);
    }

    /**
     * @dev Disables borrowing on a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function disableBorrowingOnReserve(address asset, uint64 trancheId)
        external
        onlyPoolAdmin(trancheId)
    {
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setBorrowingEnabled(false);

        pool.setConfiguration(asset, trancheId, currentConfig.data);
        emit BorrowingDisabledOnReserve(asset);
    }

    /**
     * @dev Configures the reserve collateralization parameters
     * all the values are expressed in percentages with two decimals of precision. A valid value is 10000, which means 100.00%
     * @param asset The address of the underlying asset of the reserve
     * @param ltv The loan to value of the asset when used as collateral
     * @param liquidationThreshold The threshold at which loans using this asset as collateral will be considered undercollateralized
     * @param liquidationBonus The bonus liquidators receive to liquidate this asset. The values is always above 100%. A value of 105%
     * means the liquidator will receive a 5% bonus
     **/
    function configureReserveAsCollateral(
        address asset,
        uint64 trancheId,
        uint256 ltv,
        uint256 liquidationThreshold,
        uint256 liquidationBonus
    ) external onlyPoolAdmin(trancheId) {
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        //validation of the parameters: the LTV can
        //only be lower or equal than the liquidation threshold
        //(otherwise a loan against the asset would cause instantaneous liquidation)
        require(ltv <= liquidationThreshold, Errors.LPC_INVALID_CONFIGURATION);

        if (liquidationThreshold != 0) {
            //liquidation bonus must be bigger than 100.00%, otherwise the liquidator would receive less
            //collateral than needed to cover the debt
            require(
                liquidationBonus > PercentageMath.PERCENTAGE_FACTOR,
                Errors.LPC_INVALID_CONFIGURATION
            );

            //if threshold * bonus is less than PERCENTAGE_FACTOR, it's guaranteed that at the moment
            //a loan is taken there is enough collateral available to cover the liquidation bonus
            require(
                liquidationThreshold.percentMul(liquidationBonus) <=
                    PercentageMath.PERCENTAGE_FACTOR,
                Errors.LPC_INVALID_CONFIGURATION
            );
        } else {
            require(liquidationBonus == 0, Errors.LPC_INVALID_CONFIGURATION);
            //if the liquidation threshold is being set to 0,
            // the reserve is being disabled as collateral. To do so,
            //we need to ensure no liquidity is deposited
            _checkNoLiquidity(asset, trancheId);
        }

        currentConfig.setLtv(ltv);
        currentConfig.setLiquidationThreshold(liquidationThreshold);
        currentConfig.setLiquidationBonus(liquidationBonus);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit CollateralConfigurationChanged(
            asset,
            ltv,
            liquidationThreshold,
            liquidationBonus
        );
    }


    /**
     * @dev Activates a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function activateReserve(address asset, uint64 trancheId)
        external
        onlyPoolAdmin(trancheId)
    {
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setActive(true);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit ReserveActivated(asset);
    }

    /**
     * @dev Deactivates a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function deactivateReserve(address asset, uint64 trancheId)
        external
        onlyPoolAdmin(trancheId)
    {
        _checkNoLiquidity(asset, trancheId);

        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setActive(false);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit ReserveDeactivated(asset);
    }

    /**
     * @dev Enable stable rate borrowing on a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function enableReserveStableRate(address asset, uint64 trancheId)
        external
        onlyPoolAdmin(trancheId)
    {
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setStableRateBorrowingEnabled(true);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit StableRateEnabledOnReserve(asset);
    }

    /**
     * @dev Disable stable rate borrowing on a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function disableReserveStableRate(address asset, uint64 trancheId)
        external
        onlyPoolAdmin(trancheId)
    {
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setStableRateBorrowingEnabled(false);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit StableRateDisabledOnReserve(asset);
    }


    /**
     * @dev Note this can only be called by global admin. Individual pool owners can't set the data for the asset, but can set the data for their own reserves
     **/
    function setAssetData(address asset, uint8 _assetType)
        external
        onlyGlobalAdmin
    {
        pool.setAssetData(asset, _assetType);
        emit AssetDataChanged(asset, _assetType);
    }

    /**
     * @dev Sets the interest rate strategy of a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param rateStrategyAddress The new address of the interest strategy contract
     **/
    function setReserveInterestRateStrategyAddress(
        address asset,
        uint64 trancheId,
        address rateStrategyAddress
    ) external onlyPoolAdmin(trancheId) {
        pool.setReserveInterestRateStrategyAddress(
            asset,
            trancheId,
            rateStrategyAddress
        );
        emit ReserveInterestRateStrategyChanged(asset, rateStrategyAddress);
    }

    /**
     * @dev pauses or unpauses all the actions of the protocol, including aToken transfers
     * @param val true if protocol needs to be paused, false otherwise
     **/
    function setPoolPause(bool val, uint64 trancheId)
        external
        onlyEmergencyAdmin(trancheId)
    {
        pool.setPause(val, trancheId);
    }

    function _initTokenWithProxy(
        address implementation,
        bytes memory initParams
    ) internal returns (address) {
        InitializableImmutableAdminUpgradeabilityProxy proxy = new InitializableImmutableAdminUpgradeabilityProxy(
                address(this)
            );

        proxy.initialize(implementation, initParams);

        return address(proxy);
    }

    function _upgradeTokenImplementation(
        address proxyAddress,
        address implementation,
        bytes memory initParams
    ) internal {
        InitializableImmutableAdminUpgradeabilityProxy proxy = InitializableImmutableAdminUpgradeabilityProxy(
                payable(proxyAddress)
            );

        proxy.upgradeToAndCall(implementation, initParams);
    }

    function _checkNoLiquidity(address asset, uint64 trancheId) internal view {
        DataTypes.ReserveData memory reserveData = pool.getReserveData(
            asset,
            trancheId
        );

        uint256 availableLiquidity = IERC20Detailed(asset).balanceOf(
            reserveData.aTokenAddress
        );

        require(
            availableLiquidity == 0 && reserveData.currentLiquidityRate == 0,
            Errors.LPC_RESERVE_LIQUIDITY_NOT_0
        );
    }

    function addStrategy(
        address asset,
        uint64 trancheId,
        address strategy
    ) external onlyPoolAdmin(trancheId) {
        pool.addStrategy(asset, trancheId, strategy);
        emit StrategyAdded(asset, trancheId, strategy);
    }

    function withdrawFromStrategy(
        address asset,
        uint64 trancheId,
        uint256 amount
    ) external onlyPoolAdmin(trancheId) {
        pool.withdrawFromStrategy(asset, trancheId, amount);
        emit WithdrawFromStrategy(asset, trancheId, amount);
    }
}
