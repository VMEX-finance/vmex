"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const BatchPriceFeed_json_1 = __importDefault(require("../artifacts/contracts/misc/BatchPriceFeed.sol/BatchPriceFeed.json"));
const providers_1 = require("@ethersproject/providers");
const contracts_1 = require("@ethersproject/contracts");
const units_1 = require("@ethersproject/units");
const abi_1 = require("@ethersproject/abi");
async function getTokenPrices() {
    const provider = new providers_1.InfuraProvider("mainnet", "ca0da016dedf4c5a9ee90bfdbafee233");
    let contractFactory = new contracts_1.ContractFactory(BatchPriceFeed_json_1.default.abi, BatchPriceFeed_json_1.default.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction().data });
    let decoded_data = await new abi_1.AbiCoder().decode(new Array(21).fill('int256'), data);
    let keys = Object.keys(constants_1.TOKEN);
    let return_type = decoded_data.map((k, i) => {
        let key = keys[i];
        return [key, (0, units_1.formatUnits)(k, constants_1.TOKEN[`${key}`].decimals)];
    });
    let vals = Object.fromEntries(return_type);
    let returnType = _.mapValues(vals, (o) => { return o * vals.USD; });
    returnType.USD = Number(vals.USD);
    return returnType;
}
