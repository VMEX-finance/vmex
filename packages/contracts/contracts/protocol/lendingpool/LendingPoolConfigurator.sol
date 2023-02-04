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

import "../../dependencies/openzeppelin/contracts/utils/Strings.sol";
// import "hardhat/console.sol";
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
    AssetMappings internal assetMappings;
    ILendingPool internal pool;
    uint64 public totalTranches;

    modifier onlyEmergencyAdmin {
        require(
            addressesProvider.getEmergencyAdmin() == msg.sender,
            Errors.LPC_CALLER_NOT_EMERGENCY_ADMIN
        );
        _;
    }

    modifier onlyGlobalAdmin() {
        //global admin will be able to have access to other tranches, also can set portion of reserve taken as fee for VMEX admin
        _onlyGlobalAdmin();
        _;
    }

    function _onlyGlobalAdmin() internal view {
        //this contract handles the updates to the configuration
        require(
            addressesProvider.getGlobalAdmin() == msg.sender,
            Errors.CALLER_NOT_GLOBAL_ADMIN
        );
    }

    modifier onlyTrancheAdmin(uint64 trancheId) {
        _onlyTrancheAdmin(trancheId);
        _;
    }

    function _onlyTrancheAdmin(uint64 trancheId) internal view {
        //this contract handles the updates to the configuration
        require(
            addressesProvider.getTrancheAdmin(trancheId) == msg.sender ||
                addressesProvider.getGlobalAdmin() == msg.sender,
            Errors.CALLER_NOT_TRANCHE_ADMIN
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
        assetMappings = AssetMappings(addressesProvider.getAssetMappings());
    }

    /* ************************************************************************* */
    /* This next section contains functions available to any whitelisted address */
    /* ************************************************************************* */

    /**
     * @dev Claims the next available tranche id. Goes from 0 up to max(uint64). Claiming tranche id is first step
     * to create a tranche (permissionless or vmec-managed), doesn't require any checks besides that trancheId is unique
     * @param name The string name of the tranche
     * @param admin The address of the admin to this tranche id
     * @return trancheId The tranche id that the admin now manages
     **/
    function claimTrancheId(
        string calldata name,
        address admin
    ) external whitelistedAddress returns (uint256 trancheId) {
        //whitelist only
        uint64 givenTranche = totalTranches;
        addressesProvider.addTrancheAdmin(admin, givenTranche);
        totalTranches += 1;
        emit TrancheInitialized(givenTranche, name, admin);
        return givenTranche;
    }
    /* ******************************************************************************** */
    /* This next section contains functions only accessible to Tranche Admins and above */
    /* ******************************************************************************** */

    /**
     * @dev Initializes reserves in batch. Can be called directly by those who created tranches
     * and want to add new reserves to their tranche
     * @param input The specifications of the reserves to initialize
     * @param trancheId The trancheId that the msg.sender should be the admin of
     **/
    function batchInitReserve(
        DataTypes.InitReserveInput[] calldata input,
        uint64 trancheId
    ) external onlyTrancheAdmin(trancheId) {
        ILendingPool cachedPool = pool;
        for (uint256 i = 0; i < input.length; i++) {
            _initReserve(
                cachedPool,
                DataTypes.InitReserveInputInternal(
                    input[i],
                    trancheId,
                    addressesProvider.getAToken(),
                    addressesProvider.getVariableDebtToken(),
                    assetMappings.getAssetMapping(input[i].underlyingAsset)
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
            address variableDebtTokenProxyAddress
        ) = DeployATokens.deployATokens(
                DeployATokens.DeployATokensVars(
                    pool,
                    addressesProvider,
                    internalInput
                )
            );

        pool.initReserve(
            internalInput.input.underlyingAsset,
            internalInput.trancheId,
            assetMappings.getInterestRateStrategyAddress(internalInput.input.underlyingAsset,internalInput.input.interestRateChoice),
            aTokenProxyAddress,
            variableDebtTokenProxyAddress
        );

        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(
                internalInput.input.underlyingAsset,
                internalInput.trancheId
            );
        if (internalInput.assetdata.liquidationThreshold != 0) { //asset mappings does not force disable borrow
            //user's choice matters
            currentConfig.setCollateralEnabled(internalInput.input.canBeCollateral);
        }
        else{
            currentConfig.setCollateralEnabled(false);
        }

        if (internalInput.assetdata.borrowingEnabled) {
            //user's choice matters
            currentConfig.setBorrowingEnabled(internalInput.input.canBorrow);
        }
        else {
            //force to be disabled
            currentConfig.setBorrowingEnabled(false);
        }

        currentConfig.setReserveFactor(internalInput.input.reserveFactor.convertToPercent()); //accounts for new number of decimals

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
            variableDebtTokenProxyAddress,
            assetMappings.getInterestRateStrategyAddress(internalInput.input.underlyingAsset,internalInput.input.interestRateChoice),
            currentConfig.getBorrowingEnabled(),
            currentConfig.getCollateralEnabled(),
            currentConfig.getReserveFactor()
        );
    }

    /**
     * @dev Updates the treasury address of the atoken
     * @param newAddress The new address (NO VALIDATIONS ARE DONE)
     * @param asset The underlying asset of the atoken to modify
     * @param trancheId The tranche id of the atoken
     **/
    function updateTreasuryAddress(
        address newAddress,
        address asset,
        uint64 trancheId
    ) external onlyTrancheAdmin(trancheId) {
        ILendingPool cachedPool = pool;
        IAToken(cachedPool.getReserveData(asset, trancheId).aTokenAddress)
            .setTreasury(newAddress);
        //emit
        emit UpdatedTreasuryAddress(asset, trancheId, newAddress);
    }


    /**
     * @dev Enables borrowing on a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function setBorrowingOnReserve(
        address asset,
        uint64 trancheId,
        bool borrowingEnabled
    ) public onlyTrancheAdmin(trancheId) {
        require(!borrowingEnabled || assetMappings.getAssetBorrowable(asset), "Asset is not approved to be set as borrowable");
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setBorrowingEnabled(borrowingEnabled);
        // currentConfig.setStableRateBorrowingEnabled(stableBorrowRateEnabled);

        pool.setConfiguration(asset, trancheId, currentConfig.data);

        emit BorrowingSetOnReserve(asset, trancheId, borrowingEnabled);
    }

    function setCollateralEnabledOnReserve(address asset, uint64 trancheId, bool collateralEnabled)
        external
        onlyTrancheAdmin(trancheId)
    {
        require(!collateralEnabled || assetMappings.getAssetCollateralizable(asset), "Asset is not approved to be set as collateral");
        DataTypes.ReserveConfigurationMap memory currentConfig = pool
            .getConfiguration(asset, trancheId);

        currentConfig.setCollateralEnabled(collateralEnabled);

        pool.setConfiguration(asset, trancheId, currentConfig.data);
        emit CollateralSetOnReserve(asset, trancheId, collateralEnabled);
    }

    /**
     * @dev Updates the reserve factor of a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param reserveFactor The new reserve factor of the reserve, given with 2 decimals (ie 12.55)
     **/
    function setReserveFactor(
        address asset,
        uint64 trancheId,
        uint256 reserveFactor
    ) public onlyTrancheAdmin(trancheId) {
        DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
            pool
        ).getConfiguration(asset, trancheId);

        reserveFactor = reserveFactor.convertToPercent();

        currentConfig.setReserveFactor(reserveFactor);

        ILendingPool(pool).setConfiguration(
            asset,
            trancheId,
            currentConfig.data
        );

        emit ReserveFactorChanged(asset, trancheId, reserveFactor);
    }

    /**
     * @dev Freezes a reserve. A frozen reserve doesn't allow any new deposit, borrow or rate swap
     *  but allows repayments, liquidations, rate rebalances and withdrawals
     * @param asset The address of the underlying asset of the reserve
     **/
    function freezeReserve(address asset, uint64 trancheId)
        external
        onlyTrancheAdmin(trancheId)
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
        onlyTrancheAdmin(trancheId)
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

    function setTrancheWhitelist(uint64 trancheId, bool isWhitelisted) external onlyTrancheAdmin(trancheId){
        pool.setWhitelist(trancheId,isWhitelisted);
        emit UserSetWhitelistEnabled(trancheId, isWhitelisted);
    }

    function setWhitelist(uint64 trancheId, address[] calldata user, bool[] calldata isWhitelisted) external onlyTrancheAdmin(trancheId) {
        require(user.length == isWhitelisted.length, "whitelist lengths not equal");
        for(uint i = 0;i<user.length;i++){
            pool.addToWhitelist(trancheId, user[i], isWhitelisted[i]);
            emit UserChangedWhitelist(trancheId, user[i], isWhitelisted[i]);
        }
    }

    function setBlacklist(uint64 trancheId, address[] calldata user, bool[] calldata isBlacklisted) external onlyTrancheAdmin(trancheId) {
        require(user.length == isBlacklisted.length, "Blacklisted lengths not equal");
        for(uint i = 0;i<user.length;i++){
            pool.addToBlacklist(trancheId, user[i], isBlacklisted[i]);
            emit UserChangedBlacklist(trancheId, user[i], isBlacklisted[i]);
        }
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
    ) external onlyTrancheAdmin(trancheId) {
        address rateStrategyAddress =assetMappings.getInterestRateStrategyAddress(asset,rateStrategyAddressId);

        pool.setReserveInterestRateStrategyAddress(
            asset,
            trancheId,
            rateStrategyAddress
        );
        emit ReserveInterestRateStrategyChanged(asset, trancheId, rateStrategyAddress);
    }

    /* ********************************************************************* */
    /* This next section contains functions only accessible to Global Admins */
    /* ********************************************************************* */
    /**
     * @dev Allows a user to deposit and borrow in the same block
     * @param user The address of allowed user
     **/
    function addWhitelistedDepositBorrow(address user)
        external
        onlyGlobalAdmin
    {
        ILendingPool cachedPool = pool;
        cachedPool.addWhitelistedDepositBorrow(user);
        emit AddedWhitelistedDepositBorrow(user);
    }

    /**
     * @dev Updates the treasury address of the atoken
     * @param newAddress The new address (NO VALIDATIONS ARE DONE)
     * @param asset The underlying asset of the atoken to modify
     * @param trancheId The tranche id of the atoken
     **/
    function updateVMEXTreasuryAddress(
        address newAddress,
        address asset,
        uint64 trancheId
    ) external onlyGlobalAdmin {
        ILendingPool cachedPool = pool;
        IAToken(cachedPool.getReserveData(asset, trancheId).aTokenAddress)
            .setVMEXTreasury(newAddress);
        emit UpdatedVMEXTreasuryAddress(asset, trancheId, newAddress);
    }

    struct UpdateATokenVars {
        address defaultVMEXTreasury;
        uint256 decimals;
        ILendingPool cachedPool;
        DataTypes.ReserveData reserveData;
        UpdateATokenInput input;
    }

    /**
     * @dev Updates the aToken implementation for the reserve. Note that this only updates
     * the implementation for a specific aToken in a specific tranche.
     * @param input address asset - The underlying asset
     *      uint64 trancheId - The tranche id
     *      address treasury - The new treasury address
     *      address incentivesController - The new incentives controller
     *      string name - The new name of the atoken
     *      string symbol - The new symbol of the atoken
     *      address implementation - The new address of atoken implementation
     **/
    function updateAToken(UpdateATokenInput calldata input)
        external
        onlyGlobalAdmin
    {
        UpdateATokenVars memory vars;
        {
            vars.input  = input;
            vars.cachedPool = pool;
            vars.defaultVMEXTreasury = addressesProvider.getVMEXTreasury();

            vars.reserveData = vars.cachedPool.getReserveData(
                vars.input.asset,
                vars.input.trancheId
            );

            (, , , vars.decimals, ) = assetMappings.getParams(vars.input.asset);
        }

        bytes memory encodedCall = abi.encodeWithSelector(
            IInitializableAToken.initialize.selector, //selects that we want to call the initialize function
            vars.cachedPool,
            address(this),
            vars.input.treasury,
            vars.defaultVMEXTreasury,
            vars.input.asset,
            vars.input.trancheId,
            vars.input.incentivesController,
            vars.decimals,
            vars.input.name,
            vars.input.symbol
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
     * @param input address asset - The underlying asset
     *      uint64 trancheId - The tranche id
     *      address incentivesController - The new incentives controller address
     *      string name - The new name of the variable debt token
     *      string symbol - The new symbol of the variable debt token
     *      address implementation - The address of the variable debt token implementation
     **/
    function updateVariableDebtToken(
        UpdateDebtTokenInput calldata input
    ) external onlyGlobalAdmin {
        ILendingPool cachedPool = pool;

        DataTypes.ReserveData memory reserveData = cachedPool.getReserveData(
            input.asset,
            input.trancheId
        );

        (, , , uint256 decimals, ) = assetMappings.getParams(input.asset);

        bytes memory encodedCall = abi.encodeWithSelector(
            IInitializableDebtToken.initialize.selector,
            cachedPool,
            input.asset,
            input.trancheId,
            input.incentivesController,
            decimals,
            input.name,
            input.symbol
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
     * @dev pauses or unpauses all the actions of the protocol, including aToken transfers
     * @param val true if protocol needs to be paused, false otherwise
     **/
    function setPoolPause(bool val, uint64 trancheId)
        external
        onlyEmergencyAdmin
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
}
