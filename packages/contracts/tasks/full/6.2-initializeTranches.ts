import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  loadPoolConfig,
  ConfigNames,
  getTreasuryAddress,
  getEmergencyAdmin,
} from "../../helpers/configuration";
import { getWETHGateway } from "../../helpers/contracts-getters";
import { eNetwork, ICommonConfiguration } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  claimTrancheId,
  initReservesByHelper,
  getTranche1MockedData,
} from "../../helpers/init-helpers";
import { exit } from "process";
import {
  getAaveProtocolDataProvider,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
} from "../../helpers/contracts-getters";

task(
  "full:initialize-lending-pool-tranches-1",
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
      const poolConfig = loadPoolConfig(ConfigNames.Aave);
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

      const admin = await DRE.ethers.getSigner(
        await addressesProvider.getGlobalAdmin()
      );
      const emergAdmin = await DRE.ethers.getSigner(
        await getEmergencyAdmin(poolConfig)
      );
      // const oracle = await addressesProvider.getPriceOracle();

      if (!reserveAssets) {
        throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
      }

      const treasuryAddress = emergAdmin.address;
      console.log("before initReservesByHelper");

      await claimTrancheId("Vmex tranche 1", emergAdmin);

      // Pause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy
          .connect(admin)
          .setPoolPause(true, 1)
      );

      let [assets0, reserveFactors0, canBorrow0, canBeCollateral0] = getTranche1MockedData(reserveAssets);
      await initReservesByHelper(
        assets0,
        reserveFactors0,
        canBorrow0,
        canBeCollateral0,
        emergAdmin,
        treasuryAddress,
        incentivesController,
        1
      );

      const tricrypto2StratTranche = 1;

      // admin grants strategy access to all funds
      await waitForTx(
        await lendingPoolConfiguratorProxy
          .connect(emergAdmin)
          .addStrategy(
            reserveAssets["Tricrypto2"],
            tricrypto2StratTranche,
            "0" //default
          )
      );

      console.log("Finished deploying strategy in tranche 1");

      // Unpause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy
          .connect(admin)
          .setPoolPause(false, 0)
      );
      // Unpause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy
          .connect(admin)
          .setPoolPause(false, 1)
      );

    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
