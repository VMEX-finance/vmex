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

task("full:deploy-asset-mappings", "Deploy asset mappings for dev enviroment")
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
      BeethovenMetadata,
      AssetMappings
    } = poolConfig as ICommonConfiguration;

    // const assetMappings = getParamPerNetwork(AssetMappings, network);

    // if (notFalsyOrZeroAddress(assetMappings)) {
    //   console.log('Already deployed asset mappings Address at', assetMappings);
    // } else {
    const reserveAssets = await getParamPerNetwork(ReserveAssets, network);

    const curveAssets = await getParamPerNetwork(CurveMetadata, network);

    const beethovenAssets = await getParamPerNetwork(BeethovenMetadata, network);

    const addressesProvider = await getLendingPoolAddressesProvider();

    const admin = await getFirstSigner();


    // const oracle = await addressesProvider.getPriceOracle();

    if (!reserveAssets || !curveAssets) {
      throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
    }

    //deploy AssetMappings
    const AssetMappingImpl = await deployAssetMapping();

    console.log("addressesProvider.setAssetMappingsImpl: ")
    const tx=await waitForTx(
      await addressesProvider.setAssetMappingsImpl(AssetMappingImpl.address)
    );

    console.log("    * gasUsed", tx.gasUsed.toString());

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
      false,
      curveAssets,
      beethovenAssets
    );

    // deploy strategies
    // const [CrvLpStrategy, CrvLpEthStrategy, CvxStrategy] =
    //   await deployStrategies();

    // console.log("DEPLOYED CrvLp Strat at address", CrvLpStrategy.address);

    // await waitForTx(
    //   await assetMappings.connect(admin).addCurveStrategyAddress(
    //     //tricrypto uses this
    //     "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff",
    //     CrvLpStrategy.address
    //   )
    // ); //0 is default strategy

    // await waitForTx(
    //   await assetMappings
    //     .connect(admin)
    //     .addCurveStrategyAddress(
    //       "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
    //       CrvLpStrategy.address
    //     ) //threepool uses this
    // ); //0 is default strategy

    // await waitForTx(
    //   await assetMappings.connect(admin).addCurveStrategyAddress(
    //     //steth uses eth
    //     "0x06325440D014e39736583c165C2963BA99fAf14E",
    //     CrvLpEthStrategy.address
    //   )
    // ); //0 is default strategy
    // await waitForTx(
    //   await assetMappings.connect(admin).addCurveStrategyAddress(
    //     //fraxusdc uses this
    //     "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC",
    //     CrvLpStrategy.address
    //   )
    // ); //0 is default strategy
    // await waitForTx(
    //   await assetMappings.connect(admin).addCurveStrategyAddress(
    //     //frax3crv uses this
    //     "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
    //     CrvLpStrategy.address
    //   )
    // ); //0 is default strategy

    // await waitForTx(
    //   await assetMappings.connect(admin).addCurveStrategyAddress(
    //     //cvx uses this
    //     "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
    //     CvxStrategy.address
    //   )
    // ); //0 is default strategy
    // }
  });
