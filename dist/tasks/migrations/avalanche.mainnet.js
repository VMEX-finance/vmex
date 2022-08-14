"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const etherscan_verification_1 = require("../../helpers/etherscan-verification");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const tenderly_utils_1 = require("../../helpers/tenderly-utils");
(0, config_1.task)('avalanche:mainnet', 'Deploy market at avalanche')
    .addParam('pool', `Market pool configuration, one of ${Object.keys(configuration_1.ConfigNames)}`)
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addFlag('skipRegistry', 'Skip addresses provider registration at Addresses Provider Registry')
    .setAction(async ({ verify, pool, skipRegistry }, DRE) => {
    const POOL_NAME = pool;
    await DRE.run('set-DRE');
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
        (0, etherscan_verification_1.checkVerification)();
    }
    console.log('Migration started\n');
    console.log('0. Deploy address provider registry');
    await DRE.run('full:deploy-address-provider-registry', { pool: POOL_NAME });
    console.log('1. Deploy address provider');
    await DRE.run('full:deploy-address-provider', { pool: POOL_NAME, skipRegistry });
    console.log('2. Deploy lending pool');
    await DRE.run('full:deploy-lending-pool', { pool: POOL_NAME });
    console.log('3. Deploy oracles');
    await DRE.run('full:deploy-oracles', { pool: POOL_NAME });
    console.log('4. Deploy Data Provider');
    await DRE.run('full:data-provider', { pool: POOL_NAME });
    console.log('5. Deploy WETH Gateway');
    await DRE.run('full-deploy-weth-gateway', { pool: POOL_NAME });
    console.log('6. Initialize lending pool');
    await DRE.run('full:initialize-lending-pool', { pool: POOL_NAME });
    if (verify) {
        (0, misc_utils_1.printContracts)();
        console.log('7. Veryfing contracts');
        await DRE.run('verify:general', { all: true, pool: POOL_NAME });
        console.log('8. Veryfing aTokens and debtTokens');
        await DRE.run('verify:tokens', { pool: POOL_NAME });
    }
    if ((0, tenderly_utils_1.usingTenderly)()) {
        const postDeployHead = DRE.tenderlyNetwork.getHead();
        const postDeployFork = DRE.tenderlyNetwork.getFork();
        console.log('Tenderly Info');
        console.log('- Head', postDeployHead);
        console.log('- Fork', postDeployFork);
    }
    console.log('\nFinished migrations');
    (0, misc_utils_1.printContracts)();
});
