"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTokenBalances = void 0;
const ethers_1 = require("ethers");
const UserTokenBalance_json_1 = __importDefault(require("../artifacts/contracts/analytics/UserTokenBalance.sol/UserTokenBalance.json"));
const constants_1 = require("./constants");
async function getUserTokenBalances(signer) {
    if (!signer.provider)
        return { response: { balances: null } };
    let contractFactory = new ethers_1.ContractFactory(UserTokenBalance_json_1.default.abi, UserTokenBalance_json_1.default.bytecode);
    let data = await signer.provider.call({ data: contractFactory.getDeployTransaction(await signer.getAddress(), Object.values(constants_1.TOKEN_ADDR_MAINNET)).data });
    let [balances] = await new ethers_1.ethers.utils.AbiCoder().decode(["uint256[]"], data);
    return { response: { balances } };
}
exports.getUserTokenBalances = getUserTokenBalances;
async function userTrancheData() {
}
async function tokenTrancheData() {
}
