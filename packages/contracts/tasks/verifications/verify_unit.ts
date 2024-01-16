import { task } from 'hardhat/config';
import {
  loadPoolConfig,
  ConfigNames,
  getWrappedNativeTokenAddress,
} from '../../helpers/configuration';
import {
  getIncentivesControllerImpl,
  getInterestRateStrategy,
  getLendingPoolAddressesProvider,
  getVMEXOracle,
} from '../../helpers/contracts-getters';
import { verifyContract, getParamPerNetwork } from '../../helpers/contracts-helpers';
import BigNumber from 'bignumber.js';
import { oneRay } from '../../helpers/constants';

task('verify:unit', 'Verify a single contract at Etherscan')
  .addFlag('all', 'Verify all contracts at Etherscan')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ all, pool }, localDRE) => {
    await localDRE.run('set-DRE');
    
      const c = await getIncentivesControllerImpl("0x5996263C1A03BE3EcA7e66967630abe05b82F36C");

      // Asset mappings
      console.log('\n- Verifying contract...\n');
      await verifyContract("", c, []);

    console.log('Finished verifications.');
  });
