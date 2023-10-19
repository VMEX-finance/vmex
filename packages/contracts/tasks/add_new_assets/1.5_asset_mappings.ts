import { task } from "hardhat/config";
import {
  getParamPerNetwork,
  insertContractAddressInDb,
} from "../../helpers/contracts-helpers";
import {
  deployAssetMapping,
} from "../../helpers/contracts-deployments";
import {
  loadPoolConfig,
  ConfigNames,
} from "../../helpers/configuration";
import {
  eNetwork,
  ICommonConfiguration,
  eContractid,
} from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import { initAssetData } from "../../helpers/init-helpers";
import {
  getLendingPoolAddressesProvider,
  getAssetMappings,
  getFirstSigner,
} from "../../helpers/contracts-getters";

task("add:deploy-asset-mappings", "Deploy asset mappings for dev enviroment")
  .addFlag("verify", "Verify contracts at Etherscan")
  .addParam(
    "pool",
    `Pool name to retrieve configuration, supported: ${Object.values(
      ConfigNames
    )}`
  )
  .setAction(async ({ verify, pool, skipRegistry }, DRE) => {
    await DRE.run("set-DRE");
    const network = <eNetwork>DRE.network.name;
    const poolConfig = loadPoolConfig(pool); //await loadCustomAavePoolConfig("0"); //this is only for mainnet
    const {
      ReserveAssets,
      ReservesConfig,
      CurveMetadata,
      BeethovenMetadata
    } = poolConfig as ICommonConfiguration;

    const reserveAssets = await getParamPerNetwork(ReserveAssets, network);

    const curveAssets = await getParamPerNetwork(CurveMetadata, network);

    const beethovenAssets = await getParamPerNetwork(BeethovenMetadata, network);

    const admin = await getFirstSigner();

    if (!reserveAssets || !curveAssets) {
      throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
    }

    await initAssetData(
      ReservesConfig,
      reserveAssets,
      admin,
      false,
      curveAssets,
      beethovenAssets,
      false /* submitTx */
    );
  });
