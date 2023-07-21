// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {ILendingPoolConfigurator} from "../../interfaces/ILendingPoolConfigurator.sol";
import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";
import {IAToken} from "../../interfaces/IAToken.sol";
import {IInitializableAToken} from "../../interfaces/IInitializableAToken.sol";
import {IInitializableDebtToken} from "../../interfaces/IInitializableDebtToken.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {ValidationLogic} from "../libraries/logic/ValidationLogic.sol";
import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
import {SafeCast} from "../../dependencies/openzeppelin/contracts/SafeCast.sol";


/**
 * @title LendingPoolConfigurator contract
 * @author Aave and VMEX
 * @dev Implements the configuration methods for the VMEX protocol
 **/
contract LendingPoolConfigurator is
    Initializable,
    ILendingPoolConfigurator
{
    using SafeMath for uint256;
    using PercentageMath for uint256;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using SafeCast for uint256;

    ILendingPoolAddressesProvider internal addressesProvider;
    IAssetMappings internal assetMappings;
    ILendingPool internal pool;
    uint64 public override totalTranches;

    /**
     * @dev Mapping from trancheId to the address of the given tranche's treasury.
     **/
    mapping(uint64 => address) override public trancheAdminTreasuryAddresses;

    modifier onlyEmergencyAdmin() {
        Helpers.onlyEmergencyAdmin(addressesProvider, msg.sender);
        _;
    }

    modifier onlyEmergencyTrancheAdmin(uint64 trancheId) {
        Helpers.onlyEmergencyTrancheAdmin(addressesProvider, trancheId, msg.sender);
        _;
    }

    modifier onlyGlobalAdmin() {
        Helpers.onlyGlobalAdmin(addressesProvider, msg.sender);
        _;
    }

    modifier onlyVerifiedTrancheAdmin(uint64 trancheId) {
        Helpers.onlyVerifiedTrancheAdmin(addressesProvider, trancheId, msg.sender);
        _;
    }

    modifier onlyTrancheAdmin(uint64 trancheId) {
        Helpers.onlyTrancheAdmin(addressesProvider, trancheId, msg.sender);
        _;
    }

    modifier whitelistedAddress() {
        require(
            addressesProvider.isWhitelistedAddress(msg.sender),
            Errors.LPC_NOT_WHITELISTED_TRANCHE_CREATION
        );
        _;
    }

    function initialize(address provider) public initializer {
        addressesProvider = ILendingPoolAddressesProvider(provider);
        pool = ILendingPool(addressesProvider.getLendingPool());
        assetMappings = IAssetMappings(addressesProvider.getAssetMappings());
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
        uint64 givenTranche = totalTranches;
        addressesProvider.addTrancheAdmin(admin, givenTranche);
        totalTranches += 1;
        emit TrancheInitialized(givenTranche, name, admin);
        return givenTranche;
    }


    /**
     * @dev Verifies tranche for more privileges
     * @param trancheId the tranche that is verified
     **/
    function verifyTranche(
        uint64 trancheId
    ) external onlyGlobalAdmin {
        require(trancheId<totalTranches, Errors.INVALID_TRANCHE);
        require(!pool.getTrancheParams(trancheId).verified, Errors.ALREADY_VERIFIED);
        // TODO: enforce possible staking of VMEX

        // loop through all reserves in this tranche, and set the local values of LTV, threshold, bonus, and borrow factor
        address[] memory reserves = pool.getReservesList(trancheId);
        uint cachedLength = reserves.length;
        for(uint256 i;i<cachedLength;) { //initialize with initial global asset params
            (
                uint64 ltv,
                uint64 liquidationThreshold,
                uint64 liquidationBonus,
                uint64 borrowFactor
            ) = assetMappings.getDefaultCollateralParams(reserves[i]); //it doesn't matter what the tranche and user address is since it will get params from global params
            pool.setCollateralParams(
                reserves[i], 
                trancheId, 
                ltv, 
                liquidationThreshold, 
                liquidationBonus, 
                borrowFactor
            );

            _setReserveInterestRateStrategyAddress(
                reserves[i], 
                trancheId, 
                assetMappings.getDefaultInterestRateStrategyAddress(reserves[i])
            );

            unchecked { ++i; }
        }

        pool.setTrancheAdminVerified(trancheId, true);
    }


    /**
     * @dev Unverifies tranche to revoke privileges, unstake, and return to global parameters
     * @param trancheId the tranche that is verified
     **/
    function unverifyTranche(
        uint64 trancheId
    ) external onlyVerifiedTrancheAdmin(trancheId) {
        require(trancheId<totalTranches, Errors.INVALID_TRANCHE);
        // TODO: enforce unstaking of VMEX
        pool.setTrancheAdminVerified(trancheId, false);
    }
    /* ******************************************************************************** */
    /* This next section contains functions only accessible to Tranche Admins and above */
    /* ******************************************************************************** */

    /**
     * @dev Changes the tranche name of
     * @param trancheId The tranche id that the admin now manages
     * @param name The string name of the tranche
     **/
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
        InitReserveInput[] calldata input,
        uint64 trancheId
    ) external onlyTrancheAdmin(trancheId) {
        ILendingPool cachedPool = pool;
        uint256 length = input.length;
        for (uint256 i; i < length;) {
            address asset = input[i].underlyingAsset;
            if(pool.reserveAdded(asset, trancheId)) {
                continue;
            }
            _initReserve(
                input[i],
                trancheId,
                assetMappings.getAssetMapping(asset),
                cachedPool
            );

            if(pool.getTrancheParams(trancheId).verified) { //perform extra initialization
                (
                    uint256 baseLTV,
                    uint256 liquidationThreshold,
                    uint256 liquidationBonus,
                    uint256 borrowFactor
                ) = assetMappings.getDefaultCollateralParams(asset);
                _configureCollateralParams(
                    input[i].underlyingAsset,
                    trancheId,
                    ConfigureCollateralParams(
                        baseLTV.toUint64(),
                        liquidationThreshold.toUint64(),
                        liquidationBonus.toUint64(),
                        borrowFactor.toUint64()
                    )
                );
                _setReserveInterestRateStrategyAddress(
                    asset, 
                    trancheId, 
                    assetMappings.getDefaultInterestRateStrategyAddress(asset)
                );
            }

            unchecked { ++i; }
        }
    }

    /**
     * @dev Initializes reserves in batch. Can be called directly by those who created tranches
     * and want to add new reserves to their tranche
     * @param input The specifications of the reserves to initialize
     * @param trancheId The trancheId that the msg.sender should be the admin of
     **/
    function batchConfigureCollateralParams(
        ConfigureCollateralParamsInput[] calldata input,
        uint64 trancheId
    ) external onlyVerifiedTrancheAdmin(trancheId) {
        uint256 length = input.length;
        for (uint256 i; i < length;) {
            ConfigureCollateralParams memory params = input[i].collateralParams;
            ValidationLogic.validateCollateralParams(
                params.baseLTV, 
                params.liquidationThreshold,
                params.liquidationBonus,
                params.borrowFactor
            );
            _configureCollateralParams(
                input[i].underlyingAsset,
                trancheId,
                params
            );

            unchecked { ++i; }
        }
    }

    function _initReserve(
        InitReserveInput memory input,
        uint64 trancheId,
        DataTypes.AssetData memory assetdata,
        ILendingPool cachedPool
    ) internal {
        address aTokenProxyAddress = _initTokenWithProxy(
            addressesProvider.getATokenBeacon(),
            abi.encodeCall(
                IInitializableAToken.initialize,
                (
                    cachedPool,
                    IInitializableAToken.InitializeTreasuryVars(
                        address(this), //lendingPoolConfigurator address
                        address(addressesProvider), //
                        input.underlyingAsset,
                        trancheId
                    )
                )
            )
        );
        address variableDebtTokenProxyAddress = _initTokenWithProxy(
            addressesProvider.getVariableDebtTokenBeacon(),
            abi.encodeCall(
                IInitializableDebtToken.initialize,
                (
                    cachedPool,
                    input.underlyingAsset,
                    trancheId,
                    addressesProvider
                )
            )
        );


        cachedPool.initReserve(
            input.underlyingAsset,
            trancheId,
            aTokenProxyAddress,
            variableDebtTokenProxyAddress
        );

        DataTypes.ReserveConfigurationMap memory currentConfig = cachedPool
            .getConfiguration(
                input.underlyingAsset,
                trancheId
            );
        if (assetdata.liquidationThreshold != 0) {
            // asset mappings does not force disable borrow, so the user's choice matters
            currentConfig.setCollateralEnabled(input.canBeCollateral);
        }
        else{
            currentConfig.setCollateralEnabled(false);
        }

        if (assetdata.borrowingEnabled) {
            // if borrowing is enabled, the user's choice matters
            currentConfig.setBorrowingEnabled(input.canBorrow);
        }
        else {
            // otherwise force to be disabled
            currentConfig.setBorrowingEnabled(false);
        }

        currentConfig.setReserveFactor(uint256(input.reserveFactor), input.underlyingAsset, assetMappings);

        currentConfig.setActive(true);
        currentConfig.setFrozen(false);

        cachedPool.setConfiguration(
            input.underlyingAsset,
            trancheId,
            currentConfig.data
        );

        emit ReserveInitialized(
            input.underlyingAsset,
            trancheId,
            aTokenProxyAddress,
            variableDebtTokenProxyAddress,
            currentConfig.getBorrowingEnabled(input.underlyingAsset, assetMappings),
            currentConfig.getCollateralEnabled(input.underlyingAsset, assetMappings),
            currentConfig.getReserveFactor()
        );
    }

    /**
     * @dev Updates the treasury address of the atoken
     * @param underlyingAsset The underlying asset
     * @param trancheId The tranche id
     * @param params The collateral parameters such as ltv, threshold, with 4 decimals (so need to convert)
     **/
    function _configureCollateralParams(
        address underlyingAsset,
        uint64 trancheId,
        ConfigureCollateralParams memory params
    ) internal {
        pool.setCollateralParams(
            underlyingAsset, 
            trancheId, 
            params.baseLTV, 
            params.liquidationThreshold, 
            params.liquidationBonus, 
            params.borrowFactor
        );
        emit VerifiedAdminConfiguredCollateral(
            underlyingAsset, 
            trancheId, 
            params.baseLTV, 
            params.liquidationThreshold, 
            params.liquidationBonus, 
            params.borrowFactor
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
    ) external onlyTrancheAdmin(trancheId) {
        require(newAddress!=address(0), Errors.LPC_TREASURY_ADDRESS_ZERO);
        trancheAdminTreasuryAddresses[trancheId] = newAddress;
        emit UpdatedTreasuryAddress(trancheId, newAddress);
    }


    /**
     * @dev Enables borrowing on a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The tranche id of the reserve
     * @param borrowingEnabled 'true' to enable borrowing, 'false' to disable borrowing
     **/
    function setBorrowingOnReserve(
        address[] calldata asset,
        uint64 trancheId,
        bool[] calldata borrowingEnabled
    ) external onlyTrancheAdmin(trancheId) {
        require(asset.length == borrowingEnabled.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint256 i; i<asset.length;i++){
            require(!borrowingEnabled[i] || assetMappings.getAssetBorrowable(asset[i]), Errors.LPC_NOT_APPROVED_BORROWABLE);
            DataTypes.ReserveConfigurationMap memory currentConfig = pool
                .getConfiguration(asset[i], trancheId);


            currentConfig.setBorrowingEnabled(borrowingEnabled[i]);

            pool.setConfiguration(asset[i], trancheId, currentConfig.data);

            emit BorrowingSetOnReserve(asset[i], trancheId, borrowingEnabled[i]);
        }
    }

    /**
     * @dev Sets collateral enabled on a list of reserves
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The tranche id of the reserve
     * @param collateralEnabled 'true' to enable borrowing, 'false' to disable borrowing
     **/
    function setCollateralEnabledOnReserve(
        address[] calldata asset,
        uint64 trancheId,
        bool[] calldata collateralEnabled
    ) external onlyTrancheAdmin(trancheId) {
        require(asset.length == collateralEnabled.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint256 i; i<asset.length;i++){
            if(!collateralEnabled[i]){
                _checkNoLiquidity(asset[i], trancheId);
            }
            require(!collateralEnabled[i] || assetMappings.getAssetCollateralizable(asset[i]), Errors.LPC_NOT_APPROVED_COLLATERAL);
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
     * @param trancheId The tranche id of the reserve
     * @param reserveFactor The new reserve factor of the reserve, given with 2 decimals (ie 12.55)
     **/
    function setReserveFactor(
        address[] calldata asset,
        uint64 trancheId,
        uint256[] calldata reserveFactor
    ) external onlyTrancheAdmin(trancheId) {
        require(asset.length == reserveFactor.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint256 i; i<asset.length;i++){
            //reserve factor can only be changed if no one deposited in it, otherwise tranche admins could "rug pull" the interest earnings in there
            _checkNoLiquidity(asset[i], trancheId);
            DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
                pool
            ).getConfiguration(asset[i], trancheId);

            uint256 thisReserveFactor = reserveFactor[i];
            currentConfig.setReserveFactor(thisReserveFactor, asset[i], assetMappings);

            ILendingPool(pool).setConfiguration(
                asset[i],
                trancheId,
                currentConfig.data
            );

            emit ReserveFactorChanged(asset[i], trancheId, thisReserveFactor);
        }
    }

    /**
     * @dev Freezes a reserve. A frozen reserve doesn't allow any new deposit or borrow
     *  but allows repayments, liquidations, and withdrawals
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The tranche id of the reserve
     * @param isFrozen 'true' to freeze reserve, 'false' to unfreeze reserve
     **/
    function setFreezeReserve(address[] calldata asset, uint64 trancheId, bool[] calldata isFrozen)
        external
        onlyTrancheAdmin(trancheId)
    {
        require(asset.length == isFrozen.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint256 i; i<asset.length;i++){
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

    /**
     * @dev Enables or disables the whitelist on a tranche
     * @param trancheId The tranche id
     * @param isUsingWhitelist 'true' to enable whitelist, 'false' to disable whitelist
     **/
    function setTrancheWhitelistEnabled(
        uint64 trancheId,
        bool isUsingWhitelist
    ) external onlyTrancheAdmin(trancheId) {
        if(isUsingWhitelist) { //only allow tranche admins to set whitelist enabled if reserves have not yet been initialized
            require(pool.getTrancheParams(trancheId).reservesCount == 0, Errors.LPC_WHITELISTING_NOT_ALLOWED);
        }
        pool.setWhitelistEnabled(trancheId, isUsingWhitelist);
        emit UserSetWhitelistEnabled(trancheId, isUsingWhitelist);
    }

    /**
     * @dev Add/remove a list of users from the whitelist, enabling the whitelist if it was not enabled
     * @param trancheId The tranche id
     * @param user The list of addresses of the users to configure
     * @param isWhitelisted `true` to add the user to the whitelist, `false` to remove user from whitelist
     */
    function setTrancheWhitelist(
        uint64 trancheId,
        address[] calldata user,
        bool[] calldata isWhitelisted
    ) external onlyTrancheAdmin(trancheId) {
        require(user.length == isWhitelisted.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint256 i;i<user.length;i++) {
            pool.addToWhitelist(trancheId, user[i], isWhitelisted[i]);
            emit UserChangedWhitelist(trancheId, user[i], isWhitelisted[i]);
        }
    }

    /**
     * @dev Add/remove a user from the blacklist
     * - Only callable by the LendingPoolConfigurator contract
     * @param trancheId The tranche id
     * @param user The address of the user to configure
     * @param isBlacklisted `true` to add the user to the blacklist, `false` to remove user from blacklist
     */
    function setTrancheBlacklist(
        uint64 trancheId,
        address[] calldata user,
        bool[] calldata isBlacklisted
    ) external onlyTrancheAdmin(trancheId) {
        require(user.length == isBlacklisted.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint256 i;i<user.length;i++) {
            pool.addToBlacklist(trancheId, user[i], isBlacklisted[i]);
            emit UserChangedBlacklist(trancheId, user[i], isBlacklisted[i]);
        }
    }

    /**
     * @dev Sets the interest rate strategy of a reserve
     * @param asset The address of the underlying asset of the reserve
     * @param trancheId The tranche id to set strategy on
     * @param rateStrategyAddress The new address of the interest strategy contract
     **/
    function setReserveInterestRateStrategyAddress(
        address asset,
        uint64 trancheId,
        address rateStrategyAddress
    ) external onlyVerifiedTrancheAdmin(trancheId) {
        //interest rate can only be changed if no one deposited in it, otherwise tranche admins could potentially trick users
        require(Address.isContract(rateStrategyAddress), Errors.LP_NOT_CONTRACT);
        _checkNoLiquidity(asset, trancheId);

        _setReserveInterestRateStrategyAddress(asset,trancheId,rateStrategyAddress);
    }

    function _setReserveInterestRateStrategyAddress(
        address asset,
        uint64 trancheId,
        address rateStrategyAddress
    ) internal {
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
     * @param trancheId The tranche id of the reserve
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
     * @param trancheId The tranche id of the reserve
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
     * @dev pauses or unpauses all the actions of a tranche, including aToken transfers
     * @param val true if tranche needs to be paused, false otherwise
     * @param trancheId The tranche id of the reserve
     **/
    function setTranchePause(bool val, uint64 trancheId)
        external
        onlyEmergencyTrancheAdmin(trancheId)
    {
        pool.setPause(val, trancheId);
    }

    /**
     * @dev pauses or unpauses all the actions of all tranches, including aToken transfers
     * @param val true if all tranches needs to be paused, false otherwise
     **/
    function setEveryTranchePause(bool val)
        external
        onlyEmergencyAdmin
    {
        pool.setPauseEverything(val);
    }

    /**
     * @dev checks that there is no liquidity (no underlying balance owned by the atoken) and no liquidity rate
     * @param asset asset to check
     * @param trancheId trancheId to check in
     **/
    function _checkNoLiquidity(address asset, uint64 trancheId) internal view {
        DataTypes.ReserveData memory reserveData = pool.getReserveData(
            asset,
            trancheId
        );

        uint256 availableLiquidity = IERC20Detailed(asset).balanceOf(
            reserveData.aTokenAddress
        );

        availableLiquidity += IAToken(reserveData.aTokenAddress).getStakedAmount();

        require(
            availableLiquidity == 0 && reserveData.currentLiquidityRate == 0,
            Errors.LPC_RESERVE_LIQUIDITY_NOT_0
        );
    }

    /**
     * @dev initializes beacon proxy (for atoken and variable debt token use)
     * @param beacon address of beacon contract that relays the address of the underlying implementation contract
     * @param initParams params to initialize proxy (calldata for the initialize method in the underlying implementation)
     **/
    function _initTokenWithProxy(
        address beacon,
        bytes memory initParams
    ) internal returns (address) {
        BeaconProxy proxy = new BeaconProxy(
                beacon,
                initParams
            );

        return address(proxy);
    }
}
