// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { ProtocolErrors } from '../helpers/types';
makeSuite(
    "General testing of tokens",
    () => {
        const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
        const fs = require('fs');
        const contractGetters = require('../helpers/contracts-getters.ts');
        // const lendingPool = await contractGetters.getLendingPool();
        // Load the first signer
        
        const WETHadd = "0x4200000000000000000000000000000000000006"
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

        const VELO_ROUTER_ADDRESS = "0x9c12939390052919aF3155f41Bf4160Fd3666A6f"
        const VELO_ROUTER_ABI = fs.readFileSync("./localhost_tests_OP/abis/velo.json").toString()
        // [
        //   "function swapExactETHForTokens(uint amountOutMin, route[] calldata routes, address to, uint deadline) external payable returns (uint[] memory amounts)"
        // ]

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

            await lendingPool.connect(emergency).deposit(myWETH.address, 0, DRE.ethers.utils.parseUnits('100'), await emergency.getAddress(), '0'); 
            const resDat = await dataProv.getReserveData(myWETH.address, 0)
            

            expect(
              resDat.availableLiquidity.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("100.0"), "Did not deposit WETH");
          });

          
          it("Uniswap ETH for USDC and borrow WETH", async () => {
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const emergency = (await DRE.ethers.getSigners())[1]
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const lendingPool = await contractGetters.getLendingPool();
            var USDCadd = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"
            var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
            var USDC = new ethers.Contract(USDCadd,USDCABI)
            const USDCdec = await USDC.connect(signer).decimals();

            const VELO_ROUTER_CONTRACT = new ethers.Contract(VELO_ROUTER_ADDRESS, VELO_ROUTER_ABI)

            var path = [WETHadd, USDCadd, true];
            // await myWETH.connect(signer).approve(VELO_ROUTER_ADDRESS,ethers.utils.parseEther("100000.0"))
            var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
            var options = {value: ethers.utils.parseEther("1000.0")}


            // await UNISWAP_ROUTER_CONTRACT.connect(signer).swapTokensForExactTokens(
            //   ethers.utils.parseUnits("10.0", await USDC.connect(signer).decimals()), 
            //   ethers.utils.parseEther("1000"),
            //   path, 
            //   signer.address
            // )

            await VELO_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseUnits("1000.0", USDCdec), [path], signer.address, deadline,options)

            var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

            expect(
                signerAmt.toString()
            ).to.not.be.bignumber.equal(0, "Did not get USDC");

            console.log("Got USDC")

            await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

            /************************************************************************************/
            /****************** deposit BAL to pool and then borrow WETH  **********************/ 
            /************************************************************************************/
            await lendingPool.connect(signer).deposit(USDCadd, 0, ethers.utils.parseUnits("1000.0", USDCdec), signer.address, '0'); 
            console.log("Got USdc deposited")
            // await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

            var userResDat = await dataProv.getUserReserveData(USDCadd,0,signer.address)

            expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseUnits("1000.0", USDCdec), "Did not get atoken");

            var resDat =  await dataProv.getReserveData(USDCadd,0)

            expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseUnits("1000.0", USDCdec), "Reserve doesn't have liquidity");

            await lendingPool.connect(emergency).borrow(USDCadd, 0, ethers.utils.parseUnits("200", USDCdec), '0', await emergency.getAddress()); 

            var userDat = await lendingPool.connect(emergency).callStatic.getUserAccountData(emergency.address,0)
            const expected = DRE.ethers.utils.parseUnits("200", 8);


            expect( //cause USDC depegged lmao fuck
                (Math.abs(Number(userDat.totalDebtETH.toString())-Number(expected)))
              ).to.be.lte(10**6, "Did not get debt token"); //USD oracles have 8 decimals
            


            await expect(
                lendingPool.connect(emergency).borrow(USDC.address, 0, ethers.utils.parseUnits("10",18), '0', await emergency.getAddress())
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);


          });

    }
)

