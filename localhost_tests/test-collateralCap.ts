
const fs = require('fs');

// const DAI = new Token(
//     '',
//     "0x6B175474E89094C44Da98b954EedeAC495271d0F",
//     18
// );

    // Load the HRE into helpers to access signers
    await run("set-DRE")

    // Import getters to instance any Aave contract
    const contractGetters = require('./helpers/contracts-getters');
    const contractHelpers = require('./helpers/contracts-helpers');

    const lendingPool = await contractGetters.getLendingPool();


// Load the first signer
var signer = await contractGetters.getFirstSigner();

const emergency = (await ethers.getSigners())[1]


/************************************************************************************/
/****************** unpause lending pools **********************/ 
/************************************************************************************/
const lendingPoolConfig = await contractGetters.getLendingPoolConfiguratorProxy()

await lendingPoolConfig.connect(emergency).setPoolPause(false)


/************************************************************************************/
/****************** give WETH to users **********************/ 
/************************************************************************************/
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
const DAIadd = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const DAI_ABI = fs.readFileSync("./localhost_tests/DAI_ABI.json").toString()
const DAI = new ethers.Contract(DAIadd,DAI_ABI)

const myWETH = new ethers.Contract(WETHadd,WETHabi)

var options = {value: ethers.utils.parseEther("1.0")}

//give signer 1 WETH so he can get LP tokens
await myWETH.connect(signer).deposit(options);
await myWETH.connect(signer).balanceOf(signer.address);


//emergency deposits 100 WETH to pool to provide liquidity
var options = {value: ethers.utils.parseEther("100.0")}

await myWETH.connect(emergency).deposit(options);
await myWETH.connect(emergency).balanceOf(signer.address);
await myWETH.connect(emergency).approve(lendingPool.address,ethers.utils.parseEther("100.0"))

await lendingPool.connect(emergency).deposit(myWETH.address, 2, false, ethers.utils.parseUnits('100'), await emergency.getAddress(), '0'); 


/************************************************************************************/
/******************  Uniswap ETH for DAI  **********************/ 
/************************************************************************************/

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/uniswapAbi.json").toString()
const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

const path = [myWETH.address, DAI.address];
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

//emergency deposits 100 WETH to pool to provide liquidity
var options = {value: ethers.utils.parseEther("1000.0")}

await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1000000.0"), path, signer.address, deadline,options)

await DAI.connect(signer).balanceOf(signer.address)
await DAI.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000000000000"))

const { ethers, waffle} = require("hardhat"); //gets waffle provider

const provider = waffle.provider;

await provider.getBalance(signer.address) //gets the ETH balance of signer

/************************************************************************************/
/****************** deposit too much DAI  **********************/ 
/************************************************************************************/


await lendingPool.connect(signer).deposit(DAI.address, 2,  ethers.utils.parseUnits('500'), await signer.getAddress(), '0'); 
await lendingPool.connect(signer).setUserUseReserveAsCollateral(DAI.address, 2, true); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

await lendingPool.connect(signer).deposit(DAI.address, 2,  ethers.utils.parseUnits('2000'), await signer.getAddress(), '0'); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

var dataProv = await contractGetters.getAaveProtocolDataProvider()

await dataProv.getReserveData(DAI.address,2)
await dataProv.getUserReserveData(DAI.address,2,signer.address)
