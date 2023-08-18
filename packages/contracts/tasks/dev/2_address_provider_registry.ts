import { task } from 'hardhat/config';
import {
  deployLendingPoolAddressesProvider,
  deployLendingPoolAddressesProviderRegistry,
} from '../../helpers/contracts-deployments';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import { waitForTx } from '../../helpers/misc-utils';
import { AaveConfig } from '../../src/markets/aave';

task(
  'dev:deploy-address-provider',
  'Deploy address provider, registry and fee provider for dev enviroment'
)
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');

    const admin = await (await getEthersSigners())[0].getAddress();

    const addressesProvider = await deployLendingPoolAddressesProvider(AaveConfig.MarketId, verify);

    const addressesProviderRegistry = await deployLendingPoolAddressesProviderRegistry(verify);
    await waitForTx(
      await addressesProviderRegistry.registerAddressesProvider(addressesProvider.address, 1)
    );

    // 3. Set pool admins
    await waitForTx(
      await addressesProvider.setVMEXTreasury(
        "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49"
      )
    );
    await waitForTx(
      await addressesProvider.setGlobalAdmin(
        admin
      )
    );
    await waitForTx(
      await addressesProvider.setEmergencyAdmin(
        admin
      )
    );
    await waitForTx(
      await addressesProvider.addWhitelistedAddress(
        admin,
        true
      )
    );
    await waitForTx(
      await addressesProvider.addWhitelistedAddress(
        await (await getEthersSigners())[1].getAddress(),
        true
      )
    );

    //dev: enable anyone to create tranche
    await waitForTx(
      await addressesProvider.setPermissionlessTranches(
        true
      )
    );
    //await waitForTx(await addressesProvider.setEmergencyAdmin(await getEmergencyAdmin(poolConfig)));

    console.log("Pool Admin", await addressesProvider.getGlobalAdmin());
    console.log(
      "whitelisted addresses: ",
      await addressesProvider.getGlobalAdmin(),
      " and ",
      await await (await getEthersSigners())[1].getAddress()
    );
  });
