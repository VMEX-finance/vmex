"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, config_1.task)('print-config:fork', 'Deploy development enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, DRE) => {
    await DRE.run('set-DRE');
    await DRE.run('aave:mainnet');
    const dataProvider = await (0, contracts_getters_1.getAaveProtocolDataProvider)();
    await DRE.run('print-config', { dataProvider: dataProvider.address, pool: 'Aave' });
});
