"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const misc_utils_1 = require("../../helpers/misc-utils");
const configuration_1 = require("../../helpers/configuration");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
(0, config_1.task)("full:deploy-address-provider", "Deploy address provider, registry and fee provider for dev enviroment")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .addFlag("skipRegistry")
    .setAction(async ({ verify, pool, skipRegistry }, DRE) => {
    await DRE.run("set-DRE");
    const network = DRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const { MarketId, LendingPoolAddressesProvider } = poolConfig;
    const addressesProvider = (0, contracts_helpers_1.getParamPerNetwork)(LendingPoolAddressesProvider, network);
    if ((0, misc_utils_1.notFalsyOrZeroAddress)(addressesProvider)) {
        console.log('Already deployed Addresses Provider Address at', addressesProvider);
    }
    else {
        console.log("trying to deploy addr provider");
        // 1. Deploy address provider and set genesis manager
        const addressesProvider = await (0, contracts_deployments_1.deployLendingPoolAddressesProvider)(MarketId, verify);
        // 2. Add to registry or setup a new one
        if (!skipRegistry) {
            const providerRegistryAddress = (0, contracts_helpers_1.getParamPerNetwork)(poolConfig.ProviderRegistry, DRE.network.name);
            await DRE.run("add-market-to-registry", {
                pool,
                addressesProvider: addressesProvider.address,
                deployRegistry: !(0, misc_utils_1.notFalsyOrZeroAddress)(providerRegistryAddress),
            });
        }
        // 3. Set pool admins and vmex treasury
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setVMEXTreasury(await (0, configuration_1.getVMEXTreasury)(poolConfig)));
        if (network.toString() == "optimism_localhost" || network.toString() == "localhost") {
            await (0, misc_utils_1.waitForTx)(await addressesProvider.setGlobalAdmin(await (0, configuration_1.getGenesisPoolAdminIndex)(poolConfig)));
            await (0, misc_utils_1.waitForTx)(await addressesProvider.setEmergencyAdmin(await (0, configuration_1.getGenesisPoolAdminIndex)(poolConfig)));
            await (0, misc_utils_1.waitForTx)(await addressesProvider.addWhitelistedAddress(await (0, configuration_1.getGenesisPoolAdminIndex)(poolConfig), true));
            await (0, misc_utils_1.waitForTx)(await addressesProvider.addWhitelistedAddress(await (0, configuration_1.getEmergencyAdminIndex)(poolConfig), true));
            await (0, misc_utils_1.waitForTx)(await addressesProvider.setPermissionlessTranches(true));
        }
        else { // real optimism or mainnet deployment
            await (0, misc_utils_1.waitForTx)(await addressesProvider.setGlobalAdmin(await (0, configuration_1.getGenesisPoolAdmin)(poolConfig)));
            await (0, misc_utils_1.waitForTx)(await addressesProvider.setEmergencyAdmin(await (0, configuration_1.getEmergencyAdmin)(poolConfig)));
            await (0, misc_utils_1.waitForTx)(await addressesProvider.addWhitelistedAddress(await (0, configuration_1.getGenesisPoolAdmin)(poolConfig), true));
            await (0, misc_utils_1.waitForTx)(await addressesProvider.addWhitelistedAddress("0x599e1DE505CfD6f10F64DD7268D856831f61627a", //team multisig
            true));
            await (0, misc_utils_1.waitForTx)(await addressesProvider.addWhitelistedAddress(await (0, configuration_1.getEmergencyAdmin)(poolConfig), true));
            // TODO: add partner protocols and trusted early adopters, but can also add it later
        }
        //await waitForTx(await addressesProvider.setEmergencyAdmin(await getEmergencyAdmin(poolConfig)));
        console.log("Pool Admin", await addressesProvider.getGlobalAdmin());
        console.log("whitelisted addresses: ", await addressesProvider.getGlobalAdmin(), " and ", await (0, configuration_1.getEmergencyAdmin)(poolConfig));
    }
    // console.log('Emergency Admin', await addressesProvider.getEmergencyAdmin());
});
//# sourceMappingURL=1_address_provider.js.map