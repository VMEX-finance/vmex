"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const configuration_1 = require("../../helpers/configuration");
const types_1 = require("../../helpers/types");
const misc_utils_1 = require("../../helpers/misc-utils");
const init_helpers_1 = require("../../helpers/init-helpers");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, config_1.task)("full:deploy-asset-mappings", "Deploy asset mappings for dev enviroment")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool, skipRegistry }, DRE) => {
    await DRE.run("set-DRE");
    const network = DRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool); //await loadCustomAavePoolConfig("0"); //this is only for mainnet
    const { ReserveAssets, ReservesConfig, CurveMetadata, BeethovenMetadata, AssetMappings } = poolConfig;
    const assetMappings = (0, contracts_helpers_1.getParamPerNetwork)(AssetMappings, network);
    if ((0, misc_utils_1.notFalsyOrZeroAddress)(assetMappings)) {
        console.log('Already deployed asset mappings Address at', assetMappings);
    }
    else {
        const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
        const curveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(CurveMetadata, network);
        const beethovenAssets = await (0, contracts_helpers_1.getParamPerNetwork)(BeethovenMetadata, network);
        const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
        const admin = await (0, contracts_getters_1.getFirstSigner)();
        // const oracle = await addressesProvider.getPriceOracle();
        if (!reserveAssets || !curveAssets) {
            throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
        }
        //deploy AssetMappings
        const AssetMappingImpl = await (0, contracts_deployments_1.deployAssetMapping)();
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setAssetMappingsImpl(AssetMappingImpl.address));
        const assetMappings = await (0, contracts_getters_1.getAssetMappings)(await addressesProvider.getAssetMappings());
        await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.AssetMappings, assetMappings.address);
        await (0, init_helpers_1.initAssetData)(ReservesConfig, reserveAssets, admin, false, curveAssets, beethovenAssets);
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
    }
});
//# sourceMappingURL=1.5_asset_mappings.js.map