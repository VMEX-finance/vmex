"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../dist/src.ts/constants");
const getUserTrancheData_json_1 = __importDefault(require("../artifacts/contracts/analytics/queries/getUserTrancheData.sol/getUserTrancheData.json"));
const WalletBalanceProvider_json_1 = __importDefault(require("../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json"));
const hardhat_1 = __importDefault(require("hardhat"));
const { ethers } = hardhat_1.default;
const lodash_1 = __importDefault(require("lodash"));
async function checkWETHBalance(signer, address, provider) {
    console.log(signer);
    const BalanceProvider = new ethers.Contract(constants_1.deployments.WalletBalanceProvider.localhost.address, WalletBalanceProvider_json_1.default.abi, signerw);
    const balances = await BalanceProvider.getUserWalletBalances(constants_1.deployments.LendingPoolAddressesProvider.hardhat.address, address);
    console.log(balances);
}
(async () => {
    const [signer] = await ethers.getSigners();
    const address = await signer.getAddress();
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    await checkWETHBalance(signer, address, provider);
    let contractFactory = new ethers.ContractFactory(getUserTrancheData_json_1.default.abi, getUserTrancheData_json_1.default.bytecode);
    let data = await provider.call({
        data: contractFactory.getDeployTransaction(address, constants_1.deployments.LendingPoolAddressesProvider.hardhat.address).data
    });
    let iface = new ethers.utils.Interface(getUserTrancheData_json_1.default.abi);
    let _data = await iface.decodeFunctionResult("getType", data);
    console.log(lodash_1.default.uniq(_data['0']));
})();
//# sourceMappingURL=test_getUserTrancheData.js.map