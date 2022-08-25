"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const etherscan_verification_1 = require("../../helpers/etherscan-verification");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
(0, config_1.task)('aave:dev', 'Deploy development enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, localBRE) => {
    const POOL_NAME = configuration_1.ConfigNames.Aave;
    await localBRE.run('set-DRE');
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
        (0, etherscan_verification_1.checkVerification)();
    }
    console.log('Migration started\n');
    console.log('1. Deploy mock tokens');
    await localBRE.run('dev:deploy-mock-tokens', { verify });
    console.log('2. Deploy address provider');
    await localBRE.run('dev:deploy-address-provider', { verify });
    console.log('3. Deploy lending pool');
    await localBRE.run('dev:deploy-lending-pool', { verify, pool: POOL_NAME });
    console.log('4. Deploy oracles');
    await localBRE.run('dev:deploy-oracles', { verify, pool: POOL_NAME });
    console.log('5. Deploy WETH Gateway');
    await localBRE.run('full-deploy-weth-gateway', { verify, pool: POOL_NAME });
    console.log('6. Initialize lending pool');
    await localBRE.run('dev:initialize-lending-pool', { verify, pool: POOL_NAME });
    console.log('\nFinished migration');
    (0, misc_utils_1.printContracts)();
});
