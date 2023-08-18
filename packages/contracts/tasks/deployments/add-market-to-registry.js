"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const misc_utils_1 = require("../../helpers/misc-utils");
const configuration_1 = require("../../helpers/configuration");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const utils_1 = require("ethers/lib/utils");
const ethereumjs_util_1 = require("ethereumjs-util");
const process_1 = require("process");
(0, config_1.task)('add-market-to-registry', 'Adds address provider to registry')
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .addOptionalParam('addressesProvider', `Address of LendingPoolAddressProvider`)
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addFlag('deployRegistry', 'Deploy a new address provider registry')
    .setAction(async ({ verify, addressesProvider, pool, deployRegistry }, DRE) => {
    await DRE.run('set-DRE');
    let signer;
    const network = DRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const { ProviderId } = poolConfig;
    let providerRegistryAddress = (0, contracts_helpers_1.getParamPerNetwork)(poolConfig.ProviderRegistry, network);
    let providerRegistryOwner = (0, contracts_helpers_1.getParamPerNetwork)(poolConfig.ProviderRegistryOwner, network);
    const currentSignerAddress = await (await (await (0, contracts_getters_1.getFirstSigner)()).getAddress()).toLocaleLowerCase();
    let deployed = false;
    if (deployRegistry ||
        !providerRegistryAddress ||
        !(0, utils_1.isAddress)(providerRegistryAddress) ||
        (0, ethereumjs_util_1.isZeroAddress)(providerRegistryAddress)) {
        console.log('- Deploying a new Address Providers Registry:');
        await DRE.run('full:deploy-address-provider-registry', { verify, pool });
        providerRegistryAddress = (await (0, contracts_getters_1.getLendingPoolAddressesProviderRegistry)()).address;
        providerRegistryOwner = await (await (0, contracts_getters_1.getFirstSigner)()).getAddress();
        deployed = true;
    }
    if (!providerRegistryOwner ||
        !(0, utils_1.isAddress)(providerRegistryOwner) ||
        (0, ethereumjs_util_1.isZeroAddress)(providerRegistryOwner)) {
        throw Error('config.ProviderRegistryOwner is missing or is not an address.');
    }
    // Checks if deployer address is registry owner
    if (process.env.FORK) {
        await DRE.network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [providerRegistryOwner],
        });
        signer = DRE.ethers.provider.getSigner(providerRegistryOwner);
        const firstAccount = await (0, contracts_getters_1.getFirstSigner)();
        await firstAccount.sendTransaction({ value: (0, utils_1.parseEther)('10'), to: providerRegistryOwner });
    }
    else if (!deployed &&
        providerRegistryOwner.toLocaleLowerCase() !== currentSignerAddress.toLocaleLowerCase()) {
        console.error('ProviderRegistryOwner config does not match current signer:');
        console.error('Expected:', providerRegistryOwner);
        console.error('Current:', currentSignerAddress);
        (0, process_1.exit)(2);
    }
    else {
        signer = DRE.ethers.provider.getSigner(providerRegistryOwner);
    }
    // 1. Address Provider Registry instance
    const addressesProviderRegistry = (await (0, contracts_getters_1.getLendingPoolAddressesProviderRegistry)(providerRegistryAddress)).connect(signer);
    const addressesProviderInstance = await (0, contracts_getters_1.getLendingPoolAddressesProvider)(addressesProvider);
    // 2. Set the provider at the Registry
    await (0, misc_utils_1.waitForTx)(await addressesProviderRegistry.registerAddressesProvider(addressesProviderInstance.address, ProviderId));
    console.log(`Added LendingPoolAddressesProvider with address "${addressesProviderInstance.address}" to registry located at ${addressesProviderRegistry.address}`);
});
//# sourceMappingURL=add-market-to-registry.js.map