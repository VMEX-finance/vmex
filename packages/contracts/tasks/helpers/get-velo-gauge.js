"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const ethers_1 = require("ethers");
const constants_1 = require("../../helpers/constants");
(0, config_1.task)('get-velo-gauge', 'Gets uniswap data')
    .addFlag("verify", "Verify contracts at Etherscan")
    .addFlag("skipRegistry", "Skip addresses provider registration at Addresses Provider Registry")
    .setAction(async ({ verify, skipRegistry }, DRE) => {
    const fs = require('fs');
    const sugar_abi = fs.readFileSync("./tasks/helpers/sugar_abi.json").toString();
    try {
        const sugar = new ethers_1.ethers.Contract("0x8b70c5e53235abbd1415957f7110fbfe5d0529d4", sugar_abi);
        const provider = new ethers_1.ethers.providers.JsonRpcProvider('http://localhost:8545');
        const dat = await sugar.connect(provider).byAddress("0x0df083de449F75691fc5A36477a6f3284C269108", constants_1.ZERO_ADDRESS);
        console.log(dat);
    }
    catch (err) {
        console.error(err);
    }
});
//# sourceMappingURL=get-velo-gauge.js.map