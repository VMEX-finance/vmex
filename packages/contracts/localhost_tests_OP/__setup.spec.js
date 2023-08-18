"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const chai = require("chai");
const { expect } = chai;
const misc_utils_1 = require("../helpers/misc-utils");
const optimism_1 = require("../markets/optimism");
const contracts_helpers_1 = require("../helpers/contracts-helpers");
const contracts_getters_1 = require("../helpers/contracts-getters");
const contractGetters = require('../helpers/contracts-getters.ts');
const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json");
before(async () => {
    await hardhat_1.default.run("set-DRE");
    console.log("\n***************");
    console.log("DRE finished");
    console.log("***************\n");
});
before("set heartbeat higher", async () => {
    var signer = await contractGetters.getFirstSigner();
    const addProv = await contractGetters.getLendingPoolAddressesProvider();
    const oracleAdd = await addProv.connect(signer).getPriceOracle();
    const oracle = new misc_utils_1.DRE.ethers.Contract(oracleAdd, oracleAbi.abi);
    const network = "optimism";
    const { ProtocolGlobalParams: { UsdAddress }, ReserveAssets, ChainlinkAggregator, SequencerUptimeFeed, ProviderId } = optimism_1.OptimismConfig;
    const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
    const chainlinkAggregators = await (0, contracts_helpers_1.getParamPerNetwork)(ChainlinkAggregator, network);
    let tokensToWatch = {
        ...reserveAssets,
        USD: UsdAddress,
    };
    if (!chainlinkAggregators) {
        throw "chainlinkAggregators is undefined. Check configuration at config directory";
    }
    const [tokens2, aggregators] = (0, contracts_getters_1.getPairsTokenAggregator)(tokensToWatch, chainlinkAggregators, optimism_1.OptimismConfig.OracleQuoteCurrency);
    const ag2 = aggregators.map((el) => {
        return {
            feed: el.feed,
            heartbeat: 86400000
        };
    });
    await oracle.connect(signer).setAssetSources(tokens2, ag2);
});
//# sourceMappingURL=__setup.spec.js.map