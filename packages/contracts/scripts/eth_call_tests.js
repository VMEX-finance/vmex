"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const QueryTrancheTVL_json_1 = require("../artifacts/contracts/analytics-utilities/QueryLendingPoolTVL.sol/QueryTrancheTVL.json");
const hardhat_1 = __importDefault(require("hardhat"));
const deployed_contracts_json_1 = __importDefault(require("../deployed-contracts.json"));
const { ethers, artifacts } = hardhat_1.default;
(async () => {
    const provider = new s.JsonRpcProvider("http://127.0.0.1:8545");
    const [signer] = await ethers.getSigners();
    const _provider = deployed_contracts_json_1.default.LendingPoolAddressesProvider.localhost.address;
    const _aaveDataProvider = deployed_contracts_json_1.default.AaveProtocolDataProvider.localhost.address;
    let contractFactory = new ethers.ContractFactory(QueryTrancheTVL_json_1.abi, QueryTrancheTVL_json_1.bytecode);
    let data = await provider.call({
        data: contractFactory.getDeployTransaction(_provider, _aaveDataProvider).data
    });
    let iface = new ethers.utils.Interface(QueryTrancheTVL_json_1.abi);
    let _data = await iface.decodeFunctionResult("getType", data);
    console.log(_data);
})();
//# sourceMappingURL=eth_call_tests.js.map