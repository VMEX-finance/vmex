"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const process_1 = require("process");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, config_1.task)('full:data-provider', 'Initialize lending pool configuration.')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, localBRE) => {
    try {
        await localBRE.run('set-DRE');
        const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
        await (0, contracts_deployments_1.deployAaveProtocolDataProvider)(addressesProvider.address, verify);
    }
    catch (err) {
        console.error(err);
        (0, process_1.exit)(1);
    }
});
