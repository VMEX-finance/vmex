"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const configuration_1 = require("../../helpers/configuration");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const misc_utils_1 = require("../../helpers/misc-utils");
const init_helpers_1 = require("../../helpers/init-helpers");
const process_1 = require("process");
const contracts_getters_2 = require("../../helpers/contracts-getters");
const constants_1 = require("../../helpers/constants");
(0, config_1.task)("full:initialize-lending-pool", "Initialize lending pool configuration.")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, DRE) => {
    try {
        await DRE.run("set-DRE");
        const network = DRE.network.name;
        // console.log("localBRE: ",localBRE);
        console.log("network: ", network); //network is hardhat even when running mainnet
        const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
        const { ATokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix, ReserveAssets, ReservesConfig, LendingPoolCollateralManager, WethGateway, IncentivesController, } = poolConfig;
        const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
        const incentivesController = await (0, contracts_helpers_1.getParamPerNetwork)(IncentivesController, network);
        const addressesProvider = await (0, contracts_getters_2.getLendingPoolAddressesProvider)();
        const testHelpers = await (0, contracts_getters_2.getAaveProtocolDataProvider)();
        const admin = await addressesProvider.getPoolAdmin();
        const oracle = await addressesProvider.getPriceOracle();
        if (!reserveAssets) {
            throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
        }
        const treasuryAddress = await (0, configuration_1.getTreasuryAddress)(poolConfig);
        await (0, init_helpers_1.initReservesByHelper)(ReservesConfig, reserveAssets, ATokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix, admin, treasuryAddress, incentivesController, pool, verify);
        await (0, init_helpers_1.configureReservesByHelper)(ReservesConfig, reserveAssets, testHelpers, admin);
        let collateralManagerAddress = await (0, contracts_helpers_1.getParamPerNetwork)(LendingPoolCollateralManager, network);
        if (!(0, misc_utils_1.notFalsyOrZeroAddress)(collateralManagerAddress)) {
            const collateralManager = await (0, contracts_deployments_1.deployLendingPoolCollateralManager)(verify);
            collateralManagerAddress = collateralManager.address;
        }
        // Seems unnecessary to register the collateral manager in the JSON db
        console.log("\tSetting lending pool collateral manager implementation with address", collateralManagerAddress);
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setLendingPoolCollateralManager(collateralManagerAddress));
        console.log("\tSetting AaveProtocolDataProvider at AddressesProvider at id: 0x01", collateralManagerAddress);
        const aaveProtocolDataProvider = await (0, contracts_getters_2.getAaveProtocolDataProvider)();
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setAddress("0x0100000000000000000000000000000000000000000000000000000000000000", aaveProtocolDataProvider.address));
        const walletBalancerProvider = await (0, contracts_deployments_1.deployWalletBalancerProvider)(verify);
        console.log("WalletBalancerProvider deployed at:", walletBalancerProvider.address);
        const uiPoolDataProvider = await (0, contracts_deployments_1.deployUiPoolDataProviderV2)(constants_1.chainlinkAggregatorProxy[network], constants_1.chainlinkEthUsdAggregatorProxy[network], verify);
        console.log("UiPoolDataProvider deployed at:", uiPoolDataProvider.address);
        const lendingPoolAddress = await addressesProvider.getLendingPool();
        let gateWay = (0, contracts_helpers_1.getParamPerNetwork)(WethGateway, network);
        if (!(0, misc_utils_1.notFalsyOrZeroAddress)(gateWay)) {
            gateWay = (await (0, contracts_getters_1.getWETHGateway)()).address;
        }
        console.log("GATEWAY", gateWay);
        await (0, contracts_deployments_1.authorizeWETHGateway)(gateWay, lendingPoolAddress);
    }
    catch (err) {
        console.error(err);
        (0, process_1.exit)(1);
    }
});
