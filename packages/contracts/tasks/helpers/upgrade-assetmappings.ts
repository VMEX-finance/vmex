import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts, waitForTx } from '../../helpers/misc-utils';
import { getEthersSigners, insertContractAddressInDb } from '../../helpers/contracts-helpers';
import { deployAssetMapping, deployVMEXOracle } from '../../helpers/contracts-deployments';
import { getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy, getVMEXOracle } from '../../helpers/contracts-getters';
import { eContractid } from '../../helpers/types';
import * as fs from 'fs';

task('vmex:upgrade-assetmappings', 'Upgrade asset mappings')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    const POOL_NAME = ConfigNames.Aave;

    await localBRE.run('set-DRE');
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }
    
    const addressesProvider = await getLendingPoolAddressesProvider();

    const newImpl = await deployAssetMapping(verify); 
    const dat = addressesProvider.interface.encodeFunctionData("setPriceOracle", [newImpl.address])
    console.log("new address: ", newImpl.address)
    console.log("dat: ", dat)
    fs.writeFileSync('tasks/helpers/encodedFunctionCalls/upgradeAssetMapping'+newImpl.address+'.txt', dat, { flag: 'wx' });
    // await waitForTx(
    //   await addressesProvider.setPriceOracle(
    //     newOracleImpl.address
    //   )
    // );
  });
