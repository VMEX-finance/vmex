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
import {DeployATokens} from "../libraries/helpers/DeployATokens.sol";
import {AssetMappings} from "./AssetMappings.sol";
import {CrvLpStrategy} from "../strategies/strats/CrvLpStrategy.sol";

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
    uint256 internal DefaultVMEXReserveFactor;
    uint64 public totalTranches;
    mapping(uint64 => string) public trancheNames; //just for frontend purposes

    modifier onlyGlobalAdmin() {
        //global admin will be able to have access to other tranches, also can set portion of reserve taken as fee for VMEX admin
        _onlyGlobalAdmin();
        _;
    }

    function _onlyGlobalAdmin() internal view {
        //this contract handles the updates to the configuration
        require(
            addressesProvider.getGlobalAdmin() == msg.sender,
            "Caller not global VMEX admin"
        );
    }

    modifier onlyPoolAdmin(uint64 trancheId) {
        _onlyPoolAdmin(trancheId);
        _;
    }

    function _onlyPoolAdmin(uint64 trancheId) internal view {
        //this contract handles the updates to the configuration
        require(
            addressesProvider.getPoolAdmin(trancheId) == msg.sender ||
                addressesProvider.getGlobalAdmin() == msg.sender, //getPoolAdmin(trancheId) gets the admin for a specific tranche
            Errors.CALLER_NOT_POOL_ADMIN
        );
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
        DefaultVMEXTreasury = 0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49; //in case we forget to set
        DefaultVMEXReserveFactor = 1000;
    }

    function setDefaultVMEXTreasury(address add) external onlyGlobalAdmin {
        DefaultVMEXTreasury = add;
    }

    /**
     * @dev Initializes reserves in batch. Purpose is for people who want to create their own permissionless tranche, doesn't require any checks besides that trancheId is unique
     * @return trancheId given to the user
     **/
    function claimTrancheId(
        string calldata name,
        address admin
    ) external whitelistedAddress returns (uint256 trancheId) {
        //whitelist only
        uint64 givenTranche = totalTranches;
        addressesProvider.addPoolAdmin(admin, givenTranche);
        trancheNames[givenTranche] = name;
        totalTranches += 1;
        return givenTranche;
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
                DataTypes.InitReserveInputInternal(
                    input[i],
                    trancheId,
                    addressesProvider.getAToken(),
                    addressesProvider.getStableDebtToken(),
                    addressesProvider.getVariableDebtToken(),
                    AssetMappings(addressesProvider.getAssetMappings()).getAssetMapping(input[i].underlyingAsset)
                ) //by putting assetmappings in the addresses provider, we have flexibility to upgrade it in the future
            );
        }
    }

    function _initReserve(
        ILendingPool pool,
        DataTypes.InitReserveInputInternal memory internalInput
    ) internal {
        (
            address aTokenProxyAddress,
            address stableDebtTokenProxyAddress,
            address variableDebtTokenProxyAddress
        ) = DeployATokens.deployATokens(
                DeployATokens.deployATokensVars(
                    pool,
                    DefaultVMEXTreasury,
                    internalInput
                )
            );

        pool.initReserve(
            internalInput.input.underlyingAsset,
            internalInput.trancheId,
            AssetMappings(addressesProvider.getAssetMappings()).getInterestRateStrategyAddress(internalInput.input.underlyingAsset,internalInput.input.interestRateChoice),
            aTokenProxyAddress,
            stableDebtTokenProxyAddress,
            variableDebtTokenProxyAddress
        );

        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(
                internalInput.input.underlyingAsset,
                internalInput.trancheId
            );

        currentConfig.setLtv(internalInput.assetdata.baseLTV);
        if(internalInput.assetdata.liquidationThreshold != 0){ //asset mappings does not force disable borrow
            //user's choice matters
            if(internalInput.input.canBeCollateral){
                currentConfig.setLiquidationThreshold(internalInput.assetdata.liquidationThreshold);
            }
            else{
                currentConfig.setLiquidationThreshold(0);
            }

        }
        else{
            currentConfig.setLiquidationThreshold(0);
        }

        currentConfig.setLiquidationBonus(internalInput.assetdata.liquidationBonus);
        currentConfig.setStableRateBorrowingEnabled(internalInput.assetdata.stableBorrowingEnabled);
        if(internalInput.assetdata.borrowingEnabled){
            //user's choice matters
            currentConfig.setBorrowingEnabled(internalInput.input.canBorrow);
        }
        else{
            //force to be disabled
            currentConfig.setBorrowingEnabled(false);
        }

        currentConfig.setReserveFactor(internalInput.input.reserveFactor);
        currentConfig.setVMEXReserveFactor(DefaultVMEXReserveFactor);

        currentConfig.setDecimals(internalInput.assetdata.underlyingAssetDecimals);

        currentConfig.setActive(true);
        currentConfig.setFrozen(false);

        pool.setConfiguration(
            internalInput.input.underlyingAsset,
            internalInput.trancheId,
            currentConfig.data
        );

        emit ReserveInitialized(
            internalInput.input.underlyingAsset,
            internalInput.trancheId,
            aTokenProxyAddress,
            stableDebtTokenProxyAddress,
            variableDebtTokenProxyAddress,
            AssetMappings(addressesProvider.getAssetMappings()).getInterestRateStrategyAddress(internalInput.input.underlyingAsset,internalInput.input.interestRateChoice)
        );
    }

    function addWhitelistedDepositBorrow(address user)
        external
        onlyGlobalAdmin
    {
        ILendingPool cachedPool = pool;
        cachedPool.addWhitelistedDepositBorrow(user);
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
        UpdateATokenInput input;
    }

    /**
     * @dev Updates the aToken implementation for the reserve
     **/
    function updateAToken(UpdateATokenInput calldata input)
        external
        onlyGlobalAdmin
    {
        updateATokenVars memory vars;
        {
            vars.input  = input;
            vars.cachedPool = pool;
            vars.DefaultVMEXTreasury = DefaultVMEXTreasury;

            vars.reserveData = vars.cachedPool.getReserveData(
                vars.input.asset,
                vars.input.trancheId
            );

            (, , , vars.decimals, ) = vars
                .cachedPool
                .getConfiguration(vars.input.asset, vars.input.trancheId)
                .getParamsMemory();
        }

        bytes memory encodedCall = abi.encodeWithSelector(
            IInitializableAToken.initialize.selector, //selects that we want to call the initialize function
            vars.cachedPool,
            address(this),
            vars.input.treasury,
            vars.DefaultVMEXTreasury,
            vars.input.asset,
            vars.input.trancheId,
            vars.input.incentivesController,
            vars.decimals,
            vars.input.name,
            vars.input.symbol,
            vars.input.params
        );

        _upgradeTokenImplementation(
            vars.reserveData.aTokenAddress,
            vars.input.implementation,
            encodedCall
        );

        emit ATokenUpgraded(
            vars.input.asset,
            vars.input.trancheId,
            vars.reserveData.aTokenAddress,
            vars.input.implementation
        );
    }

    /**
     * @dev Updates the variable debt token implementation for the asset
     **/
    function updateVariableDebtToken(
        UpdateDebtTokenInput calldata input
    ) external onlyGlobalAdmin {
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
            input.trancheId,
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
            input.trancheId,
            reserveData.variableDebtTokenAddress,
            input.implementation
        );
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
  ) external onlyGlobalAdmin {
    DataTypes.ReserveConfigurationMap memory currentConfig = pool.getConfiguration(asset,trancheId);

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
        liquidationThreshold.percentMul(liquidationBonus) <= PercentageMath.PERCENTAGE_FACTOR,
        Errors.LPC_INVALID_CONFIGURATION
      );
    } else {
      require(liquidationBonus == 0, Errors.LPC_INVALID_CONFIGURATION);
      //if the liquidation threshold is being set to 0,
      // the reserve is being disabled as collateral. To do so,
      //we need to ensure no liquidity is deposited
      _checkNoLiquidity(asset,trancheId);
    }

    currentConfig.setLtv(ltv);
    currentConfig.setLiquidationThreshold(liquidationThreshold);
    currentConfig.setLiquidationBonus(liquidationBonus);

    pool.setConfiguration(asset,trancheId, currentConfig.data);

    emit CollateralConfigurationChanged(asset, trancheId, ltv, liquidationThreshold, liquidationBonus);
  }

    /**
     * @dev Enables borrowing on a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function enableBorrowingOnReserve(
        address asset,
        uint64 trancheId,
        bool stableBorrowRateEnabled
    ) public onlyPoolAdmin(trancheId) {
        require(AssetMappings(addressesProvider.getAssetMappings()).getAssetBorrowable(asset), "Asset is not approved to be set as borrowable");
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setBorrowingEnabled(true);
        currentConfig.setStableRateBorrowingEnabled(stableBorrowRateEnabled);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit BorrowingEnabledOnReserve(asset, trancheId);
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
        emit BorrowingDisabledOnReserve(asset, trancheId);
    }

    function enableCollateralOnReserve(address asset, uint64 trancheId)
        external
        onlyPoolAdmin(trancheId)
    {
        require(AssetMappings(addressesProvider.getAssetMappings()).getAssetBorrowable(asset), "Asset is not approved to be set as collateral");
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setBorrowingEnabled(true);

        pool.setConfiguration(asset, trancheId, currentConfig.data);
        emit CollateralEnabledOnReserve(asset, trancheId);
    }

    /**
     * @dev Updates the reserve factor of a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param reserveFactor The new reserve factor of the reserve
     **/
    function setReserveFactor(
        address asset,
        uint64 trancheId,
        uint256 reserveFactor
    ) public onlyPoolAdmin(trancheId) {
        DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
            pool
        ).getConfiguration(asset, trancheId);

        currentConfig.setReserveFactor(reserveFactor);

        ILendingPool(pool).setConfiguration(
            asset,
            trancheId,
            currentConfig.data
        );

        emit ReserveFactorChanged(asset, trancheId, reserveFactor);
    }

    /**
     * @dev Updates the vmex reserve factor of a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param reserveFactor The new reserve factor of the reserve
     **/
    function setVMEXReserveFactor(
        address asset,
        uint64 trancheId,
        uint256 reserveFactor //the value here should only occupy 16 bits
    ) public onlyGlobalAdmin {
        DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
            pool
        ).getConfiguration(asset, trancheId);

        currentConfig.setVMEXReserveFactor(reserveFactor);

        ILendingPool(pool).setConfiguration(
            asset,
            trancheId,
            currentConfig.data
        );

        emit VMEXReserveFactorChanged(asset, trancheId, reserveFactor);
    }


    /**
     * @dev Freezes a reserve. A frozen reserve doesn't allow any new deposit, borrow or rate swap
     *  but allows repayments, liquidations, rate rebalances and withdrawals
     * @param asset The address of the underlying asset of the reserve
     **/
    function freezeReserve(address asset, uint64 trancheId)
        external
        onlyPoolAdmin(trancheId)
    {
        DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
            pool
        ).getConfiguration(asset, trancheId);

        currentConfig.setFrozen(true);

        ILendingPool(pool).setConfiguration(
            asset,
            trancheId,
            currentConfig.data
        );

        emit ReserveFrozen(asset, trancheId);
    }

    /**
     * @dev Unfreezes a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function unfreezeReserve(address asset, uint64 trancheId)
        external
        onlyPoolAdmin(trancheId)
    {
        DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
            pool
        ).getConfiguration(asset, trancheId);

        currentConfig.setFrozen(false);

        ILendingPool(pool).setConfiguration(
            asset,
            trancheId,
            currentConfig.data
        );

        emit ReserveUnfrozen(asset, trancheId);
    }

    /**
     * @dev Activates a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function activateReserve(address asset, uint64 trancheId)
        external
        onlyGlobalAdmin
    {
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setActive(true);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit ReserveActivated(asset, trancheId);
    }

    /**
     * @dev Deactivates a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function deactivateReserve(address asset, uint64 trancheId)
        external
        onlyGlobalAdmin
    {
        _checkNoLiquidity(asset, trancheId);

        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setActive(false);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit ReserveDeactivated(asset, trancheId);
    }

    /**
     * @dev Sets the interest rate strategy of a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param rateStrategyAddressId The new address of the interest strategy contract
     **/
    function setReserveInterestRateStrategyAddress(
        address asset,
        uint64 trancheId,
        uint8 rateStrategyAddressId
    ) external onlyPoolAdmin(trancheId) {
        address rateStrategyAddress = AssetMappings(addressesProvider.getAssetMappings()).getInterestRateStrategyAddress(asset,rateStrategyAddressId);

        pool.setReserveInterestRateStrategyAddress(
            asset,
            trancheId,
            rateStrategyAddress
        );
        emit ReserveInterestRateStrategyChanged(asset, trancheId, rateStrategyAddress);
    }

    /**
     * @dev pauses or unpauses all the actions of the protocol, including aToken transfers
     * @param val true if protocol needs to be paused, false otherwise
     **/
    function setPoolPause(bool val, uint64 trancheId)
        external
        onlyGlobalAdmin
    {
        pool.setPause(val, trancheId);
    }

    function _upgradeTokenImplementation(
        address proxyAddress, //current address of the token
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
        uint8 strategyId
    ) external onlyPoolAdmin(trancheId) {
        address strategy = AssetMappings(addressesProvider.getAssetMappings()).getCurveStrategyAddress(asset,strategyId);
        address impl = DeployATokens._initTokenWithProxy(
            strategy,
            abi.encodeWithSelector(
                CrvLpStrategy.initialize.selector,
                address(addressesProvider),
                asset,
                trancheId
            )
        );

        pool.setAndApproveStrategy(asset,trancheId,impl);
        emit StrategyAdded(asset, trancheId, strategy);
    }

    // function addStrategy(
    //     address asset,
    //     uint64 trancheId,
    //     uint8 strategyId
    // ) external onlyPoolAdmin(trancheId) {
    //     address strategy = AssetMappings(addressesProvider.getAssetMappings()).getCurveStrategyAddress(asset,strategyId);
    //     pool.addStrategy(asset, trancheId, strategy);
    //     emit StrategyAdded(asset, trancheId, strategy);
    // }

    function setWhitelist(uint64 trancheId, address[] calldata user, bool[] calldata isWhitelisted) external onlyPoolAdmin(trancheId) {
        require(user.length == isWhitelisted.length, "whitelist lengths not equal");
        for(uint i = 0;i<user.length;i++){
            pool.addToWhitelist(trancheId, user[i], isWhitelisted[i]);
        }
    }

    function setBlacklist(uint64 trancheId, address[] calldata user, bool[] calldata isBlacklisted) external onlyPoolAdmin(trancheId) {
        require(user.length == isBlacklisted.length, "Blacklisted lengths not equal");
        for(uint i = 0;i<user.length;i++){
            pool.addToBlacklist(trancheId, user[i], isBlacklisted[i]);
        }
    }
}
