"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const process_1 = require("process");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, config_1.task)("full:initialize-lending-pool", "Initialize lending pool tranche 0 configuration.")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, DRE) => {
    try {
        await DRE.run("set-DRE");
        const network = DRE.network.name;
        const poolConfig = (0, configuration_1.loadPoolConfig)(pool); //await loadCustomAavePoolConfig("0"); //this is only for mainnet
        const { LendingPoolCollateralManager, WethGateway, } = poolConfig;
        const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
        // const incentivesController = await getParamPerNetwork(
        //   IncentivesController,
        //   network
        // );
        // if(incentivesController && notFalsyOrZeroAddress(incentivesController)){
        //   console.log("trying to set incentives controller (needs to be the implementation contract)")
        //   await addressesProvider.setIncentivesController(incentivesController);
        // }
        // const oracle = await addressesProvider.getPriceOracle();
        // if (!reserveAssets) {
        //   throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
        // }
        let collateralManagerAddress = await (0, contracts_helpers_1.getParamPerNetwork)(LendingPoolCollateralManager, network);
        if (!(0, misc_utils_1.notFalsyOrZeroAddress)(collateralManagerAddress)) {
            const collateralManager = await (0, contracts_deployments_1.deployLendingPoolCollateralManager)(verify);
            collateralManagerAddress = collateralManager.address;
        }
        // Seems unnecessary to register the collateral manager in the JSON db
        console.log("\tSetting lending pool collateral manager implementation with address", collateralManagerAddress);
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setLendingPoolCollateralManager(collateralManagerAddress || ""));
        console.log("\tSetting AaveProtocolDataProvider at AddressesProvider at id: 0x01", collateralManagerAddress);
        const aaveProtocolDataProvider = await (0, contracts_getters_1.getAaveProtocolDataProvider)();
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setAddress("0x0100000000000000000000000000000000000000000000000000000000000000", aaveProtocolDataProvider.address));
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
//# sourceMappingURL=6-initialize.js.map