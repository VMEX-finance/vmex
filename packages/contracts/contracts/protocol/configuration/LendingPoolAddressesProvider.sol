// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {Ownable} from "../../dependencies/openzeppelin/contracts/Ownable.sol";
// Prettier ignore to prevent buidler flatter bug
// prettier-ignore
import {InitializableImmutableAdminUpgradeabilityProxy} from '../../dependencies/aave-upgradeability/InitializableImmutableAdminUpgradeabilityProxy.sol';
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
/**
 * @title LendingPoolAddressesProvider contract
 * @dev Main registry of addresses part of or connected to the protocol, including permissioned roles
 * - Acting also as factory of proxies and admin of those, so with right to change its implementations
 * - Owned by the Vmex Governance
 * @author Vmex
 **/
contract LendingPoolAddressesProvider is
    Ownable,
    ILendingPoolAddressesProvider
{
    string private _marketId;

    // List of addresses that are not specific to a tranche
    mapping(bytes32 => address) private _addresses;

    // List of tranche admins:
    mapping(uint64 => address) private _trancheAdmins;

    // Whitelisted addresses that are allowed to create permissionless tranches
    mapping(address => bool) whitelistedAddresses;

    // Whether or not permissionless tranches are enabled for all users
    bool permissionlessTranches;

    bytes32 private constant GLOBAL_ADMIN = "GLOBAL_ADMIN";
    bytes32 private constant LENDING_POOL = "LENDING_POOL";
    bytes32 private constant ATOKEN = "ATOKEN";
    bytes32 private constant ATOKEN_BEACON = "ATOKEN_BEACON";
    bytes32 private constant VARIABLE_DEBT = "VARIABLE_DEBT";
    bytes32 private constant VARIABLE_DEBT_BEACON = "VARIABLE_DEBT_BEACON";
    bytes32 private constant LENDING_POOL_CONFIGURATOR =
        "LENDING_POOL_CONFIGURATOR";
    bytes32 private constant EMERGENCY_ADMIN = "EMERGENCY_ADMIN";
    bytes32 private constant LENDING_POOL_COLLATERAL_MANAGER =
        "COLLATERAL_MANAGER";
    bytes32 private constant VMEX_PRICE_ORACLE = "VMEX_PRICE_ORACLE";

    bytes32 private constant CURVE_ADDRESS_PROVIDER = "CURVE_ADDRESS_PROVIDER";
    bytes32 private constant ASSET_MAPPINGS = "ASSET_MAPPINGS";
    bytes32 private constant VMEX_TREASURY_ADDRESS = "VMEX_TREASURY_ADDRESS";

    bytes32 private constant INCENTIVES_CONTROLLER = "INCENTIVES_CONTROLLER";

    constructor(string memory marketId) {
        _setMarketId(marketId);
        permissionlessTranches = false;
    }

    function getVMEXTreasury() external view override returns(address){
        return getAddress(VMEX_TREASURY_ADDRESS);
    }

    function setVMEXTreasury(address add) external override onlyOwner {
        _setVMEXTreasury(add);
    }

    function _setVMEXTreasury(address add) internal {
        _addresses[VMEX_TREASURY_ADDRESS] = add;
        emit VMEXTreasuryUpdated(add);
    }

    /**
     * @dev Sets whether permissionless tranches are enabled or disabled for all users.
     * @param val True if permissionless tranches are enabled, false otherwise
     **/
    function setPermissionlessTranches(bool val) external onlyOwner {
        permissionlessTranches = val;
        emit PermissionlessTranchesEnabled(val);
    }

    /**
     * @dev Add a user to create permissionless tranches.
     * @param ad The user's address
     * @param val Whether or not to enable this user to create permissionless tranches
     **/
    function addWhitelistedAddress(address ad, bool val) external onlyOwner {
        whitelistedAddresses[ad] = val;
        emit WhitelistedAddressesSet(ad, val);
    }

    /**
     * @dev Checks whether an address is allowed to create permissionless tranches.
     * @param ad The user's address
     **/
    function isWhitelistedAddress(address ad)
        external
        view
        override
        returns (bool)
    {
        return permissionlessTranches || whitelistedAddresses[ad];
    }

    /**
     * @dev Returns the id of the Vmex market to which this contracts points to
     * @return The market id
     **/
    function getMarketId() external view override returns (string memory) {
        return _marketId;
    }

    /**
     * @dev Allows to set the market which this LendingPoolAddressesProvider represents
     * @param marketId The market id
     */
    function setMarketId(string memory marketId) external override onlyOwner {
        _setMarketId(marketId);
    }

    /**
     * @dev General function to update the implementation of a proxy registered with
     * certain `id`. If there is no proxy registered, it will instantiate one and
     * set as implementation the `implementationAddress`
     * IMPORTANT Use this function carefully, only for ids that don't have an explicit
     * setter function, in order to avoid unexpected consequences
     * @param id The id
     * @param implementationAddress The address of the new implementation
     */
    function setAddressAsProxy(bytes32 id, address implementationAddress)
        external
        override
        onlyOwner
    {
        _updateImpl(id, implementationAddress);
        emit AddressSet(id, implementationAddress, true);
    }

    /**
     * @dev Sets an address for an id replacing the address saved in the addresses map
     * IMPORTANT Use this function carefully, as it will do a hard replacement
     * @param id The id
     * @param newAddress The address to set
     */
    function setAddress(bytes32 id, address newAddress)
        external
        override
        onlyOwner
    {
        _addresses[id] = newAddress;
        emit AddressSet(id, newAddress, false);
    }

    /**
     * @dev Returns an address by id
     * @return The address
     */
    function getAddress(bytes32 id) public view override returns (address) {
        return _addresses[id];
    }

    /**
     * @dev Returns the address of the LendingPool proxy
     * @return The LendingPool proxy address
     **/
    function getLendingPool() external view override returns (address) {
        return getAddress(LENDING_POOL);
    }

    /**
     * @dev Updates the implementation of the LendingPool, or creates the proxy
     * setting the new `pool` implementation on the first time calling it
     * @param pool The new LendingPool implementation
     **/
    function setLendingPoolImpl(address pool) external override onlyOwner {
        _updateImpl(LENDING_POOL, pool);
        emit LendingPoolUpdated(pool);
    }

    /**
     * @dev Returns the address of the aToken impl address
     * @return The aToken proxy address
     **/
    function getAToken() external view override returns (address) {
        return getAddress(ATOKEN);
    }

    /**
     * @dev Updates the implementation of the LendingPool, or creates the proxy
     * setting the new `pool` implementation on the first time calling it
     * @param aToken The new aToken implementation
     **/
    function setATokenImpl(address aToken) external override onlyOwner {
        _addresses[ATOKEN] = aToken;
        emit ATokenUpdated(aToken);
    }

    /**
     * @dev Returns the address of the aToken beacon address
     * @return The aToken beacon address
     **/
    function getATokenBeacon() external view override returns (address) {
        return getAddress(ATOKEN_BEACON);
    }

    /**
     * @dev Updates the implementation of the atoken beacon
     * @param aTokenBeacon The new aToken implementation
     **/
    function setATokenBeacon(address aTokenBeacon) external override onlyOwner {
        _addresses[ATOKEN_BEACON] = aTokenBeacon;
        emit ATokenBeaconUpdated(aTokenBeacon);
    }

    /**
     * @dev Returns the address of the LendingPool proxy
     * @return The aToken proxy address
     **/
    function getVariableDebtToken() external view override returns (address) {
        return getAddress(VARIABLE_DEBT);
    }

    /**
     * @dev Updates the implementation of the LendingPool, or creates the proxy
     * setting the new `pool` implementation on the first time calling it
     * @param aToken The new aToken implementation
     **/
    function setVariableDebtToken(address aToken) external override onlyOwner {
        // don't use _updateImpl since this just stores the address, the upgrade is done in LendingPoolConfigurator
        _addresses[VARIABLE_DEBT] = aToken;
        emit VariableDebtUpdated(aToken);
    }

    /**
     * @dev Returns the address of the variable debt token beacon
     * @return The aToken proxy address
     **/
    function getVariableDebtTokenBeacon() external view override returns (address) {
        return getAddress(VARIABLE_DEBT_BEACON);
    }

    /**
     * @dev Updates the beacon implementation
     * @param variableDebtBeacon The new aToken implementation
     **/
    function setVariableDebtTokenBeacon(address variableDebtBeacon) external override onlyOwner {
        // don't use _updateImpl since this just stores the address, the upgrade is done in LendingPoolConfigurator
        _addresses[VARIABLE_DEBT_BEACON] = variableDebtBeacon;
        emit VariableDebtBeaconUpdated(variableDebtBeacon);
    }

    /**
     * @dev Returns the address of the LendingPoolConfigurator proxy
     * @return The LendingPoolConfigurator proxy address
     **/
    function getLendingPoolConfigurator()
        external
        view
        override
        returns (address)
    {
        return getAddress(LENDING_POOL_CONFIGURATOR);
    }

    /**
     * @dev Updates the implementation of the LendingPoolConfigurator, or creates the proxy
     * setting the new `configurator` implementation on the first time calling it
     * @param newAddress The new LendingPoolConfigurator implementation
     **/
    function setLendingPoolConfiguratorImpl(address newAddress)
        external
        override
        onlyOwner
    {
        _updateImpl(LENDING_POOL_CONFIGURATOR, newAddress);
        emit LendingPoolConfiguratorUpdated(newAddress);
    }

    /**
     * @dev Returns the address of the LendingPoolCollateralManager. Since the manager is used
     * through delegateCall within the LendingPool contract, the proxy contract pattern does not work properly hence
     * the addresses are changed directly
     * @return The address of the LendingPoolCollateralManager
     **/

    function getLendingPoolCollateralManager()
        external
        view
        override
        returns (address)
    {
        return getAddress(LENDING_POOL_COLLATERAL_MANAGER);
    }

    /**
     * @dev Updates the address of the LendingPoolCollateralManager
     * @param manager The new LendingPoolCollateralManager address
     **/
    function setLendingPoolCollateralManager(address manager)
        external
        override
        onlyOwner
    {
        _addresses[LENDING_POOL_COLLATERAL_MANAGER] = manager;
        emit LendingPoolCollateralManagerUpdated(manager);
    }

    /**
     * @dev The functions below are getters/setters of addresses that are outside the context
     * of the protocol hence the upgradable proxy pattern is not used
     **/

    /**
     * @dev Gets the global admin, the admin to entire market
     * @return The address of the global admin
     **/
    function getGlobalAdmin() external view override returns (address) {
        return getAddress(GLOBAL_ADMIN);
    }

    /**
     * @dev Sets the global admin, the admin to entire market
     * IMPORTANT Use this function carefully, as it will do a hard replacement
     * @param admin The address of the new admin
     **/
    function setGlobalAdmin(address admin) external override onlyOwner {
        _addresses[GLOBAL_ADMIN] = admin;
    }

    /**
     * @dev Gets the tranche admin, the admin to a single tranche
     * @param trancheId The id of the tranche
     * @return The address of the tranche admin
     **/
    function getTrancheAdmin(uint64 trancheId)
        external
        view
        override
        returns (address)
    {
        return _trancheAdmins[trancheId];
    }

    /**
     * @dev Manually sets the tranche admin without checking if the tranche has been taken
     * @param admin The address of the new admin
     * @param trancheId The id of the tranche
     **/
    function setTrancheAdmin(address admin, uint64 trancheId) external override {
        require(
            _msgSender() == owner() ||
                _msgSender() == _trancheAdmins[trancheId],
            Errors.CALLER_NOT_TRANCHE_ADMIN
        );
        _trancheAdmins[trancheId] = admin;
        emit ConfigurationAdminUpdated(admin, trancheId);
    }

    /**
     * @dev Adds the tranche admin to registry, checking if the tranche has been taken
     * @param admin The address of the new admin
     * @param trancheId The id of the tranche
     **/
    function addTrancheAdmin(address admin, uint64 trancheId) external override {
        // anyone can add their own tranche, but you just have to choose a trancheId that hasn't been used yet
        require(
            _msgSender() == getAddress(LENDING_POOL_CONFIGURATOR),
            Errors.LP_CALLER_NOT_LENDING_POOL_CONFIGURATOR
        );
        assert(_trancheAdmins[trancheId] == address(0)); //this should never be false
        _trancheAdmins[trancheId] = admin;
        emit ConfigurationAdminUpdated(admin, trancheId);
    }

    /**
     * @dev Gets the emergency admin for the market
     * @return The emergency admin address
     **/
    function getEmergencyAdmin() external view override returns (address) {
        return getAddress(EMERGENCY_ADMIN);
    }

    /**
     * @dev Sets the emergency admin for the market
     * @param emergencyAdmin The address of the new admin
     **/
    function setEmergencyAdmin(address emergencyAdmin) external override onlyOwner {
        _addresses[EMERGENCY_ADMIN] = emergencyAdmin;
        emit EmergencyAdminUpdated(emergencyAdmin);
    }

    /**
     * @dev Get the vmex price oracle
     * @return The address of the vmex price oracle
     **/
    function getPriceOracle()
        external
        view
        override
        returns (address)
    {
        return getAddress(VMEX_PRICE_ORACLE);
    }

    /**
     * @dev Set the vmex price oracle
     * @param priceOracle The address of the new vmex price oracle
     **/
    function setPriceOracle(address priceOracle)
        external
        override
        onlyOwner
    {
        _updateImpl(VMEX_PRICE_ORACLE, priceOracle);
        emit PriceOracleUpdated(priceOracle);
    }

    /**
     * @dev Internal function to update the implementation of a specific proxied component of the protocol
     * - If there is no proxy registered in the given `id`, it creates the proxy setting `newAdress`
     *   as implementation and calls the initialize() function on the proxy
     * - If there is already a proxy registered, it just updates the implementation to `newAddress` and
     *   calls the initialize() function via upgradeToAndCall() in the proxy
     * @param id The id of the proxy to be updated
     * @param newAddress The address of the new implementation
     **/
    function _updateImpl(bytes32 id, address newAddress) internal {
        address payable proxyAddress = payable(_addresses[id]);

        InitializableImmutableAdminUpgradeabilityProxy proxy =
            InitializableImmutableAdminUpgradeabilityProxy(proxyAddress);
        bytes memory params =
            abi.encodeWithSignature("initialize(address)", address(this));

        if (proxyAddress == address(0)) {
            proxy = new InitializableImmutableAdminUpgradeabilityProxy(
                address(this)
            );
            proxy.initialize(newAddress, params);
            _addresses[id] = address(proxy);
            emit ProxyCreated(id, address(proxy));
        } else {
            proxy.upgradeToAndCall(newAddress, params);
        }
    }

    function _setMarketId(string memory marketId) internal {
        _marketId = marketId;
        emit MarketIdSet(marketId);
    }

    /**
     * @dev Set the asset mappings
     * @return The address of the asset mappings
     **/
    function getAssetMappings() external view override returns (address){
        return getAddress(ASSET_MAPPINGS);
    }

    /**
     * @dev Set the asset mappings
     * @param assetMappings The address of the new asset mappings
     **/
    function setAssetMappingsImpl(address assetMappings) external override onlyOwner{
        _updateImpl(ASSET_MAPPINGS, assetMappings);
        emit AssetMappingsUpdated(assetMappings);
    }

    function getIncentivesController() external view override returns(address) {
        return getAddress(INCENTIVES_CONTROLLER);
    }

    function setIncentivesController(address incentives) external override onlyOwner{
        _addresses[INCENTIVES_CONTROLLER] = incentives;
        emit IncentivesControllerUpdated(incentives);
    }
}
