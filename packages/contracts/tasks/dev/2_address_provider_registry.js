"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const misc_utils_1 = require("../../helpers/misc-utils");
const aave_1 = require("../../markets/aave");
(0, config_1.task)('dev:deploy-address-provider', 'Deploy address provider, registry and fee provider for dev enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    const admin = await (await (0, contracts_helpers_1.getEthersSigners)())[0].getAddress();
    const addressesProvider = await (0, contracts_deployments_1.deployLendingPoolAddressesProvider)(aave_1.AaveConfig.MarketId, verify);
    const addressesProviderRegistry = await (0, contracts_deployments_1.deployLendingPoolAddressesProviderRegistry)(verify);
    await (0, misc_utils_1.waitForTx)(await addressesProviderRegistry.registerAddressesProvider(addressesProvider.address, 1));
    // 3. Set pool admins
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setVMEXTreasury("0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49"));
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setGlobalAdmin(admin));
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setEmergencyAdmin(admin));
    await (0, misc_utils_1.waitForTx)(await addressesProvider.addWhitelistedAddress(admin, true));
    await (0, misc_utils_1.waitForTx)(await addressesProvider.addWhitelistedAddress(await (await (0, contracts_helpers_1.getEthersSigners)())[1].getAddress(), true));
    //dev: enable anyone to create tranche
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setPermissionlessTranches(true));
    //await waitForTx(await addressesProvider.setEmergencyAdmin(await getEmergencyAdmin(poolConfig)));
    console.log("Pool Admin", await addressesProvider.getGlobalAdmin());
    console.log("whitelisted addresses: ", await addressesProvider.getGlobalAdmin(), " and ", await await (await (0, contracts_helpers_1.getEthersSigners)())[1].getAddress());
});
//# sourceMappingURL=2_address_provider_registry.js.map