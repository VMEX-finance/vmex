"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenReserveData = void 0;
const contracts_1 = require("@ethersproject/contracts");
const abi_1 = require("@ethersproject/abi");
const constants_1 = require("./constants");
const TokenReserveData_json_1 = __importDefault(require("../artifacts/contracts/analytics/queries/getUserTokenData.sol/TokenReserveData.json"));
async function getTokenReserveData(signer) {
    // const provider = new JsonRpcProvider('http://127.0.0.1:8545');
    // const signer = signer.connect(provider);
    var _a;
    let contractFactory = new contracts_1.ContractFactory(TokenReserveData_json_1.default.abi, TokenReserveData_json_1.default.bytecode);
    let data = await ((_a = signer.provider) === null || _a === void 0 ? void 0 : _a.call({
        data: contractFactory.getDeployTransaction(constants_1.deployments.LendingPoolAddressesProvider.localhost.address, await signer.getAddress()).data
    }));
    const iface = new abi_1.Interface(TokenReserveData_json_1.default.abi);
    const returnData = await iface.decodeFunctionResult("getType", data);
    return returnData['0'];
}
exports.getTokenReserveData = getTokenReserveData;
