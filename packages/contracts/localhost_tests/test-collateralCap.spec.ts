// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";
import rawBRE from "hardhat";
import { BigNumber, utils } from "ethers";
import { ProtocolErrors } from '../helpers/types';
import {getCurvePrice} from "./helpers/curve-calculation";

before(async () => {
    await rawBRE.run("set-DRE");
    
    console.log("\n***************");
    console.log("DRE finished");
    console.log("***************\n");
  });
makeSuite(
    "collateralCap ",
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
        
        it("unpause lending pools", async () => {
            const emergency = (await DRE.ethers.getSigners())[1]
            const lendingPoolConfig = await contractGetters.getLendingPoolConfiguratorProxy()
            await lendingPoolConfig.connect(emergency).setPoolPause(false,1)
          });

          it("give WETH to users", async () => {
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            var signer = await contractGetters.getFirstSigner();
            //give signer 1 WETH so he can get LP tokens
            var options = {value: DRE.ethers.utils.parseEther("10000.0")}
            await myWETH.connect(signer).deposit(options);
            var signerWeth = await myWETH.connect(signer).balanceOf(signer.address);
            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("10000.0"), "Did not get WETH");
          });

          it("deposit too much WETH", async () => {
            //emergency deposits 100 WETH to pool to provide liquidity
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            var signer = await contractGetters.getFirstSigner();
            const lendingPool = await contractGetters.getLendingPool();
            
            await myWETH.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000000000000"))

            await lendingPool.connect(signer).deposit(myWETH.address, 1,  ethers.utils.parseEther('500'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(myWETH.address, 1, true); 

            var userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)

            expect(
              userDat.totalCollateralETH.toString()
            ).to.be.bignumber.equal(ethers.utils.parseEther('500'), "Did not enough collateral");


            await lendingPool.connect(signer).deposit(myWETH.address, 1,  ethers.utils.parseEther('2000'), await signer.getAddress(), '0'); 

            
            userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)
            
            expect(
              userDat.totalCollateralETH.toString()
            ).to.be.bignumber.equal(ethers.utils.parseEther('1000'), "Cap didn't cap");

            var dataProv = await contractGetters.getAaveProtocolDataProvider()

            var resDat = await dataProv.getReserveData(myWETH.address,1)
            var userResDat = await dataProv.getUserReserveData(myWETH.address,1,signer.address)
            
            expect(
              resDat.availableLiquidity.toString()
            ).to.be.bignumber.equal(ethers.utils.parseEther("2500"), "Reserve doesn't have enough"); //this can be general, we assume that curve's stuff is correct

            expect(
              userResDat.currentATokenBalance.toString()
            ).to.be.bignumber.equal(ethers.utils.parseEther("2500"), "User doesn't have enough aTokens"); //this can be general, we assume that curve's stuff is correct

          });
        
    }
)

