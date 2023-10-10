import { task } from 'hardhat/config';
import {
  loadPoolConfig,
  ConfigNames,
  getWrappedNativeTokenAddress,
} from '../../helpers/configuration';
import {
  getInterestRateStrategy,
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
    
      const c = await getInterestRateStrategy("0x7671B8296722a9609152cc35AB15FB2d2e4D13B9");

      // Asset mappings
      console.log('\n- Verifying contract...\n');
      await verifyContract("", c, ["0xFC2748D74703cf6f2CE8ca9C8F388C3DAB1856f0", new BigNumber(0.45).multipliedBy(oneRay).toFixed(), '0', '0', '0']);

    console.log('Finished verifications.');
  });
