import { ethers } from "ethers";

// scripts/index.js
async function main () {
    // Our code will go here

    // Load the HRE into helpers to access signers
    const fs = require('fs');
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
/******************  get LP tokens **********************/ 
/************************************************************************************/
var triCryptoDepositAdd = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022" 
var triCryptoDepositAbi = fs.readFileSync("./localhost_tests/stethEth.json").toString()

var triCryptoDeposit = new ethers.Contract(triCryptoDepositAdd,triCryptoDepositAbi)

await triCryptoDeposit.connect(signer).get_virtual_price()
var amounts = [ethers.utils.parseEther("1.0"),ethers.utils.parseEther("0")]

await myWETH.connect(signer).approve(triCryptoDeposit.address,ethers.utils.parseEther("1.0"))


var options2 = {gasLimit: ethers.utils.parseEther("1.0")}

var options3 = {value: ethers.utils.parseEther("1.0")}

await triCryptoDeposit.connect(signer).lp_token(options2)
await triCryptoDeposit.connect(signer).calc_token_amount(amounts,true)
await triCryptoDeposit.connect(signer).add_liquidity(amounts,ethers.utils.parseEther("0.1"),options3)

var CurveTokenAdd = "0x06325440D014e39736583c165C2963BA99fAf14E"
var CurveTokenAddabi = [
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

var CurveToken = new ethers.Contract(CurveTokenAdd,CurveTokenAddabi)
await CurveToken.connect(signer).balanceOf(signer.address)
await CurveToken.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("1.0"))

// await lendingPoolConfig.connect(signer).unfreezeReserve(CurveToken.address, 2)
// await lendingPoolConfig.connect(signer).activateReserve(CurveToken.address, 2)



/************************************************************************************/
/****************** deposit curve LP token to pool and then borrow WETH  **********************/ 
/************************************************************************************/
await lendingPool.connect(signer).deposit(CurveToken.address, 2, ethers.utils.parseUnits('0.5'), await signer.getAddress(), '0'); 
await lendingPool.connect(signer).setUserUseReserveAsCollateral(CurveToken.address, 2, true); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

var dataProv = await contractGetters.getAaveProtocolDataProvider()

await dataProv.getReserveData(CurveToken.address,2)
await dataProv.getUserReserveData(CurveToken.address,2,signer.address)

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("0.1"), 1, '0', await signer.getAddress()); 

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("10"), 1, '0', await signer.getAddress()); //revert expected

/************************************************************************************/
/****************** contract call steth contract aggregator vs usdc aggregator  **********************/ 
/************************************************************************************/
var stethaggadd = "0x86392dC19c0b719886221c78AB11eb8Cf5c52812"
var stethabi = fs.readFileSync("./localhost_tests/stethEthAgg.json").toString()

var stethagg = new ethers.Contract(stethaggadd,stethabi)

await stethagg.connect(signer).latestAnswer()

var usdcaggadd = "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4"
var usdcaggabi = fs.readFileSync("./localhost_tests/usdcAgg.json").toString()

var usdcagg = new ethers.Contract(usdcaggadd,usdcaggabi)
await usdcagg.connect(signer).latestAnswer()
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});