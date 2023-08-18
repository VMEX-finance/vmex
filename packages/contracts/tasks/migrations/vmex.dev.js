"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const etherscan_verification_1 = require("../../helpers/etherscan-verification");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
(0, config_1.task)('vmex:dev', 'Deploy development enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addFlag('overwrite', 'Overwrite existing implementations')
    .setAction(async ({ verify, overwrite }, localBRE) => {
    const POOL_NAME = configuration_1.ConfigNames.Aave;
    await localBRE.run('set-DRE');
    const [deployer, secondaryWallet] = await (0, contracts_helpers_1.getEthersSigners)();
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
        (0, etherscan_verification_1.checkVerification)();
    }
    console.log('Migration started\n');
    await (0, contracts_deployments_1.buildTestEnv)(deployer, overwrite);
    // console.log('1. Deploy mock tokens');
    // await localBRE.run('dev:deploy-mock-tokens', { verify });
    // console.log('2. Deploy address provider');
    // await localBRE.run('dev:deploy-address-provider', { verify });
    // console.log('2.5. Asset Mappings');
    // await localBRE.run('dev:deploy-asset-mappings', { verify });
    // console.log('3. Deploy lending pool');
    // await localBRE.run('dev:deploy-lending-pool', { verify, pool: POOL_NAME });
    // console.log('4. Deploy oracles');
    // await localBRE.run('dev:deploy-oracles', { verify, pool: POOL_NAME });
    // console.log('5. Initialize lending pool tranche 1');
    // await localBRE.run('dev:initialize-lending-pool', { verify, pool: POOL_NAME });
    // console.log('6. Initialize lending pool');
    // await localBRE.run('dev:initialize-tranche-2', { verify, pool: POOL_NAME });
    console.log('\nFinished migration');
    (0, misc_utils_1.printContracts)();
});
//# sourceMappingURL=vmex.dev.js.map