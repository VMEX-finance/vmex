"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const init_helpers_1 = require("../../helpers/init-helpers");
const process_1 = require("process");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, config_1.task)("full:initialize-lending-pool-tranches-0", "Initialize lending pool tranche 1 configuration.")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, DRE) => {
    try {
        await DRE.run("set-DRE");
        const network = DRE.network.name;
        const poolConfig = (0, configuration_1.loadPoolConfig)(pool); //await loadCustomAavePoolConfig("0"); //this is only for mainnet
        const { ReserveAssets, } = poolConfig;
        const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
        const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
        const lendingPoolConfiguratorProxy = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)(await addressesProvider.getLendingPoolConfigurator());
        const admin = await DRE.ethers.getSigner(await addressesProvider.getGlobalAdmin());
        // const oracle = await addressesProvider.getPriceOracle();
        if (!reserveAssets) {
            throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
        }
        const treasuryAddress = admin.address;
        console.log("before initReservesByHelper");
        await (0, init_helpers_1.claimTrancheId)("Vmex tranche 0", admin);
        // Pause market during deployment
        await (0, misc_utils_1.waitForTx)(await lendingPoolConfiguratorProxy.connect(admin).setTranchePause(true, 0));
        let [assets0, reserveFactors0, canBorrow0, canBeCollateral0] = (0, init_helpers_1.getTranche0MockedData)(reserveAssets);
        await (0, init_helpers_1.initReservesByHelper)(assets0, reserveFactors0, canBorrow0, canBeCollateral0, admin, treasuryAddress, 0);
        // Unpause market during deployment
        await (0, misc_utils_1.waitForTx)(await lendingPoolConfiguratorProxy
            .connect(admin)
            .setTranchePause(false, 0));
    }
    catch (err) {
        console.error(err);
        (0, process_1.exit)(1);
    }
});
//# sourceMappingURL=6.1-initializeTranches.js.map