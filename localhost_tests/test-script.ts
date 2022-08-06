// scripts/index.js
async function main () {
    // Our code will go here

    // Load the HRE into helpers to access signers
    run("set-DRE")

    // Import getters to instance any Aave contract
    const contractGetters = require('./helpers/contracts-getters');


// Load the first signer
const signer = await contractGetters.getFirstSigner();

// Lending pool instance
const lendingPool = await contractGetters.getLendingPool("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");

// ERC20 token DAI Mainnet instance
const DAI = await contractGetters.getIErc20Detailed("0x6B175474E89094C44Da98b954EedeAC495271d0F");

const emergency = (await ethers.getSigners())[1]

const lendingPoolConfig = await contractGetters.getLendingPoolConfiguratorProxy("0xCc87B5A13D78a49b1fd46a113a82BE3F9d0463F2")

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

const options = {value: ethers.utils.parseEther("1.0")}

await myWETH.connect(signer).deposit(options);
await myWETH.connect(signer).balanceOf(signer.address);
await myWETH.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("1.0"))

await lendingPool.connect(signer).deposit(myWETH.address, 1, true, ethers.utils.parseUnits('1'), await signer.getAddress(), '0'); 

}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});