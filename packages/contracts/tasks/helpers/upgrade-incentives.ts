import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts, waitForTx } from '../../helpers/misc-utils';
import { getEthersSigners, insertContractAddressInDb } from '../../helpers/contracts-helpers';
import { buildTestEnv, deployIncentivesController, deployLendingPoolConfigurator } from '../../helpers/contracts-deployments';
import { getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy } from '../../helpers/contracts-getters';
import { eContractid } from '../../helpers/types';

task('vmex:upgrade-incentives', 'Upgrade incentives controller implementation')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }
    
    const addressesProvider = await getLendingPoolAddressesProvider(undefined, true);

    const newIncentivesImpl = await deployIncentivesController(verify);

    await insertContractAddressInDb(
      eContractid.IncentivesControllerImpl,
      newIncentivesImpl.address
    );

    const incentivesControllerProxy = await addressesProvider.getIncentivesController()
    console.log("Proxy should still be the same: ", incentivesControllerProxy)
    console.log("New incentives controller address: ", newIncentivesImpl.address)
    
    // await insertContractAddressInDb(
    //   eContractid.IncentivesControllerProxy,
    //   incentivesControllerProxy.address
    // );
  });
