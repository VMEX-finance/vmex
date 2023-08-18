"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../dist/src.ts/constants");
const getTokenReserveData_json_1 = __importDefault(require("../artifacts/contracts/analytics/queries/getTokenReserveData.sol/getTokenReserveData.json"));
const hardhat_1 = __importDefault(require("hardhat"));
const { ethers } = hardhat_1.default;
const lodash_1 = __importDefault(require("lodash"));
(async () => {
    const [signer] = await ethers.getSigners();
    const address = await signer.getAddress();
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    let contractFactory = new ethers.ContractFactory(getTokenReserveData_json_1.default.abi, getTokenReserveData_json_1.default.bytecode);
    let data = await provider.call({
        data: contractFactory.getDeployTransaction(constants_1.deployments.LendingPoolAddressesProvider.hardhat.address, 0).data
    });
    // const _data = await new ethers.utils.AbiCoder().decode(["string[22]"], data)
    const _iface = new ethers.utils.Interface(getTokenReserveData_json_1.default.abi);
    let _data = await _iface.decodeFunctionResult("getType", data);
    console.log(lodash_1.default.uniq(_data['0']));
})();
//# sourceMappingURL=test_imports.js.map