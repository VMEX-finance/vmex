"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const types_1 = require("../../helpers/types");
const misc_utils_1 = require("../../helpers/misc-utils");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const configuration_1 = require("../../helpers/configuration");
(0, config_1.task)('dev:deploy-lending-pool', 'Deploy lending pool for dev enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const lendingPoolImpl = await (0, contracts_deployments_1.deployLendingPool)(verify);
    // Set lending pool impl to Address Provider
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setLendingPoolImpl(lendingPoolImpl.address));
    const address = await addressesProvider.getLendingPool();
    const lendingPoolProxy = await (0, contracts_getters_1.getLendingPool)(address);
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.LendingPool, lendingPoolProxy.address);
    const lendingPoolConfiguratorImpl = await (0, contracts_deployments_1.deployLendingPoolConfigurator)(verify);
    // Set lending pool conf impl to Address Provider
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setLendingPoolConfiguratorImpl(lendingPoolConfiguratorImpl.address));
    const lendingPoolConfiguratorProxy = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)(await addressesProvider.getLendingPoolConfigurator());
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.LendingPoolConfigurator, lendingPoolConfiguratorProxy.address);
    // Deploy deployment helpers
    await (0, contracts_deployments_1.deployStableAndVariableTokensHelper)([lendingPoolProxy.address, addressesProvider.address], verify);
    await (0, contracts_deployments_1.deployATokensAndRatesHelper)([lendingPoolProxy.address, addressesProvider.address, lendingPoolConfiguratorProxy.address], verify);
    await (0, contracts_deployments_1.deployATokenImplementations)(pool, poolConfig.ReservesConfig, verify);
});
