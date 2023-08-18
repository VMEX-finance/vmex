"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const init_helpers_1 = require("../../helpers/init-helpers");
const process_1 = require("process");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, config_1.task)("full:initialize-lending-pool-tranches-1", "Initialize lending pool tranche 1 configuration.")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, DRE) => {
    try {
        await DRE.run("set-DRE");
        const network = DRE.network.name;
        const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
        const { ATokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix, ReserveAssets, ReservesConfig, LendingPoolCollateralManager, WethGateway, } = poolConfig;
        const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
        const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
        const lendingPoolConfiguratorProxy = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)(await addressesProvider.getLendingPoolConfigurator());
        const testHelpers = await (0, contracts_getters_1.getAaveProtocolDataProvider)();
        const admin = await DRE.ethers.getSigner(await addressesProvider.getGlobalAdmin());
        const emergAdmin = await DRE.ethers.getSigner(await (0, configuration_1.getEmergencyAdmin)(poolConfig));
        // const oracle = await addressesProvider.getPriceOracle();
        if (!reserveAssets) {
            throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
        }
        const treasuryAddress = emergAdmin.address;
        console.log("before initReservesByHelper");
        await (0, init_helpers_1.claimTrancheId)("Vmex tranche 1", emergAdmin);
        // Pause market during deployment
        await (0, misc_utils_1.waitForTx)(await lendingPoolConfiguratorProxy
            .connect(admin)
            .setTranchePause(true, 1));
        let [assets0, reserveFactors0, canBorrow0, canBeCollateral0] = (0, init_helpers_1.getTranche1MockedData)(reserveAssets);
        await (0, init_helpers_1.initReservesByHelper)(assets0, reserveFactors0, canBorrow0, canBeCollateral0, emergAdmin, treasuryAddress, 1);
        //don't deploy strategies if using yearn
        // const tranche = 1;
        // console.log("Attempt deploy Strategies: ");
        // console.log("  - Tricrypto");
        // // admin grants strategy access to all funds
        // await waitForTx(
        //   await lendingPoolConfiguratorProxy
        //     .connect(emergAdmin)
        //     .addStrategy(
        //       reserveAssets["Tricrypto2"],
        //       tranche,
        //       "0" //default
        //     )
        // );
        // console.log("  - ThreePool");
        // // admin grants strategy access to all funds
        // await waitForTx(
        //   await lendingPoolConfiguratorProxy
        //     .connect(emergAdmin)
        //     .addStrategy(
        //       reserveAssets["ThreePool"],
        //       tranche,
        //       "0" //default
        //     )
        // );
        // console.log("  - StethEth");
        // // admin grants strategy access to all funds
        // await waitForTx(
        //   await lendingPoolConfiguratorProxy
        //     .connect(emergAdmin)
        //     .addStrategy(
        //       reserveAssets["StethEth"],
        //       tranche,
        //       "0" //default
        //     )
        // );
        // console.log("  - FraxUSDC");
        // // admin grants strategy access to all funds
        // await waitForTx(
        //   await lendingPoolConfiguratorProxy
        //     .connect(emergAdmin)
        //     .addStrategy(
        //       reserveAssets["FraxUSDC"],
        //       tranche,
        //       "0" //default
        //     )
        // );
        // console.log("  - Frax3Crv");
        // // admin grants strategy access to all funds
        // await waitForTx(
        //   await lendingPoolConfiguratorProxy
        //     .connect(emergAdmin)
        //     .addStrategy(
        //       reserveAssets["Frax3Crv"],
        //       tranche,
        //       "0" //default
        //     )
        // );
        // console.log("  - CVX");
        // // admin grants strategy access to all funds
        // await waitForTx(
        //   await lendingPoolConfiguratorProxy
        //     .connect(emergAdmin)
        //     .addStrategy(
        //       reserveAssets["CVX"],
        //       tranche,
        //       "0" //default
        //     )
        // );
        // console.log("Finished deploying strategy in tranche 1");
        // Unpause market during deployment
        await (0, misc_utils_1.waitForTx)(await lendingPoolConfiguratorProxy
            .connect(admin)
            .setTranchePause(false, 1));
    }
    catch (err) {
        console.error(err);
        (0, process_1.exit)(1);
    }
});
//# sourceMappingURL=6.2-initializeTranches.js.map