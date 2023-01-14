// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";

/**
 * @title LendingPoolAddressesProvider contract
 * @dev Main registry of addresses part of or connected to the protocol, including permissioned roles
 * - Acting also as factory of proxies and admin of those, so with right to change its implementations
 * - Owned by the Aave Governance
 * @author Aave
 **/
interface ILendingPoolAddressesProvider {
    event MarketIdSet(string newMarketId);
    event LendingPoolUpdated(address indexed newAddress);

    // event ATokensAndRatesHelperUpdated(address indexed newAddress);
    event ConfigurationAdminUpdated(
        address indexed newAddress,
        uint64 indexed trancheId
    );
    event EmergencyAdminUpdated(address indexed newAddress);
    event LendingPoolConfiguratorUpdated(address indexed newAddress);
    event LendingPoolCollateralManagerUpdated(address indexed newAddress);
    event PriceOracleUpdated(address indexed newAddress);
    event CurvePriceOracleUpdated(address indexed newAddress);
    event CurvePriceOracleWrapperUpdated(address indexed newAddress);
    event CurveAddressProviderUpdated(address indexed newAddress);
    event LendingRateOracleUpdated(address indexed newAddress);
    event ProxyCreated(bytes32 id, address indexed newAddress);
    event AddressSet(bytes32 id, address indexed newAddress, bool hasProxy);


    event VMEXTreasuryUpdated(address indexed newAddress);
    event AssetMappingsUpdated(address indexed newAddress);


    event ATokenUpdated(address indexed newAddress);
    event StableDebtUpdated(address indexed newAddress);
    event VariableDebtUpdated(address indexed newAddress);

    function getVMEXTreasury() external view returns(address);

    function setVMEXTreasury(address add) external;

    function getMarketId() external view returns (string memory);

    function setMarketId(string calldata marketId) external;

    function setAddress(bytes32 id, address newAddress) external;

    function setAddressAsProxy(bytes32 id, address impl) external;

    function getAddress(bytes32 id) external view returns (address);

    function getLendingPool() external view returns (address);

    function setLendingPoolImpl(address pool) external;

    // function getATokenAndRatesHelper() external view returns (address);

    // function setATokenAndRatesHelper(address newAdd) external;

    function getLendingPoolConfigurator() external view returns (address);

    function setLendingPoolConfiguratorImpl(address configurator) external;

    function getLendingPoolCollateralManager() external view returns (address);

    function setLendingPoolCollateralManager(address manager) external;

    //********************************************************** */
    //permissionless tranches changes
    function getPoolAdmin(uint64 trancheId) external view returns (address); //this depends on trancheId. Different admin for different tranches

    function getGlobalAdmin() external view returns (address);

    function setGlobalAdmin(address admin) external;

    function setPoolAdmin(address admin, uint64 trancheId) external; //this depends on trancheId

    function getEmergencyAdmin()
        external
        view
        returns (address); //this depends on trancheId

    function setEmergencyAdmin(address admin) external; //this depends on trancheId

    function addPoolAdmin(address admin, uint64 trancheId) external;

    // function addEmergencyAdmin(address admin, uint64 trancheId) external;

    function getAddressTranche(bytes32 id, uint64 trancheId)
        external
        view
        returns (address);

    function isWhitelistedAddress(address ad) external view returns (bool);

    //********************************************************** */
    function getPriceOracle()
        external
        view
        returns (address); //this might also depend on trancheId if some configurators choose to

    function setPriceOracle(address priceOracle) external;

    function getLendingRateOracle() external view returns (address); //this oracle determines the stable borrow rate for a reserve. Should only need one, since it is based off the address of the reserve, which is unique for every asset in each tranche in each pool. Governance manually sets this

    function setLendingRateOracle(address lendingRateOracle) external;


    function getAToken() external view returns (address);
    function setATokenImpl(address pool) external;

    function getStableDebtToken() external view returns (address);
    function setStableDebtToken(address pool) external;
    function getVariableDebtToken() external view returns (address);
    function setVariableDebtToken(address pool) external;


    function getAssetMappings() external view returns (address);
    function setAssetMappingsImpl(address pool) external;
}
