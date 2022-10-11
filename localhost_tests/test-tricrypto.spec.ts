// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";
import rawBRE from "hardhat";
import { BigNumber, utils } from "ethers";

import {getCurvePrice} from "./helpers/curve-calculation";

before(async () => {
    await rawBRE.run("set-DRE");
    
    console.log("\n***************");
    console.log("DRE finished");
    console.log("***************\n");
  });
makeSuite(
    "Tricrypto2 ",
    () => {
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


        var triCryptoDepositAdd = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46" //0xD51a44d3FaE010294C616388b506AcdA1bfAAE46 this is the address given on curve.fi/contracts
        var triCryptoDepositAbi = fs.readFileSync("./localhost_tests/tricrypto.json").toString()

        
        it("unpause lending pools", async () => {
            const emergency = (await DRE.ethers.getSigners())[1]
            const lendingPoolConfig = await contractGetters.getLendingPoolConfiguratorProxy()
            await lendingPoolConfig.connect(emergency).setPoolPause(false,1)
          });

          it("give WETH to users", async () => {
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            var signer = await contractGetters.getFirstSigner();
            //give signer 1 WETH so he can get LP tokens
            var options = {value: DRE.ethers.utils.parseEther("1.0")}
            await myWETH.connect(signer).deposit(options);
            var signerWeth = await myWETH.connect(signer).balanceOf(signer.address);
            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1.0"), "Did not get WETH");
          });

          it("deposit WETH", async () => {
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
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("100.0"), "Did not get WETH");
          });

          it("get LP tokens", async () => {
            //emergency deposits 100 WETH to pool to provide liquidity
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const emergency = (await DRE.ethers.getSigners())[1]
            var signer = await contractGetters.getFirstSigner();
            const lendingPool = await contractGetters.getLendingPool();

            const dataProv = await contractGetters.getAaveProtocolDataProvider();
            const aaveOracle = await contractGetters.getAaveOracle();

            var triCryptoDeposit = new DRE.ethers.Contract(triCryptoDepositAdd,triCryptoDepositAbi)

            var amounts = [DRE.ethers.utils.parseEther("0"),DRE.ethers.utils.parseEther("0"),DRE.ethers.utils.parseEther("1.0")]

            await myWETH.connect(signer).approve(triCryptoDeposit.address,DRE.ethers.utils.parseEther("1.0"))

            await triCryptoDeposit.connect(signer).add_liquidity(amounts,DRE.ethers.utils.parseEther("0.1"))

            
            

            // 0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF (this is EXACT MATCH, used to be deployed in our system),
            // 0xc4AD29ba4B3c580e6D59105FFf484999997675Ff  (this is similar match, THIS IS ADDRESS ON CURVE FRONTEND, WHICH IS WHAT WE NEED TO USE),  however, this is the address that triCryptoDeposit address uses. So I think we need to redeploy with this token
            

            var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)
            var mycurve = await CurveToken.connect(signer).balanceOf(signer.address)
            expect(
              mycurve.toString()
            ).to.not.be.equal("0", "Did not get curve"); //this can be general, we assume that curve's stuff is correct
          });
        
          it("deposit LP and borrow", async () => {
            //emergency deposits 100 WETH to pool to provide liquidity
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const emergency = (await DRE.ethers.getSigners())[1]
            var signer = await contractGetters.getFirstSigner();
            const lendingPool = await contractGetters.getLendingPool();
            var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)

            const dataProv = await contractGetters.getAaveProtocolDataProvider();

            await CurveToken.connect(signer).approve(lendingPool.address,DRE.ethers.utils.parseEther("1.0"))
            await lendingPool.connect(signer).deposit(CurveToken.address, 1, DRE.ethers.utils.parseUnits('1'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(CurveToken.address, 1, true); 
            
            var userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1)

            /*
            //calcualte expected amount (not done here since USDT has different number of decimals)
            var curvePoolAdd = '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46';
            var curvePoolAbi = [
                "function get_virtual_price() external view returns (uint256)"
            ]
            var curvePool = new DRE.ethers.Contract(curvePoolAdd,curvePoolAbi);
            var vprice = await curvePool.connect(signer).get_virtual_price();
            const aaveOracle = await contractGetters.getAaveOracle();
            const prices = [await aaveOracle.connect(signer).getAssetPrice("0xdAC17F958D2ee523a2206206994597C13D831ec7"), //usdt
            await aaveOracle.connect(signer).getAssetPrice("0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"), //wbtc
            await aaveOracle.connect(signer).getAssetPrice("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")] //weth
            const pricePerToken = BigNumber.from(getCurvePrice(vprice,prices).toString()).mul(10**18)

            //since we only deposit 1 whole tricrypto, this is the total collateral in our vault
            console.log("pricePerToken: ",pricePerToken)
            */
            const addProv = await contractGetters.getLendingPoolAddressesProvider();

            const curveOracleAdd = await addProv.connect(signer).getCurvePriceOracleWrapper();
            var curveOracleAbi = [
              "function getAssetPrice(address asset) public view returns (uint256)"
          ]

          const curveOracle = new DRE.ethers.Contract(curveOracleAdd,curveOracleAbi);

            const pricePerToken = await curveOracle.connect(signer).getAssetPrice(CurveToken.address);
            console.log("pricePerToken: ",pricePerToken)
            expect(
              userDat.totalCollateralETH.toString()
            ).to.be.bignumber.equal(pricePerToken.toString(), "Did not deposit tricypto2");
            
            await lendingPool.connect(signer).borrow(myWETH.address, 1, DRE.ethers.utils.parseEther("0.01"), 1, '0', signer.address); //borrow 500 USDT from tranche 2, 1 means stable rate
            
            userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1)

            expect(
              userDat.totalDebtETH.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.01"), "Did not deposit tricypto2");
          });
    }
)

