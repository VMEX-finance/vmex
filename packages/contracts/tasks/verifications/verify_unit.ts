import { task } from 'hardhat/config';
import {
  loadPoolConfig,
  ConfigNames,
  getWrappedNativeTokenAddress,
} from '../../helpers/configuration';
import {
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
    
      const c = await getVMEXOracle("0x0c3E4a646363b91b8b956cF5D1fe761521C1E1ff");

      // Asset mappings
      console.log('\n- Verifying contract...\n');
      await verifyContract("", c, []);

    console.log('Finished verifications.');
  });
