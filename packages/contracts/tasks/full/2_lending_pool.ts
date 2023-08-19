import { task } from "hardhat/config";
import {
  getParamPerNetwork,
  insertContractAddressInDb,
  getContractAddressWithJsonFallback
} from "../../helpers/contracts-helpers";
import {
  deployATokenBeacon,
  deployATokenImplementations,
  deployLendingPool,
  deployLendingPoolConfigurator,
  deployVariableDebtTokenBeacon,
} from "../../helpers/contracts-deployments";
import { eContractid, eNetwork } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  getLendingPoolAddressesProvider,
  getLendingPool,
  getLendingPoolConfiguratorProxy,
} from "../../helpers/contracts-getters";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  loadPoolConfig,
  ConfigNames,
} from "../../helpers/configuration";

task("full:deploy-lending-pool", "Deploy lending pool for dev enviroment")
  .addFlag("verify", "Verify contracts at Etherscan")
  .addParam(
    "pool",
    `Pool name to retrieve configuration, supported: ${Object.values(
      ConfigNames
    )}`
  )
  .setAction(async ({ verify, pool }, DRE: HardhatRuntimeEnvironment) => {
    try {
      await DRE.run("set-DRE");
      const network = <eNetwork>DRE.network.name;
      const poolConfig = loadPoolConfig(pool);
      const addressesProvider = await getLendingPoolAddressesProvider();

      const { LendingPool, LendingPoolConfigurator } = poolConfig;

      // Reuse/deploy lending pool implementation
      let lendingPoolImplAddress = getParamPerNetwork(LendingPool, network);
      if (!notFalsyOrZeroAddress(lendingPoolImplAddress) || network.includes("localhost")) {
        console.log(
          "\tDeploying new lending pool implementation & libraries..."
        );
        const lendingPoolImpl = await deployLendingPool(verify);
        lendingPoolImplAddress = lendingPoolImpl.address;
        await lendingPoolImpl.initialize(addressesProvider.address);
      }
      console.log(
        "\tSetting lending pool implementation with address:",
        lendingPoolImplAddress
      );
      // Set lending pool impl to Address provider
      await waitForTx(
        await addressesProvider.setLendingPoolImpl(lendingPoolImplAddress || "")
      );

      const address = await addressesProvider.getLendingPool();
      const lendingPoolProxy = await getLendingPool(address);

      await insertContractAddressInDb(
        eContractid.LendingPool,
        lendingPoolProxy.address
      );

      // Reuse/deploy lending pool configurator
      let lendingPoolConfiguratorImplAddress = getParamPerNetwork(
        LendingPoolConfigurator,
        network
      ); //await deployLendingPoolConfigurator(verify);
      if (!notFalsyOrZeroAddress(lendingPoolConfiguratorImplAddress) || network.includes("localhost")) {
        console.log("\tDeploying new configurator implementation...");
        const lendingPoolConfiguratorImpl = await deployLendingPoolConfigurator(
          verify
        );
        lendingPoolConfiguratorImplAddress =
          lendingPoolConfiguratorImpl.address;
      }
      console.log(
        "\tSetting lending pool configurator implementation with address:",
        lendingPoolConfiguratorImplAddress
      );
      // Set lending pool conf impl to Address Provider
      await waitForTx(
        await addressesProvider.setLendingPoolConfiguratorImpl(
          lendingPoolConfiguratorImplAddress || ""
        )
      );

      const lendingPoolConfiguratorProxy =
        await getLendingPoolConfiguratorProxy(
          await addressesProvider.getLendingPoolConfigurator()
        );

      await insertContractAddressInDb(
        eContractid.LendingPoolConfigurator,
        lendingPoolConfiguratorProxy.address
      );

      await deployATokenImplementations(
        pool,
        poolConfig.ReservesConfig,
        verify
      );


      const aTokenImplAddress = await getContractAddressWithJsonFallback(
        eContractid.AToken, //this is implementation contract
        ConfigNames.Aave
      )
      const varDebtTokenImplAddress = await getContractAddressWithJsonFallback(
        eContractid.VariableDebtToken,
        ConfigNames.Aave
      )
      await waitForTx(
        await addressesProvider.setATokenImpl(
          aTokenImplAddress
        )
      );
  
      await waitForTx(
        await addressesProvider.setVariableDebtToken(
          varDebtTokenImplAddress
        )
      );
  
      const aTokenBeacon = await deployATokenBeacon([aTokenImplAddress], false);
  
      await waitForTx(
        await addressesProvider.setATokenBeacon(
          aTokenBeacon.address
        )
      );
  
      const variableDebtBeacon = await deployVariableDebtTokenBeacon([varDebtTokenImplAddress], false);
  
      await waitForTx(
        await addressesProvider.setVariableDebtTokenBeacon(
          variableDebtBeacon.address
        )
      );

    } catch (error) {
      throw error;
    }
  });
