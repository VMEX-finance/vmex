"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const configuration_1 = require("../../helpers/configuration");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const CONTRACT_NAME = 'IncentivesController';
(0, config_1.task)(`full-deploy-${CONTRACT_NAME}`, `Deploy and initialize ${CONTRACT_NAME}`)
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .addFlag("verify", "Verify contracts at Etherscan")
    // .addParam("vaultOfRewards", "The address of the vault of rewards")
    .setAction(async ({ verify, pool }, DRE) => {
    await DRE.run("set-DRE");
    if (!DRE.network.config.chainId) {
        throw new Error('INVALID_CHAIN_ID');
    }
    console.log(`\n- ${CONTRACT_NAME} deployment`);
    const network = DRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const { VMEXRewardsVault } = poolConfig;
    const vaultOfRewards = (0, contracts_helpers_1.getParamPerNetwork)(VMEXRewardsVault, network);
    if (!vaultOfRewards)
        throw "vault of rewards not set";
    const vmexIncentivesProxy = await (0, contracts_deployments_1.setupVmexIncentives)(vaultOfRewards, // the vault of rewards is the same as the emissions manager which is the same as the global admin
    verify);
    // await addressesProvider.setIncentivesController(vmexIncentivesProxy.address);
    console.log(`Finished deployment, ${CONTRACT_NAME}.address`, vmexIncentivesProxy.address);
});
//# sourceMappingURL=5.5-incentivesController.js.map