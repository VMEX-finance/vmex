"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTokenBalances = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const units_1 = require("@ethersproject/units");
const lodash_1 = __importDefault(require("lodash"));
const UserTokenBalance_json_1 = __importDefault(require("../artifacts/contracts/analytics/UserTokenBalance.sol/UserTokenBalance.json"));
const TrancheReserveData_json_1 = __importDefault(require("../artifacts/contracts/analytics/TrancheReserveData.sol/TrancheReserveData.json"));
const constants_2 = require("./constants");
async function getUserTokenBalances(signer) {
    if (!signer.provider)
        return { response: { balances: null } };
    let contractFactory = new ethers_1.ContractFactory(UserTokenBalance_json_1.default.abi, UserTokenBalance_json_1.default.bytecode);
    let data = await signer.provider.call({ data: contractFactory.getDeployTransaction(await signer.getAddress(), Object.values(constants_2.TOKEN_ADDR_MAINNET)).data });
    let [balances] = await new ethers_1.ethers.utils.AbiCoder().decode(["uint256[]"], data);
    const _balances = balances.map((bal) => (0, units_1.formatUnits)(bal, 18));
    const format_response = lodash_1.default.zipObject(Object.keys(constants_2.TOKEN_ADDR_MAINNET), _balances);
    return { response: { format_response } };
}
exports.getUserTokenBalances = getUserTokenBalances;
async function userTrancheReserveData(signer, tranche) {
    if (!signer.provider)
        return { response: { data: null } };
    let contractFactory = new ethers_1.ContractFactory(TrancheReserveData_json_1.default.abi, TrancheReserveData_json_1.default.bytecode);
    let _data = await signer.provider.call({ data: contractFactory.getDeployTransaction(constants_1.deployments["LendingPool"]["hardhat"]["address"], tranche).data });
    const [address, tData, categoryNames] = await new ethers_1.ethers.utils.AbiCoder().decode(["string[20]", "uint128[7][]", "string[7]"], _data);
    const labeledData = lodash_1.default.map(tData, (d) => {
        return lodash_1.default.zipObject(categoryNames, d);
    });
    return {
        response: {
            data: lodash_1.default.zipObject(address, labeledData)
        }
    };
}
async function tokenTrancheData() {
}
