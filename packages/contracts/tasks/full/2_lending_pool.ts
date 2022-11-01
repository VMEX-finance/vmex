import { task } from "hardhat/config";
import {
  getParamPerNetwork,
  insertContractAddressInDb,
} from "../../helpers/contracts-helpers";
import {
  deployATokenImplementations,
  deployATokensAndRatesHelper,
  deployLendingPool,
  deployLendingPoolConfigurator,
  deployStableAndVariableTokensHelper,
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
  getGenesisPoolAdmin,
  getEmergencyAdmin,
  getGlobalVMEXReserveFactor,
  getTreasuryAddress,
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
      if (!notFalsyOrZeroAddress(lendingPoolImplAddress)) {
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
        await addressesProvider.setLendingPoolImpl(lendingPoolImplAddress)
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
      if (!notFalsyOrZeroAddress(lendingPoolConfiguratorImplAddress)) {
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
          lendingPoolConfiguratorImplAddress
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

      //****** SETS DEFAULT VMEX TREASURY TO THAT PROVIDED IN THE POOL CONFIG */
      /// 0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c for main
      await lendingPoolConfiguratorProxy.setDefaultVMEXTreasury(
        await getTreasuryAddress(poolConfig)
      );

      // Deploy deployment helpers
      await deployStableAndVariableTokensHelper(
        [lendingPoolProxy.address, addressesProvider.address],
        verify
      );
      const ATokensAndRatesHelper = await deployATokensAndRatesHelper(
        [
          lendingPoolProxy.address,
          addressesProvider.address,
          lendingPoolConfiguratorProxy.address,
          await getGlobalVMEXReserveFactor(),
        ],
        verify
      );

      if (!notFalsyOrZeroAddress(ATokensAndRatesHelper.address)) {
        //bad address
        throw "deploying ATokensAndRatesHelper error, address is falsy or zero";
      } else {
        console.log(
          "ATokensAndRatesHelper deployed at ",
          ATokensAndRatesHelper.address
        );
      }

      await waitForTx(
        await addressesProvider.setATokenAndRatesHelper(
          ATokensAndRatesHelper.address
        )
      );

      await deployATokenImplementations(
        pool,
        poolConfig.ReservesConfig,
        verify
      );
    } catch (error) {
      if (DRE.network.name.includes("tenderly")) {
        const transactionLink = `https://dashboard.tenderly.co/${
          DRE.config.tenderly.username
        }/${DRE.config.tenderly.project}/fork/${DRE.tenderly
          .network()
          .getFork()}/simulation/${DRE.tenderly.network().getHead()}`;
        console.error("Check tx error:", transactionLink);
      }
      throw error;
    }
  });