"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const types_1 = require("../../helpers/types");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
(0, config_1.task)(`deploy-${types_1.eContractid.UiIncentiveDataProviderV2V3}`, `Deploys the UiIncentiveDataProviderV2V3 contract`)
    .addFlag('verify', 'Verify UiIncentiveDataProviderV2V3 contract via Etherscan API.')
    .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    if (!localBRE.network.config.chainId) {
        throw new Error('INVALID_CHAIN_ID');
    }
    console.log(`\n- UiIncentiveDataProviderV2V3 deployment`);
    const uiIncentiveDataProviderV2V3 = await (0, contracts_deployments_1.deployUiIncentiveDataProviderV2V3)(verify);
    console.log('UiIncentiveDataProviderV2V3 deployed at:', uiIncentiveDataProviderV2V3.address);
    console.log(`\tFinished UiIncentiveDataProviderV2V3 deployment`);
});
//# sourceMappingURL=deploy-UiIncentiveDataProviderV2V3.js.map