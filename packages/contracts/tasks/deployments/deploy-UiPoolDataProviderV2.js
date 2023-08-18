"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const types_1 = require("../../helpers/types");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const constants_1 = require("../../helpers/constants");
(0, config_1.task)(`deploy-${types_1.eContractid.UiPoolDataProviderV2}`, `Deploys the UiPoolDataProviderV2 contract`)
    .addFlag('verify', 'Verify UiPoolDataProviderV2 contract via Etherscan API.')
    .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    if (!localBRE.network.config.chainId) {
        throw new Error('INVALID_CHAIN_ID');
    }
    console.log(`\n- UiPoolDataProviderV2 price aggregator: ${constants_1.chainlinkAggregatorProxy[localBRE.network.name]}`);
    console.log(`\n- UiPoolDataProviderV2 eth/usd price aggregator: ${constants_1.chainlinkAggregatorProxy[localBRE.network.name]}`);
    console.log(`\n- UiPoolDataProviderV2 deployment`);
    const UiPoolDataProviderV2 = await (0, contracts_deployments_1.deployUiPoolDataProviderV2)(constants_1.chainlinkAggregatorProxy[localBRE.network.name], constants_1.chainlinkEthUsdAggregatorProxy[localBRE.network.name], verify);
    console.log('UiPoolDataProviderV2 deployed at:', UiPoolDataProviderV2.address);
    console.log(`\tFinished UiPoolDataProvider deployment`);
});
//# sourceMappingURL=deploy-UiPoolDataProviderV2.js.map