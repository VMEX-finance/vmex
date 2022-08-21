
// scripts/index.js
async function main () {
    // Our code will go here

    // Load the HRE into helpers to access signers
    await run("set-DRE")

    // Import getters to instance any Aave contract
    const contractGetters = require('./helpers/contracts-getters');

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
var triCryptoDepositAdd = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46"
var triCryptoDepositAbi = [
    "function add_liquidity(uint256[3] _amounts,uint256 _min_mint_amount) external",
    "function calc_token_amount(uint256[3] _amounts,bool deposit) external view"
]

var triCryptoDeposit = new ethers.Contract(triCryptoDepositAdd,triCryptoDepositAbi)

var amounts = [ethers.utils.parseEther("0"),ethers.utils.parseEther("0"),ethers.utils.parseEther("1.0")]

await myWETH.connect(signer).approve(triCryptoDeposit.address,ethers.utils.parseEther("1.0"))

await triCryptoDeposit.connect(signer).calc_token_amount([10**2, 10**2,10**2],true)
await triCryptoDeposit.connect(signer).add_liquidity(amounts,ethers.utils.parseEther("0.1"))

// 0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF (this is exact match, is deployed in our system),
// 0xc4AD29ba4B3c580e6D59105FFf484999997675Ff  (this is similar match, was on curve frontend),  however, this is the address that triCryptoDeposit address uses. So I think we need to redeploy with this token
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

// var emergency = (await ethers.getSigners())[1]
// await lendingPool.connect(emergency).deposit(CurveToken.address, 2, true, ethers.utils.parseUnits('1'), await emergency.getAddress(), '0'); 

await lendingPool.connect(signer).getReserveData(CurveToken.address, 2)

}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});