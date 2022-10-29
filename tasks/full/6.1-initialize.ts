import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  loadPoolConfig,
  loadCustomAavePoolConfig,
  ConfigNames,
  getTreasuryAddress,
  getEmergencyAdmin,
} from "../../helpers/configuration";
import { deployTricrypto2Strategy } from "../../helpers/contracts-deployments";
import { getWETHGateway } from "../../helpers/contracts-getters";
import { eNetwork, ICommonConfiguration } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  claimTrancheId,
  initReservesByHelper,
  configureReservesByHelper,
} from "../../helpers/init-helpers";
import { exit } from "process";
import {
  getAaveProtocolDataProvider,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
} from "../../helpers/contracts-getters";
// import { deployStrategies } from "@vmex/lending_pool_strategies/scripts/deployStrategies";

task(
  "full:initialize-lending-pool-tranche-1",
  "Initialize lending pool tranche 1 configuration."
)
  .addFlag("verify", "Verify contracts at Etherscan")
  .addParam(
    "pool",
    `Pool name to retrieve configuration, supported: ${Object.values(
      ConfigNames
    )}`
  )
  .setAction(async ({ verify, pool }, DRE) => {
    try {
      await DRE.run("set-DRE");
      const network = <eNetwork>DRE.network.name;
      const poolConfig = await loadCustomAavePoolConfig("1"); //this is only for mainnet
      const {
        ATokenNamePrefix,
        StableDebtTokenNamePrefix,
        VariableDebtTokenNamePrefix,
        SymbolPrefix,
        ReserveAssets,
        ReservesConfig,
        LendingPoolCollateralManager,
        WethGateway,
        IncentivesController,
      } = poolConfig as ICommonConfiguration;

      const reserveAssets = await getParamPerNetwork(ReserveAssets, network);
      const incentivesController = await getParamPerNetwork(
        IncentivesController,
        network
      );
      const addressesProvider = await getLendingPoolAddressesProvider();

      const lendingPoolConfiguratorProxy =
        await getLendingPoolConfiguratorProxy(
          await addressesProvider.getLendingPoolConfigurator()
        );

      const testHelpers = await getAaveProtocolDataProvider();

      const emergAdmin = await DRE.ethers.getSigner(
        await getEmergencyAdmin(poolConfig)
      );
      // const oracle = await addressesProvider.getPriceOracle();

      if (!reserveAssets) {
        throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
      }

      const treasuryAddress = emergAdmin.address;
      console.log("before initReservesByHelper");

      await claimTrancheId("Vmex tranche 1", emergAdmin, emergAdmin);

      // Pause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy
          .connect(emergAdmin)
          .setPoolPause(true, 1)
      );

      await initReservesByHelper(
        ReservesConfig,
        reserveAssets,
        ATokenNamePrefix,
        StableDebtTokenNamePrefix,
        VariableDebtTokenNamePrefix,
        SymbolPrefix,
        emergAdmin,
        treasuryAddress,
        incentivesController,
        pool,
        1, //tranche id
        verify
      );
      await configureReservesByHelper(
        ReservesConfig,
        reserveAssets,
        testHelpers,
        1,
        emergAdmin.address
      );

      // deploy strategies
      const tricrypto2Strat = await deployTricrypto2Strategy();
      const tricrypto2StratTranche = 1;

      console.log("DEPLOYED cvxCrv Strat at address", tricrypto2Strat.address);

      await waitForTx(
        await tricrypto2Strat.connect(emergAdmin).initialize(
          addressesProvider.address,
          reserveAssets["Tricrypto2"],
          tricrypto2StratTranche,
          38,
          3,
          "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46" // address of tricrypto2 pool
        )
      );

      console.log(
        "Initialized cvxCrv Strat at address",
        tricrypto2Strat.address
      );

      // admin grants strategy access to all funds
      await waitForTx(
        await lendingPoolConfiguratorProxy
          .connect(emergAdmin)
          .addStrategy(
            reserveAssets["Tricrypto2"],
            tricrypto2StratTranche,
            tricrypto2Strat.address
          )
      );
    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
