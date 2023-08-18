"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const UserTokenBalance_json_1 = __importDefault(require("../artifacts/contracts/analytics/UserTokenBalance.sol/UserTokenBalance.json"));
const { ethers } = hardhat_1.default;
const lodash_1 = __importDefault(require("lodash"));
(async () => {
    const provider = new ethers.providers.InfuraProvider("mainnet", "ca0da016dedf4c5a9ee90bfdbafee233");
    const _wallet = "0x72A53cDBBcc1b9efa39c834A540550e23463AAcB";
    console.log(`Testing user balances for wallet ${_wallet}`);
    let contractFactory = new ethers.ContractFactory(UserTokenBalance_json_1.default.abi, UserTokenBalance_json_1.default.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction(_wallet).data });
    let [balances, names] = await new ethers.utils.AbiCoder().decode(["uint256[]", "string[20]"], data);
    const _balances = lodash_1.default.zipObject(names, balances.map((bal) => ethers.utils.formatUnits(bal, 18)));
    console.log(_balances);
})().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=test-userBalance.js.map