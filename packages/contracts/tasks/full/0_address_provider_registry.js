"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("ethers/lib/utils");
const config_1 = require("hardhat/config");
const configuration_1 = require("../../helpers/configuration");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const misc_utils_1 = require("../../helpers/misc-utils");
(0, config_1.task)('full:deploy-address-provider-registry', 'Deploy address provider registry')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, DRE) => {
    console.log('prior dre');
    await DRE.run('set-DRE');
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const network = DRE.network.name;
    const signer = await (0, contracts_getters_1.getFirstSigner)();
    console.log('Deployer:', await signer.getAddress(), (0, utils_1.formatEther)(await signer.getBalance()));
    const providerRegistryAddress = (0, contracts_helpers_1.getParamPerNetwork)(poolConfig.ProviderRegistry, network);
    console.log('Signer', await signer.getAddress());
    console.log('Balance', (0, utils_1.formatEther)(await signer.getBalance()));
    if ((0, misc_utils_1.notFalsyOrZeroAddress)(providerRegistryAddress)) {
        console.log('Already deployed Provider Registry Address at', providerRegistryAddress);
    }
    else {
        const contract = await (0, contracts_deployments_1.deployLendingPoolAddressesProviderRegistry)(verify);
        console.log('Deployed Registry Address:', contract.address);
    }
    console.log("NEW: deploy aave libraries first so all contracts can use it");
    await (0, contracts_deployments_1.deployAaveLibraries)();
});
//# sourceMappingURL=0_address_provider_registry.js.map