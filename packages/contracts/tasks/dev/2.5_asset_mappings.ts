import { task } from "hardhat/config";
import {
  getParamPerNetwork,
  insertContractAddressInDb,
} from "../../helpers/contracts-helpers";
import {
  deployAssetMapping,
  deployStrategies,
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
import { waitForTx } from "../../helpers/misc-utils";
import { initAssetData } from "../../helpers/init-helpers";
import {
  getLendingPoolAddressesProvider,
  getAssetMappings,
} from "../../helpers/contracts-getters";

task(
  'dev:deploy-asset-mappings',
  'Deploy address provider, registry and fee provider for dev enviroment'
)
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    const network = <eNetwork>localBRE.network.name;
    const poolConfig = loadPoolConfig(ConfigNames.Aave); //await loadCustomAavePoolConfig("0"); //this is only for mainnet
    const {
      ReserveAssets,
      ReservesConfig,
      CurveMetadata,
    } = poolConfig as ICommonConfiguration;

    const reserveAssets = await getParamPerNetwork(ReserveAssets, network);

    const curveAssets = await getParamPerNetwork(CurveMetadata, network);

    const addressesProvider = await getLendingPoolAddressesProvider();

    const admin = await localBRE.ethers.getSigner(
      await addressesProvider.getGlobalAdmin()
    );

    // const oracle = await addressesProvider.getPriceOracle();

    if (!reserveAssets || !curveAssets) {
      throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
    }

    //deploy AssetMappings
    const AssetMappingImpl = await deployAssetMapping();

    await waitForTx(
      await addressesProvider.setAssetMappingsImpl(AssetMappingImpl.address)
    );

    const assetMappings = await getAssetMappings(
      await addressesProvider.getAssetMappings()
    );
    await insertContractAddressInDb(
      eContractid.AssetMappings,
      assetMappings.address
    );

    await initAssetData(
      ReservesConfig,
      reserveAssets,
      admin,
      false
    );
  });
