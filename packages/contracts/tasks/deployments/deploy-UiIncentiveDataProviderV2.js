"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const types_1 = require("../../helpers/types");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
(0, config_1.task)(`deploy-${types_1.eContractid.UiIncentiveDataProviderV2}`, `Deploys the UiIncentiveDataProviderV2 contract`)
    .addFlag('verify', 'Verify UiIncentiveDataProviderV2 contract via Etherscan API.')
    .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    if (!localBRE.network.config.chainId) {
        throw new Error('INVALID_CHAIN_ID');
    }
    console.log(`\n- UiIncentiveDataProviderV2 deployment`);
    const UiIncentiveDataProviderV2 = await (0, contracts_deployments_1.deployUiIncentiveDataProviderV2)(verify);
    console.log('UiIncentiveDataProviderV2 deployed at:', UiIncentiveDataProviderV2.address);
    console.log(`\tFinished UiIncentiveDataProviderV2 deployment`);
});
//# sourceMappingURL=deploy-UiIncentiveDataProviderV2.js.map