import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts } from '../../helpers/misc-utils';
import { usingTenderly } from '../../helpers/tenderly-utils';

task('add:assets', 'Add assets to existing deployment')
  .addParam('pool', `Market pool configuration, one of ${Object.keys(ConfigNames)}`)
  .addFlag('verify', 'Verify contracts at Etherscan')
  .addFlag('skipRegistry', 'Skip addresses provider registration at Addresses Provider Registry')
  .setAction(async ({ verify, pool, skipRegistry }, DRE) => {
    const POOL_NAME = pool;
    await DRE.run('set-DRE');

    // note: these actions do not submit any transactions but rather print to the console the bytecode of the tx so it can be submitted on safe multisig

    console.log('Adding new assets started\n');

    console.log("1.5. Deploy asset mappings");
    await DRE.run("add:deploy-asset-mappings", { pool: POOL_NAME });

    console.log('3. Deploy oracles');
    await DRE.run('add:deploy-oracles', { pool: POOL_NAME });

    console.log('6. modify lending pool');
    await DRE.run('add:modify-lending-pool-tranches-0-Base', { pool: POOL_NAME });

    console.log('7. Set staking types for tranche 0');
    await DRE.run('add-setStakingTypes', { pool: POOL_NAME });

    console.log('Begin staking for tranche 0 needs to be done after atokens have been deployed.');

    console.log('\nFinished adding');
  });
