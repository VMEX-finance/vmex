import { ethers } from "ethers";

// scripts/index.js
async function main () {
    // Our code will go here

    // Load the HRE into helpers to access signers
    await run("set-DRE")

    // Import getters to instance any Aave contract
    const contractGetters = require('./helpers/contracts-getters');
    const contractHelpers = require('./helpers/contracts-helpers');

    const lendingPool = await contractGetters.getLendingPool();


// Load the first signer
var signer = await contractGetters.getFirstSigner();

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

// testing curve lp tokens
var options2 = {value: ethers.utils.parseEther("1.0"), gasLimit: 8000000}
var triCryptoDepositAdd = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46" //0xD51a44d3FaE010294C616388b506AcdA1bfAAE46 this is the address given on curve.fi/contracts
var triCryptoDepositAbi = [
    "function add_liquidity(uint256[3] _amounts,uint256 _min_mint_amount) external",
    "function calc_token_amount(uint256[3] _amounts,bool deposit) external view"
]

var triCryptoDeposit = new ethers.Contract(triCryptoDepositAdd,triCryptoDepositAbi)

var amounts = [ethers.utils.parseEther("0"),ethers.utils.parseEther("0"),ethers.utils.parseEther("1.0")]

await myWETH.connect(signer).approve(triCryptoDeposit.address,ethers.utils.parseEther("1.0"))

await triCryptoDeposit.connect(signer).calc_token_amount([10**2, 10**2,10**2],true)
await triCryptoDeposit.connect(signer).add_liquidity(amounts,ethers.utils.parseEther("0.1"))

// 0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF (this is EXACT MATCH, used to be deployed in our system),
// 0xc4AD29ba4B3c580e6D59105FFf484999997675Ff  (this is similar match, THIS IS ADDRESS ON CURVE FRONTEND, WHICH IS WHAT WE NEED TO USE),  however, this is the address that triCryptoDeposit address uses. So I think we need to redeploy with this token
var CurveTokenAdd = "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff"
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


const emergency = (await ethers.getSigners())[1]

const lendingPoolConfig = await contractGetters.getLendingPoolConfiguratorProxy()

await lendingPoolConfig.connect(emergency).setPoolPause(false)

// await lendingPoolConfig.connect(signer).unfreezeReserve(CurveToken.address, 2)
// await lendingPoolConfig.connect(signer).activateReserve(CurveToken.address, 2)



await lendingPool.connect(signer).deposit(CurveToken.address, 2, true, ethers.utils.parseUnits('1'), await signer.getAddress(), '0'); 

const usdtadd = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
var amount = await contractHelpers.convertToCurrencyDecimals(usdtadd,'500')
await lendingPool.connect(signer).borrow(usdtadd, 2, 500000000, 1, '0', await signer.getAddress()); //borrow 500 USDT from tranche 2, 1 means stable rate

// var emergency = (await ethers.getSigners())[1]
// await lendingPool.connect(emergency).deposit(CurveToken.address, 2, true, ethers.utils.parseUnits('1'), await emergency.getAddress(), '0'); 

await lendingPool.connect(signer).getReserveData(CurveToken.address, 2)

var dataProv = await contractGetters.getAaveProtocolDataProvider()

await dataProv.getReserveData(CurveToken.address,2)
await dataProv.getUserReserveData(CurveToken.address,2,signer.address)

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

//test getPriceOracle
var addressesProvider = await contractGetters.getLendingPoolAddressesProvider()

var ad = await lendingPool.getAssetData(CurveToken.address)
var oracleadd = await addressesProvider.getPriceOracle(ad.assetType)
var oracleabi = [
    "function getAssetPrice(address asset) public view returns (uint256)",
    "function getFallbackOracle() external view returns (address)"
]

var oracle = new ethers.Contract(oracleadd,oracleabi)
await oracle.connect(signer).getFallbackOracle();
await oracle.connect(signer).getAssetPrice(CurveToken.address);
//596885100691044998108101827164204760
//This is actually the right answer in wei (have to divide by 10^18 first)








var curveAddressProviderAddress = await addressesProvider.getCurveAddressProvider();
var curveAddressProviderAbi = [
    "function get_registry() external view returns (address)",

]

var curveAddressProvider = new ethers.Contract(curveAddressProviderAddress,curveAddressProviderAbi);

var registryAdd = await curveAddressProvider.connect(signer).get_registry();
var registryAbi = [
    "function get_pool_from_lp_token(address a) external view returns (address)",

    "function get_n_coins(address a) external view returns (uint256[2] memory)",

   "function get_underlying_coins(address a) external view returns (address[8] memory)",

   "function pool_list(uint256 x) external view returns (address)",
   "function get_virtual_price_from_lp_token(address a) external view returns (uint256)"
]

var registry = new ethers.Contract(registryAdd,registryAbi);
var pool = await registry.connect(signer).get_pool_from_lp_token(CurveToken.address) 
//this returns 0 address since we should really be using 0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF
//but the issue with using 0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF is that the deposit address doesn't give this as the token. Need to find a deposit address that gives this as the token

await registry.connect(signer).get_pool_from_lp_token('0xc4AD29ba4B3c580e6D59105FFf484999997675Ff') //this returns zero address
var pool = await registry.connect(signer).get_pool_from_lp_token('0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF') //this returns the right pool address

//pool address from above is 0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5. This virtual price is 1019476472238204403
// WE NEED TO USE THIS: pool address should be 0xD51a44d3FaE010294C616388b506AcdA1bfAAE46 though. But this address doesn't work with get_n_coins. This virtual price is 1021497750009951736

await registry.connect(signer).pool_list(0)

await registry.connect(signer).get_virtual_price_from_lp_token('0xc4AD29ba4B3c580e6D59105FFf484999997675Ff') //this does not
await registry.connect(signer).get_virtual_price_from_lp_token('0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF') //this works

var num_coins = await registry.connect(signer).get_n_coins(pool)
[1]

var aave_oracleAdd = await addressesProvider.getAavePriceOracle();

var aave_oracle = new ethers.Contract(aave_oracleAdd,oracleabi);

await aave_oracle.connect(signer).getAssetPrice('0xdAC17F958D2ee523a2206206994597C13D831ec7') //USDT price is 

var curveOracleAdd = await addressesProvider.getCurvePriceOracle();
var curveOracleAbi = [
    "function get_price(address pool, uint256[] memory prices) external view returns (uint256)"
]
var curveOracle = new ethers.Contract(curveOracleAdd,curveOracleAbi);

var curvePoolAdd = '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46';
var curvePoolAbi = [
    "function get_virtual_price() external view returns (uint256)"
]
var curvePool = new ethers.Contract(curvePoolAdd,curvePoolAbi);
await curvePool.connect(signer).get_virtual_price();

//registry has get_virtual_price_from_lp_token, maybe we can just use this
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});