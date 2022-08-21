// scripts/index.js
async function main () {
    // Our code will go here

    // Load the HRE into helpers to access signers
    await run("set-DRE")

    // Import getters to instance any Aave contract
    const contractGetters = require('./helpers/contracts-getters');


// Load the first signer
var signer = await contractGetters.getFirstSigner();

// Lending pool instance
const lendingPool = await contractGetters.getLendingPool();

// ERC20 token DAI Mainnet instance
const DAI = await contractGetters.getIErc20Detailed("0x6B175474E89094C44Da98b954EedeAC495271d0F");

var emergency = (await ethers.getSigners())[1]

const lendingPoolConfig = await contractGetters.getLendingPoolConfiguratorProxy()

await lendingPoolConfig.connect(emergency).setPoolPause(false)

// await lendingPool.connect(signer).deposit(DAI.address, 0, true, ethers.utils.parseUnits('100'), await signer.getAddress(), '0'); //revert since no DAI

const { ethers, waffle} = require("hardhat"); //gets waffle provider

const provider = waffle.provider;

await provider.getBalance(signer.address) //gets the ETH balance of signer

await DAI.balanceOf(signer.address) //gets the DAI balance of signer


// 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
//try uniswap

const WETHadd = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
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

const myWETH = new ethers.Contract(WETHadd,WETHabi)

var options = {value: ethers.utils.parseEther("1.0")}

await myWETH.connect(signer).deposit(options);
await myWETH.connect(signer).balanceOf(signer.address);
await myWETH.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("1.0"))

await lendingPool.connect(signer).deposit(myWETH.address, 1, true, ethers.utils.parseUnits('0.5'), await signer.getAddress(), '0'); 


// testing curve lp tokens
var options2 = {value: ethers.utils.parseEther("1.0"), gasLimit: 8000000}
const triCryptoDepositAdd = "0x3993d34e7e99Abf6B6f367309975d1360222D446"
const triCryptoDepositAbi = [
    "function add_liquidity(uint256[] _amounts,uint256 _min_mint_amount, address _receiver) external payable returns (uint256)"
]

const triCryptoDeposit = new ethers.Contract(triCryptoDepositAdd,triCryptoDepositAbi)

var amounts = [ethers.utils.parseEther("0"),ethers.utils.parseEther("0"),ethers.utils.parseEther("1.0")]

await myWETH.connect(signer).approve(triCryptoDeposit.address,ethers.utils.parseEther("1.0"))
await triCryptoDeposit.connect(signer).add_liquidity(amounts,ethers.utils.parseEther("1.0"),signer.address,options2)

}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});