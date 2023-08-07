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
  getTranche0MockedDataOP,
  getTranche1MockedDataOP,
} from "../../helpers/init-helpers";
import { exit } from "process";
import {
  getAaveProtocolDataProvider,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
} from "../../helpers/contracts-getters";

task(
  "full:initialize-lending-pool-tranches-0-OP",
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
      const poolConfig = loadPoolConfig(pool);//await loadCustomAavePoolConfig("0"); //this is only for mainnet
      const {
        ReserveAssets,
      } = poolConfig as ICommonConfiguration;
      const reserveAssets = await getParamPerNetwork(ReserveAssets, network);

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
        await lendingPoolConfiguratorProxy.connect(admin).setTranchePause(true, 0)
      );
      
      // TODO: use real data for tranches that we want to deploy

      let [assets0, reserveFactors0, canBorrow0, canBeCollateral0] = getTranche0MockedDataOP(reserveAssets);
      await initReservesByHelper(
        assets0,
        reserveFactors0,
        canBorrow0,
        canBeCollateral0,
        admin,
        treasuryAddress,
        0
      );

      

      // Unpause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy
          .connect(admin)
          .setTranchePause(false, 0)
      );

      await claimTrancheId("Vmex tranche 1", admin);

      // Pause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy.connect(admin).setTranchePause(true, 1)
      );

      let [assets1, reserveFactors1, canBorrow1, canBeCollateral1] = getTranche1MockedDataOP(reserveAssets);
      await initReservesByHelper(
        assets1,
        reserveFactors1,
        canBorrow1,
        canBeCollateral1,
        admin,
        treasuryAddress,
        1
      );

      

      // Unpause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy
          .connect(admin)
          .setTranchePause(false, 1)
      );
    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
