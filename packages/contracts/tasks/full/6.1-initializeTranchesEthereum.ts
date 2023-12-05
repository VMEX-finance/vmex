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
  getTranche0DataOP,
  getTranche1DataOP,
  getAllMockedData,
  getLSDTrancheEthereum,
  verifyTrancheId,
  configureCollateralParams,
} from "../../helpers/init-helpers";
import { exit } from "process";
import {
  getAaveProtocolDataProvider,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
} from "../../helpers/contracts-getters";

task(
  "full:initialize-lending-pool-tranches-0-Ethereum",
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
        LSDReservesConfig
      } = poolConfig as ICommonConfiguration;
      if (!LSDReservesConfig) throw "No LSDReservesConfig"
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

      const trancheId = await claimTrancheId("Vmex tranche 0", admin);
      await verifyTrancheId(trancheId);

      // Pause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy.connect(admin).setTranchePause(true, 0)
      );
      let assets0, reserveFactors0, canBorrow0, canBeCollateral0
      
      [assets0, reserveFactors0, canBorrow0, canBeCollateral0] = getLSDTrancheEthereum(reserveAssets);


      await initReservesByHelper(
        assets0,
        reserveFactors0,
        canBorrow0,
        canBeCollateral0,
        admin,
        treasuryAddress,
        0
      );

      await configureCollateralParams(
        reserveAssets,
        LSDReservesConfig,
        trancheId,
        admin
      )


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

      let [assets1, reserveFactors1, canBorrow1, canBeCollateral1] = getTranche1DataOP(reserveAssets);
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
