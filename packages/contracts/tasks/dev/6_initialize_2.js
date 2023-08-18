"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const init_helpers_1 = require("../../helpers/init-helpers");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, config_1.task)('dev:initialize-tranche-2', 'Initialize lending pool configuration.')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    const network = localBRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(configuration_1.ConfigNames.Aave);
    const { ATokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix, ReserveAssets, ReservesConfig, LendingPoolCollateralManager, WethGateway, } = poolConfig;
    const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const lendingPoolConfiguratorProxy = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)(await addressesProvider.getLendingPoolConfigurator());
    const testHelpers = await (0, contracts_getters_1.getAaveProtocolDataProvider)();
    const admin = await localBRE.ethers.getSigner(await addressesProvider.getGlobalAdmin());
    const emergAdmin = await localBRE.ethers.getSigner(await (0, configuration_1.getEmergencyAdmin)(poolConfig));
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
    // Unpause market during deployment
    await (0, misc_utils_1.waitForTx)(await lendingPoolConfiguratorProxy
        .connect(admin)
        .setTranchePause(false, 0));
    // Unpause market during deployment
    await (0, misc_utils_1.waitForTx)(await lendingPoolConfiguratorProxy
        .connect(admin)
        .setTranchePause(false, 1));
});
//# sourceMappingURL=6_initialize_2.js.map