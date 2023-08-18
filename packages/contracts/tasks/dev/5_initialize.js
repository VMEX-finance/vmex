"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const init_helpers_1 = require("../../helpers/init-helpers");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, config_1.task)('dev:initialize-lending-pool', 'Initialize lending pool configuration.')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');
    const network = localBRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(configuration_1.ConfigNames.Aave); //await loadCustomAavePoolConfig("0"); //this is only for mainnet
    const { ATokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix, ReserveAssets, ReservesConfig, LendingPoolCollateralManager, WethGateway, } = poolConfig;
    const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const lendingPoolConfiguratorProxy = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)(await addressesProvider.getLendingPoolConfigurator());
    const admin = await localBRE.ethers.getSigner(await addressesProvider.getGlobalAdmin());
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
});
//# sourceMappingURL=5_initialize.js.map