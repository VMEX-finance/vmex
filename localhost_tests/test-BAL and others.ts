

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

var options = {value: ethers.utils.parseEther("1000.0")}

//give signer 1 WETH so he can get LP tokens
await myWETH.connect(signer).deposit(options);
await myWETH.connect(signer).balanceOf(signer.address);


//emergency deposits 100 WETH to pool to provide liquidity
var options = {value: ethers.utils.parseEther("100.0")}

await myWETH.connect(emergency).deposit(options);
await myWETH.connect(emergency).balanceOf(signer.address);
await myWETH.connect(emergency).approve(lendingPool.address,ethers.utils.parseEther("100.0"))

await lendingPool.connect(emergency).deposit(myWETH.address, 2, ethers.utils.parseUnits('100'), await emergency.getAddress(), '0'); 

/************************************************************************************/
/******************  Uniswap ETH for BAL?  **********************/ 
/************************************************************************************/
var USDCadd = "0xba100000625a3754423978a60c9317c58a424e3D"
var USDCABI = fs.readFileSync("./localhost_tests/DAI_ABI.json").toString()
var USDC = new ethers.Contract(USDCadd,USDCABI)

var UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
var UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/uniswapAbi.json").toString()
var UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

var path = [myWETH.address, USDC.address];
var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


var options = {value: ethers.utils.parseEther("1000.0")}

await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1000.0"), path, signer.address, deadline,options)

await USDC.connect(signer).balanceOf(signer.address)
await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

/************************************************************************************/
/****************** deposit steth to pool and then borrow WETH  **********************/ 
/************************************************************************************/
await lendingPool.connect(signer).deposit(USDC.address, 2, ethers.utils.parseUnits('800'), await signer.getAddress(), '0'); 
await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 2, true); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("0.1"), 1, '0', await signer.getAddress()); 

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("10"), 1, '0', await signer.getAddress()); //revert expected



/************************************************************************************/
/******************  Uniswap ETH for CRV?  **********************/ 
/************************************************************************************/
var USDCadd = "0xD533a949740bb3306d119CC777fa900bA034cd52"
var USDCABI = fs.readFileSync("./localhost_tests/DAI_ABI.json").toString()
var USDC = new ethers.Contract(USDCadd,USDCABI)

var UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
var UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/uniswapAbi.json").toString()
var UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

var path = [myWETH.address, USDC.address];
var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


var options = {value: ethers.utils.parseEther("1000.0")}

await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1000.0"), path, signer.address, deadline,options)

await USDC.connect(signer).balanceOf(signer.address)
await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

/************************************************************************************/
/****************** deposit steth to pool and then borrow WETH  **********************/ 
/************************************************************************************/
await lendingPool.connect(signer).deposit(USDC.address, 2, ethers.utils.parseUnits('801'), await signer.getAddress(), '0'); 
await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 2, true); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)



await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("0.1"), 1, '0', await signer.getAddress()); 

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("10"), 1, '0', await signer.getAddress()); //revert expected



/************************************************************************************/
/******************  Uniswap ETH for CVX?  **********************/ 
/************************************************************************************/
var USDCadd = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B"
var USDCABI = fs.readFileSync("./localhost_tests/DAI_ABI.json").toString()
var USDC = new ethers.Contract(USDCadd,USDCABI)

var UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
var UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/uniswapAbi.json").toString()
var UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

var path = [myWETH.address, USDC.address];
var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


var options = {value: ethers.utils.parseEther("100000000.0")}

await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther(".000001"), path, signer.address, deadline,options)

await USDC.connect(signer).balanceOf(signer.address)
await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

/************************************************************************************/
/****************** deposit steth to pool and then borrow WETH  **********************/ 
/************************************************************************************/
await lendingPool.connect(signer).deposit(USDC.address, 2, ethers.utils.parseUnits('.0001'), await signer.getAddress(), '0'); 
await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 2, true); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("0.1"), 1, '0', await signer.getAddress()); 

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("10"), 1, '0', await signer.getAddress()); //revert expected



/************************************************************************************/
/******************  Uniswap ETH for BADGER?  **********************/ 
/************************************************************************************/
var USDCadd = "0x3472A5A71965499acd81997a54BBA8D852C6E53d"
var USDCABI = fs.readFileSync("./localhost_tests/DAI_ABI.json").toString()
var USDC = new ethers.Contract(USDCadd,USDCABI)

var UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
var UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/uniswapAbi.json").toString()
var UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

var path = [myWETH.address, USDC.address];
var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


var options = {value: ethers.utils.parseEther("1000.0")}

await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1000.0"), path, signer.address, deadline,options)

await USDC.connect(signer).balanceOf(signer.address)
await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

/************************************************************************************/
/****************** deposit steth to pool and then borrow WETH  **********************/ 
/************************************************************************************/
await lendingPool.connect(signer).deposit(USDC.address, 2, ethers.utils.parseUnits('803'), await signer.getAddress(), '0'); 
await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 2, true); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("0.1"), 1, '0', await signer.getAddress()); 

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("10"), 1, '0', await signer.getAddress()); //revert expected



/************************************************************************************/
/******************  Uniswap ETH for LDO?  **********************/ 
/************************************************************************************/
var USDCadd = "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"
var USDCABI = fs.readFileSync("./localhost_tests/DAI_ABI.json").toString()
var USDC = new ethers.Contract(USDCadd,USDCABI)

var UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
var UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/uniswapAbi.json").toString()
var UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

var path = [myWETH.address, USDC.address];
var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


var options = {value: ethers.utils.parseEther("1000.0")}

await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1000.0"), path, signer.address, deadline,options)

await USDC.connect(signer).balanceOf(signer.address)
await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

/************************************************************************************/
/****************** deposit steth to pool and then borrow WETH  **********************/ 
/************************************************************************************/
await lendingPool.connect(signer).deposit(USDC.address, 2,ethers.utils.parseUnits('804'), await signer.getAddress(), '0'); 
await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 2, true); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("0.1"), 1, '0', await signer.getAddress()); 

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("10"), 1, '0', await signer.getAddress()); //revert expected




/************************************************************************************/
/******************  Uniswap ETH for ALCX?  **********************/ 
/************************************************************************************/
var USDCadd = "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF"
var USDCABI = fs.readFileSync("./localhost_tests/DAI_ABI.json").toString()
var USDC = new ethers.Contract(USDCadd,USDCABI)

var UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
var UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/uniswapAbi.json").toString()
var UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

var path = [myWETH.address, USDC.address];
var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


var options = {value: ethers.utils.parseEther("1000.0")}

await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther(".00000000001"), path, signer.address, deadline,options)

await USDC.connect(signer).balanceOf(signer.address)
await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

/************************************************************************************/
/****************** deposit steth to pool and then borrow WETH  **********************/ 
/************************************************************************************/
await lendingPool.connect(signer).deposit(USDC.address, 2, ethers.utils.parseUnits('0.000000000001'), await signer.getAddress(), '0'); 
await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 2, true); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("0.1"), 1, '0', await signer.getAddress()); 

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("10"), 1, '0', await signer.getAddress()); //revert expected




/************************************************************************************/
/******************  Uniswap ETH for 1inch?  **********************/ 
/************************************************************************************/
var USDCadd = "0x111111111117dC0aa78b770fA6A738034120C302"
var USDCABI = fs.readFileSync("./localhost_tests/DAI_ABI.json").toString()
var USDC = new ethers.Contract(USDCadd,USDCABI)

var UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
var UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/uniswapAbi.json").toString()
var UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

var path = [myWETH.address, USDC.address];
var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


var options = {value: ethers.utils.parseEther("1000.0")}

await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1000.0"), path, signer.address, deadline,options)

await USDC.connect(signer).balanceOf(signer.address)
await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

/************************************************************************************/
/****************** deposit steth to pool and then borrow WETH  **********************/ 
/************************************************************************************/
await lendingPool.connect(signer).deposit(USDC.address, 2, ethers.utils.parseUnits('805'), await signer.getAddress(), '0'); 
await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 2, true); 

await lendingPool.connect(signer).getUserAccountData(signer.address,2)

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("0.1"), 1, '0', await signer.getAddress()); 

await lendingPool.connect(signer).borrow(myWETH.address, 2, ethers.utils.parseEther("10"), 1, '0', await signer.getAddress()); //revert expected





/************************************************************************************/
/****************** check that atokens were given  **********************/ 
/************************************************************************************/
var dataProv = await contractGetters.getAaveProtocolDataProvider()

await dataProv.getReserveData("0xba100000625a3754423978a60c9317c58a424e3D",2)
await dataProv.getUserReserveData("0xba100000625a3754423978a60c9317c58a424e3D",2,signer.address)

await dataProv.getReserveData("0xD533a949740bb3306d119CC777fa900bA034cd52",2)
await dataProv.getUserReserveData("0xD533a949740bb3306d119CC777fa900bA034cd52",2,signer.address)

await dataProv.getReserveData("0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",2)
await dataProv.getUserReserveData("0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",2,signer.address)

await dataProv.getReserveData("0x3472A5A71965499acd81997a54BBA8D852C6E53d",2)
await dataProv.getUserReserveData("0x3472A5A71965499acd81997a54BBA8D852C6E53d",2,signer.address)

await dataProv.getReserveData("0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",2)
await dataProv.getUserReserveData("0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",2,signer.address)

await dataProv.getReserveData("0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF",2)
await dataProv.getUserReserveData("0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF",2,signer.address)

await dataProv.getReserveData("0x111111111117dC0aa78b770fA6A738034120C302",2)
await dataProv.getUserReserveData("0x111111111117dC0aa78b770fA6A738034120C302",2,signer.address)