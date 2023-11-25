import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts, waitForTx } from '../../helpers/misc-utils';
import { getEthersSigners, insertContractAddressInDb } from '../../helpers/contracts-helpers';
import { deployVMEXOracle } from '../../helpers/contracts-deployments';
import { getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy, getVMEXOracle } from '../../helpers/contracts-getters';
import { eContractid } from '../../helpers/types';
import * as fs from 'fs';

task('vmex:upgrade-oracle', 'Upgrade oracle')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    const POOL_NAME = ConfigNames.Aave;

    await localBRE.run('set-DRE');
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }
    
    const addressesProvider = await getLendingPoolAddressesProvider();

    const newOracleImpl = await deployVMEXOracle(verify); 
    const dat = addressesProvider.interface.encodeFunctionData("setPriceOracle", [newOracleImpl.address])
    console.log("new address: ", newOracleImpl.address)
    console.log("dat: ", dat)
    // await waitForTx(
    //   await addressesProvider.setPriceOracle(
    //     newOracleImpl.address
    //   )
    // );

    // const vmexOracleProxy = await getVMEXOracle(
    //   await addressesProvider.getPriceOracle()
    // );
    // await insertContractAddressInDb(
    //   eContractid.VMEXOracle,
    //   vmexOracleProxy.address
    // );
  });
