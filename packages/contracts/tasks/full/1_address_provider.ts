import { task } from "hardhat/config";
import { deployLendingPoolAddressesProvider } from "../../helpers/contracts-deployments";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  ConfigNames,
  loadPoolConfig,
  getGenesisPoolAdmin,
  getEmergencyAdmin,
  getVMEXTreasury,
  getGenesisPoolAdminIndex,
  getEmergencyAdminIndex,
  getGlobalAdminMulitisig,
} from "../../helpers/configuration";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import { eNetwork } from "../../helpers/types";

task(
  "full:deploy-address-provider",
  "Deploy address provider, registry and fee provider for dev enviroment"
)
  .addFlag("verify", "Verify contracts at Etherscan")
  .addParam(
    "pool",
    `Pool name to retrieve configuration, supported: ${Object.values(
      ConfigNames
    )}`
  )
  .addFlag("skipRegistry")
  .setAction(async ({ verify, pool, skipRegistry }, DRE) => {
    await DRE.run("set-DRE");
    const network = <eNetwork>DRE.network.name;
    const poolConfig = loadPoolConfig(pool);
    const { MarketId, LendingPoolAddressesProvider } = poolConfig;
    // const addressesProvider = getParamPerNetwork(LendingPoolAddressesProvider, network);

    // if (notFalsyOrZeroAddress(addressesProvider)) {
    //   console.log('Already deployed Addresses Provider Address at', addressesProvider);
    // } else {
    // console.log("trying to deploy addr provider")
    // 1. Deploy address provider and set genesis manager
    const addressesProvider = await deployLendingPoolAddressesProvider(
      MarketId,
      verify
    );

    // 2. Add to registry or setup a new one
    if (!skipRegistry) {
      const providerRegistryAddress = getParamPerNetwork(
        poolConfig.ProviderRegistry,
        <eNetwork>DRE.network.name
      );

      await DRE.run("add-market-to-registry", {
        pool,
        addressesProvider: addressesProvider.address,
        deployRegistry: !notFalsyOrZeroAddress(providerRegistryAddress),
      });
    }
    // 3. Set pool admins and vmex treasury
    await waitForTx(
      await addressesProvider.setVMEXTreasury(
        await getVMEXTreasury(poolConfig)
      )
    );

    if(network.includes("localhost")){
      await waitForTx(
        await addressesProvider.setGlobalAdmin(
          await getGenesisPoolAdminIndex(poolConfig) 
        )
      );
      await waitForTx(
        await addressesProvider.setEmergencyAdmin(
          await getGenesisPoolAdminIndex(poolConfig) 
        )
      );
      await waitForTx(
        await addressesProvider.addWhitelistedAddress(
          await getGenesisPoolAdminIndex(poolConfig), 
          true
        )
      );
      await waitForTx(
        await addressesProvider.addWhitelistedAddress(
          await getEmergencyAdminIndex(poolConfig),
          true
        )
      );
      await waitForTx(
        await addressesProvider.setPermissionlessTranches(
          true
        )
      );
    }
    else { // real optimism or mainnet deployment
      await waitForTx(
        await addressesProvider.setGlobalAdmin(
          await getGenesisPoolAdmin(poolConfig) 
        )
      );
      await waitForTx(
        await addressesProvider.setEmergencyAdmin(
          await getEmergencyAdmin(poolConfig) 
        )
      );
      await waitForTx(
        await addressesProvider.addWhitelistedAddress(
          await getGenesisPoolAdmin(poolConfig), 
          true
        )
      );
      await waitForTx(
        await addressesProvider.addWhitelistedAddress(
          await getGlobalAdminMulitisig(poolConfig), //team multisig
          true
        )
      );
      await waitForTx(
        await addressesProvider.addWhitelistedAddress(
          await getEmergencyAdmin(poolConfig),
          true
        )
      );

      // TODO: add partner protocols and trusted early adopters, but can also add it later

    }
    
    //await waitForTx(await addressesProvider.setEmergencyAdmin(await getEmergencyAdmin(poolConfig)));

    console.log("Pool Admin", await addressesProvider.getGlobalAdmin());
    console.log(
      "whitelisted addresses: ",
      await addressesProvider.getGlobalAdmin(),
      " and ",
      await getEmergencyAdmin(poolConfig)
    );
    // }
    // console.log('Emergency Admin', await addressesProvider.getEmergencyAdmin());
  });
