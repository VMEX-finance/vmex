// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

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
    uint64 public override totalTranches;
    mapping(uint64 => address) override public trancheAdminTreasuryAddresses; //tranche to address of treasury of that tranche

    modifier onlyEmergencyAdmin {
        require(
            addressesProvider.getEmergencyAdmin() == msg.sender ||
            addressesProvider.getGlobalAdmin() == msg.sender,
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
     * to create a tranche (permissionless or vmex-managed), doesn't require any checks besides that trancheId is unique
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

    function changeTrancheName(
        uint64 trancheId,
        string calldata name
    ) external onlyTrancheAdmin(trancheId) {
        emit TrancheNameChanged(trancheId, name);
    }
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
        address aTokenImpl = addressesProvider.getATokenBeacon(); //beacon proxy allows all atokens to be upgraded simultaneously
        address varDebtToken = addressesProvider.getVariableDebtTokenBeacon();
        for (uint256 i = 0; i < input.length; i++) {
            _initReserve(
                DataTypes.InitReserveInputInternal(
                    input[i],
                    trancheId,
                    aTokenImpl,
                    varDebtToken,
                    assetMappings.getAssetMapping(input[i].underlyingAsset),
                    cachedPool,
                    addressesProvider
                ) //by putting assetmappings in the addresses provider, we have flexibility to upgrade it in the future
            );
        }
    }

    function _initReserve(
        DataTypes.InitReserveInputInternal memory internalInput
    ) internal {
        (
            address aTokenProxyAddress,
            address variableDebtTokenProxyAddress
        ) = DeployATokens.deployATokens(
                internalInput
            );

        internalInput.cachedPool.initReserve(
            internalInput.input.underlyingAsset,
            internalInput.trancheId,
            assetMappings.getInterestRateStrategyAddress(internalInput.input.underlyingAsset,internalInput.input.interestRateChoice),
            aTokenProxyAddress,
            variableDebtTokenProxyAddress
        );

        DataTypes.ReserveConfigurationMap memory currentConfig = internalInput.cachedPool
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

        internalInput.cachedPool.setConfiguration(
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
            currentConfig.getBorrowingEnabled(internalInput.input.underlyingAsset, assetMappings),
            currentConfig.getCollateralEnabled(internalInput.input.underlyingAsset, assetMappings),
            currentConfig.getReserveFactor()
        );
    }

    /**
     * @dev Updates the treasury address of the atoken
     * @param newAddress The new address (NO VALIDATIONS ARE DONE)
     * @param trancheId The tranche id of the atoken
     **/
    function updateTreasuryAddress(
        address newAddress,
        uint64 trancheId
    ) public onlyTrancheAdmin(trancheId) {
        trancheAdminTreasuryAddresses[trancheId] = newAddress;
        //emit
        emit UpdatedTreasuryAddress(trancheId, newAddress);
    }


    /**
     * @dev Enables borrowing on a reserve
     * @param asset The address of the underlying asset of the reserve
     **/
    function setBorrowingOnReserve(
        address[] calldata asset,
        uint64 trancheId,
        bool[] calldata borrowingEnabled
    ) public onlyTrancheAdmin(trancheId) {
        require(asset.length == borrowingEnabled.length, "Array lengths are not equal");
        for(uint i = 0; i<asset.length;i++){
            require(!borrowingEnabled[i] || assetMappings.getAssetBorrowable(asset[i]), "Asset is not approved to be set as borrowable");
            DataTypes.ReserveConfigurationMap memory currentConfig = pool
                .getConfiguration(asset[i], trancheId);

            currentConfig.setBorrowingEnabled(borrowingEnabled[i]);

            pool.setConfiguration(asset[i], trancheId, currentConfig.data);

            emit BorrowingSetOnReserve(asset[i], trancheId, borrowingEnabled[i]);
        }
    }

    function setCollateralEnabledOnReserve(address[] calldata asset, uint64 trancheId, bool[] calldata collateralEnabled)
        external
        onlyTrancheAdmin(trancheId)
    {
        require(asset.length == collateralEnabled.length, "Array lengths are not equal");
        for(uint i = 0; i<asset.length;i++){
            //note: ideally, we check that no collateral is enabled, but that's hard to do without a complete list of users, so this is a more conservative and easier approach
            if(!collateralEnabled[i]){
                _checkNoLiquidity(asset[i], trancheId);
            }
            require(!collateralEnabled[i] || assetMappings.getAssetCollateralizable(asset[i]), "Asset is not approved to be set as collateral");
            DataTypes.ReserveConfigurationMap memory currentConfig = pool
                .getConfiguration(asset[i], trancheId);

            currentConfig.setCollateralEnabled(collateralEnabled[i]);

            pool.setConfiguration(asset[i], trancheId, currentConfig.data);
            emit CollateralSetOnReserve(asset[i], trancheId, collateralEnabled[i]);
        }
    }

    /**
     * @dev Updates the reserve factor of a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param reserveFactor The new reserve factor of the reserve, given with 2 decimals (ie 12.55)
     **/
    function setReserveFactor(
        address[] calldata asset,
        uint64 trancheId,
        uint256[] calldata reserveFactor
    ) public onlyTrancheAdmin(trancheId) {
        require(asset.length == reserveFactor.length, "Array lengths are not equal");
        for(uint i = 0; i<asset.length;i++){
            DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
                pool
            ).getConfiguration(asset[i], trancheId);

            uint256 thisReserveFactor = reserveFactor[i].convertToPercent();
            // TODO: require the reserve factor to be less than 100%

            currentConfig.setReserveFactor(thisReserveFactor);

            ILendingPool(pool).setConfiguration(
                asset[i],
                trancheId,
                currentConfig.data
            );

            emit ReserveFactorChanged(asset[i], trancheId, thisReserveFactor);
        }
    }

    /**
     * @dev Freezes a reserve. A frozen reserve doesn't allow any new deposit, borrow or rate swap
     *  but allows repayments, liquidations, rate rebalances and withdrawals
     * @param asset The address of the underlying asset of the reserve
     **/
    function setFreezeReserve(address[] calldata asset, uint64 trancheId, bool[] calldata isFrozen)
        external
        onlyTrancheAdmin(trancheId)
    {
        require(asset.length == isFrozen.length, "Array lengths are not equal");
        for(uint i = 0; i<asset.length;i++){
            DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
                pool
            ).getConfiguration(asset[i], trancheId);

            currentConfig.setFrozen(isFrozen[i]);

            ILendingPool(pool).setConfiguration(
                asset[i],
                trancheId,
                currentConfig.data
            );

            emit ReserveFrozenChanged(asset[i], trancheId, isFrozen[i]);
        }
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

    function setEveryPoolPause(bool val)
        external
        onlyEmergencyAdmin
    {
        pool.setPauseEverything(val);
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
