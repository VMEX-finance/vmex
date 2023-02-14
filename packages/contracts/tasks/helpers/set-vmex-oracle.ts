import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts, waitForTx } from '../../helpers/misc-utils';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import { buildTestEnv } from '../../helpers/contracts-deployments';
import { getDbEntry, getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy } from '../../helpers/contracts-getters';
import { eContractid } from '../../helpers/types';
import { ethers } from 'ethers';

task('vmex:set-oracle', 'Deploy development enviroment')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    const POOL_NAME = ConfigNames.Aave;

    await localBRE.run('set-DRE');
    const [deployer, secondaryWallet] = await getEthersSigners();
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }

    const addressesProvider = await getLendingPoolAddressesProvider();
    console.log("Previous VMEX oracle in addressesprovider: ", await addressesProvider.getPriceOracle())
    await waitForTx(
        await addressesProvider.setAddress(
          ethers.utils.formatBytes32String("VMEX_PRICE_ORACLE"),
          (await getDbEntry(eContractid.VMEXOracle)).address
        )
      );
      console.log("New VMEX oracle in addressesprovider: ", await addressesProvider.getPriceOracle())

  });
