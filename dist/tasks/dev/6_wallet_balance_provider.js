"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
(0, config_1.task)('dev:wallet-balance-provider', 'Initialize lending pool configuration.')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    await (0, contracts_deployments_1.deployWalletBalancerProvider)(verify);
});
