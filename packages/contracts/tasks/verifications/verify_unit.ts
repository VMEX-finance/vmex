import { task } from 'hardhat/config';
import {
  loadPoolConfig,
  ConfigNames,
  getWrappedNativeTokenAddress,
} from '../../helpers/configuration';
import {
  getVMEXOracle,
} from '../../helpers/contracts-getters';
import { verifyContract, getParamPerNetwork } from '../../helpers/contracts-helpers';

task('verify:unit', 'Verify a single contract at Etherscan')
  .addFlag('all', 'Verify all contracts at Etherscan')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ all, pool }, localDRE) => {
    await localDRE.run('set-DRE');
    
      const oracleImpl = await getVMEXOracle("0x6FA8a39F7f0d812155F6Caf54A08344aD87903bB");

      // Asset mappings
      console.log('\n- Verifying oracle...\n');
      await verifyContract("", oracleImpl, []);

    console.log('Finished verifications.');
  });
