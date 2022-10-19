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
    "3pool ",
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

        var triCryptoDepositAdd = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022" 
var triCryptoDepositAbi = fs.readFileSync("./localhost_tests/abis/stethEth.json").toString()

        
        it("unpause lending pools", async () => {
            const emergency = (await DRE.ethers.getSigners())[1]
            const lendingPoolConfig = await contractGetters.getLendingPoolConfiguratorProxy()
            await lendingPoolConfig.connect(emergency).setPoolPause(false,1)
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
            
            var triCryptoDeposit = new DRE.ethers.Contract(triCryptoDepositAdd,triCryptoDepositAbi)

            var amounts = [ethers.utils.parseEther("1.0"),ethers.utils.parseEther("0")]

            await myWETH.connect(signer).approve(triCryptoDeposit.address,DRE.ethers.utils.parseEther("1000.0"))

            var options3 = {value: ethers.utils.parseEther("1.0")}
            await triCryptoDeposit.connect(signer).add_liquidity(amounts,DRE.ethers.utils.parseEther("0.1"),options3)


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

            await CurveToken.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))
            await lendingPool.connect(signer).deposit(CurveToken.address, 1, DRE.ethers.utils.parseUnits('0.5'), await signer.getAddress(), '0'); 
            await lendingPool.connect(signer).setUserUseReserveAsCollateral(CurveToken.address, 1, true); 
            
            var userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1)

            const addProv = await contractGetters.getLendingPoolAddressesProvider();

            const curveOracleAdd = await addProv.connect(signer).getCurvePriceOracleWrapper();
            var curveOracleAbi = [
              "function getAssetPrice(address asset) public view returns (uint256)"
          ]

          const curveOracle = new DRE.ethers.Contract(curveOracleAdd,curveOracleAbi);

            const pricePerToken = await curveOracle.connect(signer).getAssetPrice(CurveToken.address);
            console.log("pricePerToken: ",pricePerToken)
            var col = BigNumber.from(pricePerToken.toString()).div(2)
            expect(
              userDat.totalCollateralETH.toString()
            ).to.be.bignumber.equal(col.toString(), "Did not deposit 3crv");
            
            await lendingPool.connect(signer).borrow(myWETH.address, 1, DRE.ethers.utils.parseEther("0.01"), 1, '0', signer.address); 
            
            userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1)

            expect(
              userDat.totalDebtETH.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.01"), "Did not get debt token");


            var signerWeth = await myWETH.connect(signer).balanceOf(signer.address);

            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.01"), "Did not get WETH");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, DRE.ethers.utils.parseEther("10"), 1, '0', signer.address)
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);
          });
    }
)

