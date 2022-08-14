"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const misc_utils_1 = require("../../helpers/misc-utils");
const configuration_1 = require("../../helpers/configuration");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
(0, config_1.task)('full:deploy-address-provider', 'Deploy address provider, registry and fee provider for dev enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .addFlag('skipRegistry')
    .setAction(async ({ verify, pool, skipRegistry }, DRE) => {
    await DRE.run('set-DRE');
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const { MarketId } = poolConfig;
    // 1. Deploy address provider and set genesis manager
    const addressesProvider = await (0, contracts_deployments_1.deployLendingPoolAddressesProvider)(MarketId, verify);
    // 2. Add to registry or setup a new one
    if (!skipRegistry) {
        const providerRegistryAddress = (0, contracts_helpers_1.getParamPerNetwork)(poolConfig.ProviderRegistry, DRE.network.name);
        await DRE.run('add-market-to-registry', {
            pool,
            addressesProvider: addressesProvider.address,
            deployRegistry: !(0, misc_utils_1.notFalsyOrZeroAddress)(providerRegistryAddress),
        });
    }
    // 3. Set pool admins
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setPoolAdmin(await (0, configuration_1.getGenesisPoolAdmin)(poolConfig)));
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setEmergencyAdmin(await (0, configuration_1.getEmergencyAdmin)(poolConfig)));
    console.log('Pool Admin', await addressesProvider.getPoolAdmin());
    console.log('Emergency Admin', await addressesProvider.getEmergencyAdmin());
});
