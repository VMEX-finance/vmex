"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserLendingPoolFeed_json_1 = __importDefault(require("../artifacts/contracts/analytics/UserLendingPoolFeed.sol/UserLendingPoolFeed.json"));
const hardhat_1 = __importDefault(require("hardhat"));
const { ethers } = hardhat_1.default;
(async () => {
    const [signer] = await ethers.getSigners();
    const _address = await signer.getAddress();
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    let contractFactory = new ethers.ContractFactory(UserLendingPoolFeed_json_1.default.abi, UserLendingPoolFeed_json_1.default.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction(_address, "0xda24DebbEcECe2270a5Ff889AEfC71Dcf4B8A3D5").data });
    const [address] = await new ethers.utils.AbiCoder().decode(["uint256[6][]"], data);
    console.log(address);
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=test_userLendingPoolFeed.js.map