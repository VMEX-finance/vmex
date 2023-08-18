"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TokenReserveData_json_1 = __importDefault(require("../artifacts/contracts/analytics/queries/getUserTokenData.sol/TokenReserveData.json"));
const deployed_contracts_json_1 = __importDefault(require("../deployed-contracts.json"));
const hardhat_1 = __importDefault(require("hardhat"));
const { ethers, network } = hardhat_1.default;
(async () => {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const [signer] = await ethers.getSigners();
    const address = await signer.getAddress();
    const contractFactory = new ethers.ContractFactory(TokenReserveData_json_1.default.abi, TokenReserveData_json_1.default.bytecode);
    let data = await provider.call({
        data: contractFactory.getDeployTransaction(deployed_contracts_json_1.default.LendingPoolAddressesProvider.localhost.address, address).data
    });
    const iface = new ethers.utils.Interface(TokenReserveData_json_1.default.abi);
    let _data = await iface.decodeFunctionResult("getType", data);
    console.log(_data['0']);
})();
//# sourceMappingURL=test_userAccountBalances.js.map