"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMockEnvironment = void 0;
const ethers_1 = require("ethers");
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
const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_ROUTER_ABI = require("@vmex/contracts/localhost_tests/abis/uniswapAbi.json");
const USDCadd = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
async function startMockEnvironment(signer) {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const owner = provider.getSigner();
    // send 10 ETH to the connected wallet address
    let tx = {
        to: await signer.getAddress(),
        value: ethers_1.ethers.utils.parseEther("100.0")
    };
    await owner.sendTransaction(tx);
    // transfer 9 WETH to the connected wallet address
    const WETH = new ethers_1.ethers.Contract(WETHadd, WETHabi, owner);
    await WETH.connect(owner).deposit({ value: ethers_1.ethers.utils.parseEther("100.0") });
    await WETH.transfer(await signer.getAddress(), ethers_1.ethers.utils.parseEther("50.0"));
    // transfer USDC to the connected wallet address
    var path = [WETHadd, USDCadd];
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const USDC = new ethers_1.ethers.Contract(USDCadd, WETHabi, owner);
    const UNISWAP = new ethers_1.ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, owner);
    await UNISWAP.swapExactETHForTokens(1, path, await signer.getAddress(), deadline, { value: ethers_1.ethers.utils.parseEther("10") });
}
exports.startMockEnvironment = startMockEnvironment;
//# sourceMappingURL=mock-env.js.map