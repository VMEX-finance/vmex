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
(0, config_1.task)('dev:deploy-asset-mappings', 'Deploy address provider, registry and fee provider for dev enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    const network = localBRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(configuration_1.ConfigNames.Aave); //await loadCustomAavePoolConfig("0"); //this is only for mainnet
    const { ReserveAssets, ReservesConfig, CurveMetadata, } = poolConfig;
    const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
    const curveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(CurveMetadata, network);
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const admin = await localBRE.ethers.getSigner(await addressesProvider.getGlobalAdmin());
    // const oracle = await addressesProvider.getPriceOracle();
    if (!reserveAssets || !curveAssets) {
        throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
    }
    //deploy AssetMappings
    const AssetMappingImpl = await (0, contracts_deployments_1.deployAssetMapping)();
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setAssetMappingsImpl(AssetMappingImpl.address));
    const assetMappings = await (0, contracts_getters_1.getAssetMappings)(await addressesProvider.getAssetMappings());
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.AssetMappings, assetMappings.address);
    await (0, init_helpers_1.initAssetData)(ReservesConfig, reserveAssets, admin, false);
});
//# sourceMappingURL=2.5_asset_mappings.js.map