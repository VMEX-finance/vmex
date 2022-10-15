"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = __importDefault(require("ethers"));
const WETHadd = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WETHabi = [
    "function allowance(address owner, address spender) external view returns (uint256 remaining)",
    "function approve(address spender, uint256 value) external returns (bool success)",
    "function balanceOf(address owner) external view returns (uint256 balance)",
    "function decimals() external view returns (uint8 decimalPlaces)",
    "function name() external view returns (string memory tokenName)",
    "function symbol() external view returns (string memory tokenSymbol)",
    "function totalSupply() external view returns (uint256 totalTokensIssued)",
    "function transfer(address to, uint256 value) external returns (bool success)",
    "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
    "function deposit() public payable",
    "function withdraw(uint wad) public"
];
async function startMockRuntime(signer) {
    try {
        let provider = new ethers_1.default.providers.JsonRpcProvider("http://127.0.0.1:8545");
        await provider.send("hardhat_setBalance", [
            await signer.getAddress(),
            ethers_1.default.utils.hexValue(ethers_1.default.constants.MaxUint256)
        ]);
        // adding user funds 
        const WETHContract = new ethers_1.default.Contract(WETHadd, WETHabi, signer);
        WETHContract.deposit({ value: ethers_1.default.utils.parseEther("100.0"), gasLimit: "8000000" });
    }
    catch (error) {
        console.error(error);
    }
}
exports.default = startMockRuntime;
//# sourceMappingURL=index.js.map