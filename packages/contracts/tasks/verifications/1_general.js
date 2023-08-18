"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const configuration_1 = require("../../helpers/configuration");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const misc_utils_1 = require("../../helpers/misc-utils");
const types_1 = require("../../helpers/types");
(0, config_1.task)('verify:general', 'Verify contracts at Etherscan')
    .addFlag('all', 'Verify all contracts at Etherscan')
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ all, pool }, localDRE) => {
    await localDRE.run('set-DRE');
    const network = localDRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const { ReserveAssets, ReservesConfig, ProviderRegistry, MarketId, LendingPoolCollateralManager, LendingPoolConfigurator, LendingPool, WethGateway, } = poolConfig;
    const registryAddress = (0, contracts_helpers_1.getParamPerNetwork)(ProviderRegistry, network);
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const addressesProviderRegistry = (0, misc_utils_1.notFalsyOrZeroAddress)(registryAddress)
        ? await (0, contracts_getters_1.getLendingPoolAddressesProviderRegistry)(registryAddress)
        : await (0, contracts_getters_1.getLendingPoolAddressesProviderRegistry)();
    const vmexoracle = await addressesProvider.getPriceOracle();
    const lendingPoolAddress = await addressesProvider.getLendingPool();
    const lendingPoolConfiguratorAddress = await addressesProvider.getLendingPoolConfigurator(); //getLendingPoolConfiguratorProxy();
    const lendingPoolCollateralManagerAddress = await addressesProvider.getLendingPoolCollateralManager();
    const vmexoracleProxy = await (0, contracts_getters_1.getProxy)(vmexoracle);
    const lendingPoolProxy = await (0, contracts_getters_1.getProxy)(lendingPoolAddress);
    const lendingPoolConfiguratorProxy = await (0, contracts_getters_1.getProxy)(lendingPoolConfiguratorAddress);
    const lendingPoolCollateralManagerProxy = await (0, contracts_getters_1.getProxy)(lendingPoolCollateralManagerAddress);
    if (all) {
        const lendingPoolImplAddress = (0, contracts_helpers_1.getParamPerNetwork)(LendingPool, network);
        const lendingPoolImpl = (0, misc_utils_1.notFalsyOrZeroAddress)(lendingPoolImplAddress)
            ? await (0, contracts_getters_1.getLendingPoolImpl)(lendingPoolImplAddress)
            : await (0, contracts_getters_1.getLendingPoolImpl)();
        const lendingPoolConfiguratorImplAddress = (0, contracts_helpers_1.getParamPerNetwork)(LendingPoolConfigurator, network);
        const lendingPoolConfiguratorImpl = (0, misc_utils_1.notFalsyOrZeroAddress)(lendingPoolConfiguratorImplAddress)
            ? await (0, contracts_getters_1.getLendingPoolConfiguratorImpl)(lendingPoolConfiguratorImplAddress)
            : await (0, contracts_getters_1.getLendingPoolConfiguratorImpl)();
        const lendingPoolCollateralManagerImplAddress = (0, contracts_helpers_1.getParamPerNetwork)(LendingPoolCollateralManager, network);
        const lendingPoolCollateralManagerImpl = (0, misc_utils_1.notFalsyOrZeroAddress)(lendingPoolCollateralManagerImplAddress)
            ? await (0, contracts_getters_1.getLendingPoolCollateralManagerImpl)(lendingPoolCollateralManagerImplAddress)
            : await (0, contracts_getters_1.getLendingPoolCollateralManagerImpl)();
        const wethGatewayAddress = (0, contracts_helpers_1.getParamPerNetwork)(WethGateway, network);
        const wethGateway = (0, misc_utils_1.notFalsyOrZeroAddress)(wethGatewayAddress)
            ? await (0, contracts_getters_1.getWETHGateway)(wethGatewayAddress)
            : await (0, contracts_getters_1.getWETHGateway)();
        // Address Provider
        console.log('\n- Verifying address provider...\n');
        await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.LendingPoolAddressesProvider, addressesProvider, [MarketId]);
        // Address Provider Registry
        console.log('\n- Verifying address provider registry...\n');
        await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.LendingPoolAddressesProviderRegistry, addressesProviderRegistry, []);
        // Lending Pool implementation
        console.log('\n- Verifying LendingPool Implementation...\n');
        await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.LendingPool, lendingPoolImpl, []);
        // Lending Pool Configurator implementation
        console.log('\n- Verifying LendingPool Configurator Implementation...\n');
        await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.LendingPoolConfigurator, lendingPoolConfiguratorImpl, []);
        // Lending Pool Collateral Manager implementation
        console.log('\n- Verifying LendingPool Collateral Manager Implementation...\n');
        await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.LendingPoolCollateralManager, lendingPoolCollateralManagerImpl, []);
        // WETHGateway
        console.log('\n- Verifying  WETHGateway...\n');
        await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.WETHGateway, wethGateway, [
            await (0, configuration_1.getWrappedNativeTokenAddress)(poolConfig),
        ]);
    }
    // Lending Pool proxy
    console.log('\n- Verifying  Lending Pool Proxy...\n');
    await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.InitializableAdminUpgradeabilityProxy, lendingPoolProxy, [
        addressesProvider.address,
    ]);
    // LendingPool Conf proxy
    console.log('\n- Verifying  Lending Pool Configurator Proxy...\n');
    await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.InitializableAdminUpgradeabilityProxy, lendingPoolConfiguratorProxy, [addressesProvider.address]);
    // Proxy collateral manager
    console.log('\n- Verifying  Lending Pool Collateral Manager Proxy...\n');
    await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.InitializableAdminUpgradeabilityProxy, lendingPoolCollateralManagerProxy, []);
    // Proxy vmex oracle
    console.log('\n- Verifying  vmex oracle Proxy...\n');
    await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.VMEXOracle, vmexoracleProxy, []);
    // Proxy vmex oracle
    console.log('\n- Verifying  vmex oracle Proxy...\n');
    await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.VMEXOracle, vmexoracleProxy, []);
    console.log('Finished verifications.');
});
//# sourceMappingURL=1_general.js.map