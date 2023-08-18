"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const configuration_1 = require("../../helpers/configuration");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
(0, config_1.task)(`full-beginStaking`, `setup staking and begin staking for tranche 0`)
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .addFlag("verify", "Verify contracts at Etherscan")
    // .addParam("vaultOfRewards", "The address of the vault of rewards")
    .setAction(async ({ verify, pool }, DRE) => {
    await DRE.run("set-DRE");
    if (!DRE.network.config.chainId) {
        throw new Error('INVALID_CHAIN_ID');
    }
    const network = DRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const { ExternalStakingContracts, ReserveAssets } = poolConfig;
    const stakingContracts = await (0, contracts_helpers_1.getParamPerNetwork)(ExternalStakingContracts, network);
    const tokens = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
    if (!stakingContracts || !tokens) {
        throw "staking contracts not set";
    }
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const admin = await addressesProvider.getGlobalAdmin();
    const incentivesController = await (0, contracts_getters_1.getIncentivesControllerProxy)();
    var signer = await (0, contracts_getters_1.getFirstSigner)();
    const lendingPool = await (0, contracts_getters_1.getLendingPool)();
    console.log("Current incentives controller", await addressesProvider.getIncentivesController());
    // await addressesProvider.setIncentivesController(incentivesController.address);
    // console.log("New incentives controller", await addressesProvider.getIncentivesController());
    await incentivesController.setStakingType(Object.values(stakingContracts).map((el) => el.address), Object.values(stakingContracts).map((el) => el.type));
    console.log("finished setting staking type");
    for (let [symbol, externalRewardsData] of Object.entries(stakingContracts)) {
        console.log("attempting setting rewards for", symbol);
        const token = await lendingPool.getReserveData(tokens[symbol], 0);
        await incentivesController.beginStakingReward(token.aTokenAddress, externalRewardsData.address);
    }
});
//# sourceMappingURL=7-beginStaking.js.map