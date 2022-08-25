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
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setPoolAdmin(admin));
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setEmergencyAdmin(admin));
    const addressesProviderRegistry = await (0, contracts_deployments_1.deployLendingPoolAddressesProviderRegistry)(verify);
    await (0, misc_utils_1.waitForTx)(await addressesProviderRegistry.registerAddressesProvider(addressesProvider.address, 1));
});
