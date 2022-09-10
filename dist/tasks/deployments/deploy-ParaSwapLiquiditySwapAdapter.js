"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const types_1 = require("../../types");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const types_2 = require("../../helpers/types");
const CONTRACT_NAME = 'ParaSwapLiquiditySwapAdapter';
(0, config_1.task)(`deploy-${CONTRACT_NAME}`, `Deploys the ${CONTRACT_NAME} contract`)
    .addParam('provider', 'Address of the LendingPoolAddressesProvider')
    .addParam('augustusRegistry', 'Address of ParaSwap AugustusRegistry')
    .addFlag('verify', `Verify ${CONTRACT_NAME} contract via Etherscan API.`)
    .setAction(async ({ provider, augustusRegistry, verify }, localBRE) => {
    await localBRE.run('set-DRE');
    if (!localBRE.network.config.chainId) {
        throw new Error('INVALID_CHAIN_ID');
    }
    console.log(`\n- ${CONTRACT_NAME} deployment`);
    const adapter = await new types_1.ParaSwapLiquiditySwapAdapterFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(provider, augustusRegistry);
    await adapter.deployTransaction.wait();
    console.log(`${CONTRACT_NAME}.address`, adapter.address);
    if (verify) {
        await (0, contracts_helpers_1.verifyContract)(types_2.eContractid.ParaSwapLiquiditySwapAdapter, adapter, [
            provider,
            augustusRegistry,
        ]);
    }
    console.log(`\tFinished ${CONTRACT_NAME} deployment`);
});
