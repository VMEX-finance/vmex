import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  ConfigNames,
  loadPoolConfig
} from "../../helpers/configuration";
import { getLendingPool, getLendingPoolConfiguratorProxy, getWETHGateway } from "../../helpers/contracts-getters";
import { eNetwork, ICommonConfiguration } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  getTranche0DataBase, getTranche0DataOP,
} from "../../helpers/init-helpers";
import { exit } from "process";
import { ZERO_ADDRESS } from "../../helpers/constants";

task(
  "add:modify-lending-pool-tranches-0-Base",
  "Modify lending pool tranche 0 configuration."
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

      if (!reserveAssets) {
        throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
      }

      console.log("before initReservesByHelper");

      // TODO: use real data for tranches that we want to deploy
      let assets0, reserveFactors0, canBorrow0, canBeCollateral0;
      if(network=="base") [assets0, reserveFactors0, canBorrow0, canBeCollateral0] = getTranche0DataBase(reserveAssets);
      else if(network == "optimism") [assets0, reserveFactors0, canBorrow0, canBeCollateral0] = getTranche0DataOP(reserveAssets);
      else throw "network not supported yet in modifyExistingTranche"
      const lendingpool = await getLendingPool();
      const configurator = await getLendingPoolConfiguratorProxy();
      // Initialize variables for future reserves initialization
      let initInputParams: string = "[";
      for (let i = 0; i < assets0.length; i++) {
        const dat = await lendingpool.getReserveData(assets0[i], 0)
        if(!dat || dat.aTokenAddress == ZERO_ADDRESS) {
          initInputParams += `["${assets0[i]}", "${reserveFactors0[i]}", "${canBorrow0[i]}", "${canBeCollateral0[i]}"],`
        }
      }
      console.log("configurator address: ", configurator.address)
      console.log(initInputParams.substring(0,initInputParams.length-1)+"]")

    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
