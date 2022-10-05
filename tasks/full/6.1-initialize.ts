import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  loadPoolConfig,
  loadCustomAavePoolConfig,
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
  configureReservesByHelper,
} from "../../helpers/init-helpers";
import { exit } from "process";
import {
  getAaveProtocolDataProvider,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
} from "../../helpers/contracts-getters";

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

      const treasuryAddress = await getTreasuryAddress(poolConfig);
      console.log("before initReservesByHelper");

      await claimTrancheId(1, emergAdmin, emergAdmin);

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
    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
