"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
const make_suite_1 = require("../test-suites/test-aave/helpers/make-suite");
const misc_utils_1 = require("../helpers/misc-utils");
const types_1 = require("../helpers/types");
const constants_1 = require("../helpers/constants");
const aave_1 = require("../markets/aave");
const contracts_helpers_1 = require("../helpers/contracts-helpers");
const contracts_getters_1 = require("../helpers/contracts-getters");
const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json");
(0, make_suite_1.makeSuite)("General testing of tokens", () => {
    const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW, VL_BORROWING_NOT_ENABLED } = types_1.ProtocolErrors;
    const fs = require('fs');
    const contractGetters = require('../helpers/contracts-getters.ts');
    // const lendingPool = await contractGetters.getLendingPool();
    // Load the first signer
    it("Testing if symbol was set correctly", async () => {
        const tokens = await (0, contracts_helpers_1.getParamPerNetwork)(aave_1.AaveConfig.ReserveAssets, types_1.eEthereumNetwork.main);
        const config = aave_1.AaveConfig.ReservesConfig;
        const WETHConfig = config["WETH"];
        if (!tokens || !WETHConfig) {
            return;
        }
        var dataProv = await contractGetters.getAaveProtocolDataProvider();
        var signer = await contractGetters.getFirstSigner();
        const addProv = await contractGetters.getLendingPoolAddressesProvider();
        const oracleAdd = await addProv.connect(signer).getPriceOracle();
        const oracle = new misc_utils_1.DRE.ethers.Contract(oracleAdd, oracleAbi.abi);
        const lendingPool = await contractGetters.getLendingPool();
        for (let [symbol, address] of Object.entries(tokens)) {
            console.log("Testing ", symbol);
            const dat = await lendingPool.getReserveData(address, 1);
            const addr = dat.aTokenAddress;
            console.log("address of atoken is ", addr);
            if (addr && addr != constants_1.ZERO_ADDRESS) {
                const tok = await (0, contracts_getters_1.getAToken)(addr);
                console.log("aToken symbol: ", await tok.symbol());
            }
            console.log("-----------------------------------");
            console.log();
            console.log();
            console.log();
        }
    });
});
//# sourceMappingURL=test-symbol.spec.js.map