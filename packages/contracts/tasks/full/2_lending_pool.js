"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const types_1 = require("../../helpers/types");
const misc_utils_1 = require("../../helpers/misc-utils");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const configuration_1 = require("../../helpers/configuration");
(0, config_1.task)("full:deploy-lending-pool", "Deploy lending pool for dev enviroment")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, DRE) => {
    try {
        await DRE.run("set-DRE");
        const network = DRE.network.name;
        const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
        const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
        const { LendingPool, LendingPoolConfigurator } = poolConfig;
        // Reuse/deploy lending pool implementation
        let lendingPoolImplAddress = (0, contracts_helpers_1.getParamPerNetwork)(LendingPool, network);
        if (!(0, misc_utils_1.notFalsyOrZeroAddress)(lendingPoolImplAddress)) {
            console.log("\tDeploying new lending pool implementation & libraries...");
            const lendingPoolImpl = await (0, contracts_deployments_1.deployLendingPool)(verify);
            lendingPoolImplAddress = lendingPoolImpl.address;
            await lendingPoolImpl.initialize(addressesProvider.address);
        }
        console.log("\tSetting lending pool implementation with address:", lendingPoolImplAddress);
        // Set lending pool impl to Address provider
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setLendingPoolImpl(lendingPoolImplAddress || ""));
        const address = await addressesProvider.getLendingPool();
        const lendingPoolProxy = await (0, contracts_getters_1.getLendingPool)(address);
        await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.LendingPool, lendingPoolProxy.address);
        // Reuse/deploy lending pool configurator
        let lendingPoolConfiguratorImplAddress = (0, contracts_helpers_1.getParamPerNetwork)(LendingPoolConfigurator, network); //await deployLendingPoolConfigurator(verify);
        if (!(0, misc_utils_1.notFalsyOrZeroAddress)(lendingPoolConfiguratorImplAddress)) {
            console.log("\tDeploying new configurator implementation...");
            const lendingPoolConfiguratorImpl = await (0, contracts_deployments_1.deployLendingPoolConfigurator)(verify);
            lendingPoolConfiguratorImplAddress =
                lendingPoolConfiguratorImpl.address;
        }
        console.log("\tSetting lending pool configurator implementation with address:", lendingPoolConfiguratorImplAddress);
        // Set lending pool conf impl to Address Provider
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setLendingPoolConfiguratorImpl(lendingPoolConfiguratorImplAddress || ""));
        const lendingPoolConfiguratorProxy = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)(await addressesProvider.getLendingPoolConfigurator());
        await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.LendingPoolConfigurator, lendingPoolConfiguratorProxy.address);
        await (0, contracts_deployments_1.deployATokenImplementations)(pool, poolConfig.ReservesConfig, verify);
        const aTokenImplAddress = await (0, contracts_helpers_1.getContractAddressWithJsonFallback)(types_1.eContractid.AToken, //this is implementation contract
        configuration_1.ConfigNames.Aave);
        const varDebtTokenImplAddress = await (0, contracts_helpers_1.getContractAddressWithJsonFallback)(types_1.eContractid.VariableDebtToken, configuration_1.ConfigNames.Aave);
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setATokenImpl(aTokenImplAddress));
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setVariableDebtToken(varDebtTokenImplAddress));
        const aTokenBeacon = await (0, contracts_deployments_1.deployATokenBeacon)([aTokenImplAddress], false);
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setATokenBeacon(aTokenBeacon.address));
        const variableDebtBeacon = await (0, contracts_deployments_1.deployVariableDebtTokenBeacon)([varDebtTokenImplAddress], false);
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setVariableDebtTokenBeacon(variableDebtBeacon.address));
    }
    catch (error) {
        throw error;
    }
});
//# sourceMappingURL=2_lending_pool.js.map