// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { ProtocolErrors } from '../helpers/types';
import {getCurvePrice} from "./helpers/curve-calculation";
makeSuite(
    "Bal and other tokens",
    () => {
        const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
        const fs = require('fs');
        const contractGetters = require('../helpers/contracts-getters.ts');
        // const lendingPool = await contractGetters.getLendingPool();
        // Load the first signer
        
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

        var CurveTokenAdd = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490"
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

        const DAIadd = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
        const DAI_ABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()


        const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
        const UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/abis/uniswapAbi.json").toString()

        var triCryptoDepositAdd = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7" 
var triCryptoDepositAbi = [
    "function add_liquidity(uint256[3] _amounts,uint256 _min_mint_amount) external",
    "function calc_token_amount(uint256[3] _amounts,bool deposit) external view"
]

        
        

          it("give WETH to signer", async () => {
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            var signer = await contractGetters.getFirstSigner();
            //give signer 1 WETH so he can get LP tokens
            var options = {value: DRE.ethers.utils.parseEther("1000.0")}
            await myWETH.connect(signer).deposit(options);
            var signerWeth = await myWETH.connect(signer).balanceOf(signer.address);
            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1000.0"), "Did not get WETH");
          });

          it("Deposit WETH for signer to borrow", async () => {
            //emergency deposits 100 WETH to pool to provide liquidity
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const emergency = (await DRE.ethers.getSigners())[1]
            var signer = await contractGetters.getFirstSigner();
            const lendingPool = await contractGetters.getLendingPool();

            const dataProv = await contractGetters.getAaveProtocolDataProvider();

            var options = {value: DRE.ethers.utils.parseEther("100.0")}

            await myWETH.connect(emergency).deposit(options);
            var signerWeth = await myWETH.connect(emergency).balanceOf(emergency.address);

            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("100.0"), "Did not get WETH");

            await myWETH.connect(emergency).approve(lendingPool.address,DRE.ethers.utils.parseEther("100.0"))

            await lendingPool.connect(emergency).deposit(myWETH.address, 1, DRE.ethers.utils.parseUnits('100'), await emergency.getAddress(), '0'); 
            const resDat = await dataProv.getReserveData(myWETH.address, 1)
            

            expect(
              resDat.availableLiquidity.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("100.0"), "Did not deposit WETH");
          });

          
          it("Uniswap ETH for BAL and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0xba100000625a3754423978a60c9317c58a424e3D"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            var path = [myWETH.address, USDC.address];
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1000.0"), path, signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get BAL");

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))


            /************************************************************************************/
            /****************** deposit BAL to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDC.address, 1, ethers.utils.parseUnits('800'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData("0xba100000625a3754423978a60c9317c58a424e3D",1,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("800"), "Did not get atoken");

            var resDat =  await dataProv.getReserveData("0xba100000625a3754423978a60c9317c58a424e3D",1)

            expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("800"), "Reserve doesn't have liquidity");

            await lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("0.1"), '0', await signer.getAddress()); 

            var userDat = await lendingPool.connect(signer).callStatic.getUserAccountData(signer.address,1)

            expect(
                userDat.totalDebtETH.toString()
              ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.1"), "Did not get debt token");
            


            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("10"), '0', await signer.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });

          it("Uniswap ETH for CRV and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0xD533a949740bb3306d119CC777fa900bA034cd52"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            var path = [myWETH.address, USDC.address];
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1000.0"), path, signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get BAL");

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))


            /************************************************************************************/
            /****************** deposit CRV to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDC.address, 1, ethers.utils.parseUnits('801'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData("0xD533a949740bb3306d119CC777fa900bA034cd52",1,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("801"), "Did not get atoken");

            var resDat =  await dataProv.getReserveData("0xD533a949740bb3306d119CC777fa900bA034cd52",1)

            expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("801"), "Reserve doesn't have liquidity");

            
            await lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("0.1"), '0', await signer.getAddress()); 

            var userDat = await lendingPool.connect(signer).callStatic.getUserAccountData(signer.address,1)

            // expect(
            //     userDat.totalDebtETH.toString()
            //   ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.1"), "Did not get debt token");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("10"), '0', await signer.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });

          it("Uniswap ETH for CVX and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            var path = [myWETH.address, USDC.address];
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther(".000001"), path, signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get BAL");

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))


            /************************************************************************************/
            /****************** deposit CRV to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDC.address, 1,ethers.utils.parseUnits('.0001'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData("0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",1,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther(".0001"), "Did not get atoken");

            var resDat =  await dataProv.getReserveData("0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",1)

            expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther(".0001"), "Reserve doesn't have liquidity");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("10"), '0', await signer.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });


          it("Uniswap ETH for BADGER and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0x3472A5A71965499acd81997a54BBA8D852C6E53d"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            var path = [myWETH.address, USDC.address];
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("100.0"), path, signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get BAL");

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))


            /************************************************************************************/
            /****************** deposit CRV to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDC.address, 1, ethers.utils.parseUnits('803'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData("0x3472A5A71965499acd81997a54BBA8D852C6E53d",1,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("803"), "Did not get atoken");

            var resDat =  await dataProv.getReserveData("0x3472A5A71965499acd81997a54BBA8D852C6E53d",1)

            expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("803"), "Reserve doesn't have liquidity");

            
            await lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("0.1"), '0', await signer.getAddress()); 

            var userDat = await lendingPool.connect(signer).callStatic.getUserAccountData(signer.address,1)

            // expect(
            //     userDat.totalDebtETH.toString()
            //   ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.1"), "Did not get debt token");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("10"), '0', await signer.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });

          it("Uniswap ETH for LDO and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            var path = [myWETH.address, USDC.address];
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("100.0"), path, signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get BAL");

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))


            /************************************************************************************/
            /****************** deposit CRV to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDC.address, 1, ethers.utils.parseUnits('804'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData("0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",1,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("804"), "Did not get atoken");

            var resDat =  await dataProv.getReserveData("0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",1)

            expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("804"), "Reserve doesn't have liquidity");

            
            await lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("0.1"), '0', await signer.getAddress()); 

            var userDat = await lendingPool.connect(signer).callStatic.getUserAccountData(signer.address,1)

            // expect(
            //     userDat.totalDebtETH.toString()
            //   ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.1"), "Did not get debt token");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("10"), '0', await signer.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });

          it("Uniswap ETH for ALCX and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            var path = [myWETH.address, USDC.address];
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther(".00000000001"), path, signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get BAL");

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))


            /************************************************************************************/
            /****************** deposit CRV to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDC.address, 1, ethers.utils.parseUnits('0.000000000001'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData("0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF",1,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(ethers.utils.parseUnits('0.000000000001'), "Did not get atoken");

            var resDat =  await dataProv.getReserveData("0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF",1)

            expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(ethers.utils.parseUnits('0.000000000001'), "Reserve doesn't have liquidity");

            

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("10"), '0', await signer.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });

          it("Uniswap ETH for 1inch and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0x111111111117dC0aa78b770fA6A738034120C302"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            var path = [myWETH.address, USDC.address];
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1.0"), path, signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get BAL");

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))


            /************************************************************************************/
            /****************** deposit CRV to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDC.address, 1, ethers.utils.parseUnits('805'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData("0x111111111117dC0aa78b770fA6A738034120C302",1,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("805"), "Did not get atoken");

            var resDat =  await dataProv.getReserveData("0x111111111117dC0aa78b770fA6A738034120C302",1)

            expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("805"), "Reserve doesn't have liquidity");

            
            await lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("0.1"), '0', await signer.getAddress()); 

            var userDat = await lendingPool.connect(signer).callStatic.getUserAccountData(signer.address,1)

            // expect(
            //     userDat.totalDebtETH.toString()
            //   ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.1"), "Did not get debt token");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("10"), '0', await signer.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });

          it("Uniswap ETH for frax and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0x853d955aCEf822Db058eb8505911ED77F175b99e"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            var path = [myWETH.address, USDC.address];
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("100.0"), path, signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get BAL");

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))


            /************************************************************************************/
            /****************** deposit CRV to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDC.address, 1, ethers.utils.parseUnits('805'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData("0x853d955aCEf822Db058eb8505911ED77F175b99e",1,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("805"), "Did not get atoken");

            var resDat =  await dataProv.getReserveData("0x853d955aCEf822Db058eb8505911ED77F175b99e",1)

            expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("805"), "Reserve doesn't have liquidity");

            
            await lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("0.1"), '0', await signer.getAddress()); 

            var userDat = await lendingPool.connect(signer).callStatic.getUserAccountData(signer.address,1)

            // expect(
            //     userDat.totalDebtETH.toString()
            //   ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.1"), "Did not get debt token");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("10"), '0', await signer.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });

          it("Uniswap ETH for steth and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            var path = [myWETH.address, USDC.address];
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("100.0"), path, signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)
            console.log("signerAmt: ",signerAmt)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get BAL");

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))


            /************************************************************************************/
            /****************** deposit CRV to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDC.address, 1, ethers.utils.parseUnits('0.01'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData("0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",1,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.01"), "Did not get atoken");

            var resDat =  await dataProv.getReserveData("0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",1)

            var approx = BigNumber.from(resDat.availableLiquidity.toString()).add(5); //1049...5 to 1050...04 are accepted
            var comp1 = BigNumber.from(approx.toString().slice(0,-1));
            var exp = BigNumber.from(DRE.ethers.utils.parseEther("0.01").toString().slice(0,-1))
            console.log(comp1)
            console.log(exp)

            expect(comp1).to.be.bignumber.equal(exp, "Reserve doesn't have liquidity");

            
            await lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("0.01"), '0', await signer.getAddress()); 

            var userDat = await lendingPool.connect(signer).callStatic.getUserAccountData(signer.address,1)

            console.log(userDat)

            // expect(
            //     userDat.totalDebtETH.toString()
            //   ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.1"), "Did not get debt token");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, ethers.utils.parseEther("10"), '0', await signer.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });

    }
)

