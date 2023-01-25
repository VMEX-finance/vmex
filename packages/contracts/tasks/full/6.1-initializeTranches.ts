import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  ConfigNames,
  loadPoolConfig
} from "../../helpers/configuration";
import { getWETHGateway } from "../../helpers/contracts-getters";
import { eNetwork, ICommonConfiguration } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  claimTrancheId,
  initReservesByHelper,
  getTranche0MockedData,
} from "../../helpers/init-helpers";
import { exit } from "process";
import {
  getAaveProtocolDataProvider,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
} from "../../helpers/contracts-getters";

task(
  "full:initialize-lending-pool-tranches-0",
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
      const poolConfig = loadPoolConfig(ConfigNames.Aave);//await loadCustomAavePoolConfig("0"); //this is only for mainnet
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

      const admin = await DRE.ethers.getSigner(
        await addressesProvider.getGlobalAdmin()
      );
      // const oracle = await addressesProvider.getPriceOracle();

      if (!reserveAssets) {
        throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
      }

      const treasuryAddress = admin.address;
      console.log("before initReservesByHelper");

      
      await claimTrancheId("Vmex tranche 0", admin);

      // Pause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy.connect(admin).setPoolPause(true, 0)
      );

      let [assets0, reserveFactors0, canBorrow0, canBeCollateral0] = getTranche0MockedData(reserveAssets);
      await initReservesByHelper(
        assets0,
        reserveFactors0,
        canBorrow0,
        canBeCollateral0,
        admin,
        treasuryAddress,
        incentivesController || "",
        0
      );
    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
