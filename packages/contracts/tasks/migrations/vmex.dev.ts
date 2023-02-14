import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts } from '../../helpers/misc-utils';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import { buildTestEnv } from '../../helpers/contracts-deployments';

task('vmex:dev', 'Deploy development enviroment')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .addFlag('overwrite', 'Overwrite existing implementations')
  .setAction(async ({ verify, overwrite }, localBRE) => {
    const POOL_NAME = ConfigNames.Aave;

    await localBRE.run('set-DRE');
    const [deployer, secondaryWallet] = await getEthersSigners();
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }

    console.log('Migration started\n');

    await buildTestEnv(deployer, overwrite);

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
    printContracts();
  });
