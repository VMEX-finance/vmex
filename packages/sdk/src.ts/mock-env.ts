import { ethers } from "ethers";

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
const UNISWAP_ROUTER_ABI = [
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
]
const USDCadd = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";


export async function startMockEnvironment(signer: ethers.Signer) {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const owner = provider.getSigner();

    // send 10 ETH to the connected wallet address
    let tx = {
        to: await signer.getAddress(),
        value: ethers.utils.parseEther("100.0")
    };
    await owner.sendTransaction(tx);

    // transfer 9 WETH to the connected wallet address
    const WETH = new ethers.Contract(WETHadd, WETHabi, owner);
    await WETH.connect(owner).deposit({value: ethers.utils.parseEther("100.0")});
    await WETH.transfer(await signer.getAddress(), ethers.utils.parseEther("50.0"));

    // transfer USDC to the connected wallet address
    var path = [WETHadd, USDCadd];
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const USDC = new ethers.Contract(USDCadd, WETHabi, owner);
    const UNISWAP = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, owner);
    await UNISWAP.swapExactETHForTokens(1, path, await signer.getAddress(), deadline, { value: ethers.utils.parseEther("10")});

}