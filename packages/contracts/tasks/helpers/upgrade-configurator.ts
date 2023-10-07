import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts, waitForTx } from '../../helpers/misc-utils';
import { getEthersSigners, insertContractAddressInDb } from '../../helpers/contracts-helpers';
import { buildTestEnv, deployLendingPoolConfigurator } from '../../helpers/contracts-deployments';
import { getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy } from '../../helpers/contracts-getters';
import { eContractid } from '../../helpers/types';

task('vmex:upgrade-configurator', 'Upgrade configurator contract')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    const POOL_NAME = ConfigNames.Aave;

    await localBRE.run('set-DRE');
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }
    
    const addressesProvider = await getLendingPoolAddressesProvider();

    const newConfiguratorImpl = await deployLendingPoolConfigurator(); 
    await waitForTx(
      await addressesProvider.setLendingPoolConfiguratorImpl(
        newConfiguratorImpl.address
      )
    );

    const lendingPoolConfiguratorProxy = await getLendingPoolConfiguratorProxy(
      await addressesProvider.getLendingPoolConfigurator()
    );
    await insertContractAddressInDb(
      eContractid.LendingPoolConfigurator,
      lendingPoolConfiguratorProxy.address
    );
  });
