"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TrancheReserveData_json_1 = __importDefault(require("../artifacts/contracts/analytics/TrancheReserveData.sol/TrancheReserveData.json"));
const constants_1 = require("../dist/src.ts/constants");
const hardhat_1 = __importDefault(require("hardhat"));
const { ethers } = hardhat_1.default;
const lodash_1 = __importDefault(require("lodash"));
(async () => {
    // const provider = new ethers.providers.InfuraProvider("mainnet", "ca0da016dedf4c5a9ee90bfdbafee233");
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    let contractFactory = new ethers.ContractFactory(TrancheReserveData_json_1.default.abi, TrancheReserveData_json_1.default.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction(constants_1.deployments['LendingPool']["hardhat"]["address"], 1).data });
    const [address, tData, categoryNames] = await new ethers.utils.AbiCoder().decode(["string[20]", "uint128[7][]", "string[7]"], data);
    let labeledData = lodash_1.default.map(tData, (d) => {
        return lodash_1.default.zipObject(categoryNames, d);
    });
    console.log(labeledData);
    console.log(lodash_1.default.zipObject(address, labeledData));
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=test-TrancheReserveData.js.map