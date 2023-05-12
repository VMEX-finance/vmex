// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { eOptimismNetwork, ProtocolErrors } from '../helpers/types';
import { MAX_UINT_AMOUNT } from "../helpers/constants";
import {OptimismConfig} from "../markets/optimism"
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { toBytes32, setStorageAt } from "../helpers/token-fork";
makeSuite(
    "General testing of tokens",
    () => {
        const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW, VL_BORROWING_NOT_ENABLED } = ProtocolErrors;
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
        const oracleAbi = [
          "function getAssetPrice(address asset) public view returns (uint256)"
      ]

        const VELO_ROUTER_ADDRESS = "0x9c12939390052919aF3155f41Bf4160Fd3666A6f"
        const VELO_ROUTER_ABI = fs.readFileSync("./localhost_tests_OP/abis/velo.json").toString()
        const amountWETH = ethers.utils.parseEther("1.0");
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

          it("Deposit WETH as collateral and to be borrowed", async () => {
            //emergency deposits 100 WETH to pool to provide liquidity
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const emergency = (await DRE.ethers.getSigners())[1]
            var signer = await contractGetters.getFirstSigner();
            const lendingPool = await contractGetters.getLendingPool();

            const dataProv = await contractGetters.getAaveProtocolDataProvider();

            var options = {value: amountWETH}

            await myWETH.connect(emergency).deposit(options);
            var signerWeth = await myWETH.connect(emergency).balanceOf(emergency.address);

            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(amountWETH, "Did not get WETH");

            await myWETH.connect(emergency).approve(lendingPool.address,DRE.ethers.utils.parseEther("100.0"))

            await lendingPool.connect(emergency).deposit(myWETH.address, 0, amountWETH, await emergency.getAddress(), '0'); 
            const resDat = await dataProv.getReserveData(myWETH.address, 0)
            

            expect(
              resDat.availableLiquidity.toString()
            ).to.be.bignumber.equal(amountWETH, "Did not deposit WETH");
          });

          
          it("Testing general tokens deposit and borrow", async () => {
            const tokens = await getParamPerNetwork(OptimismConfig.ReserveAssets, eOptimismNetwork.optimism);
            const config = OptimismConfig.ReservesConfig
            const WETHConfig = config["WETH"]
            if(!tokens || !WETHConfig){
              return
            }
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const emergency = (await DRE.ethers.getSigners())[1]
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const addProv = await contractGetters.getLendingPoolAddressesProvider();
            const oracleAdd = await addProv.connect(signer).getPriceOracle();
            const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi);
            const lendingPool = await contractGetters.getLendingPool();
            for(let [symbol, address] of Object.entries(tokens)){
                console.log("Testing ",symbol)
                let slot = -1;
                let keyFirst = true;
                if(symbol=="ThreeCRV"){
                  break
                }
                if(symbol=="WBTC"){
                  slot = 0;
                  keyFirst = true;
                }
                else{
                  continue;
                }

                // if(symbol=="WETH" || symbol=="wstETH" || symbol=="FRAX" ){
                //   continue
                // }

                
                var USDCadd = address
                var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
                var USDC = new ethers.Contract(USDCadd,USDCABI)
                const tokenDec = await USDC.connect(signer).decimals();
                const WETHdec = await myWETH.connect(signer).decimals();
                const tokenConfig = config[symbol]

                if(slot!=-1){
                  let index;
                  console.log("Attempt setting storage")
                  if(keyFirst){
                    index = ethers.utils.solidityKeccak256(
                      ["uint256", "uint256"],
                      [signer.address, slot] // key, slot
                    );
                  }



                  // Manipulate local balance (needs to be bytes32 string)
                  await setStorageAt(
                    USDCadd,
                    index.toString(),
                    toBytes32(ethers.utils.parseUnits("10.0", tokenDec)).toString()
                  );
                  console.log("done setting storage")
                }
                else if(symbol!="WETH") {
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
                  
                  await VELO_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseUnits("0.0", tokenDec), [path], signer.address, deadline,options)
                }
                var signerOrigAmt = await USDC.connect(signer).balanceOf(signer.address)
                //give some to emergency so they can repay debt
                await USDC.connect(signer).approve(emergency.address,ethers.utils.parseEther("100000.0"))
                await USDC.connect(signer).transfer(emergency.address, signerOrigAmt.div(10))

                var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

                expect(
                    signerAmt.toString()
                ).to.not.be.bignumber.equal(0, "Did not get", symbol);


                console.log("Got", signerAmt.toString())



                await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

                /************************************************************************************/
                /****************** deposit BAL to pool and then borrow WETH  **********************/ 
                /************************************************************************************/
                const tx = await lendingPool.connect(signer).deposit(USDCadd, 0, signerAmt.toString(), signer.address, '0'); 
                const tx2 = await tx.wait(1);
                console.log("Deposited", symbol)
                console.log("* Gas used: ", tx2.gasUsed)
                // await lendingPool.connect(signer).setUserUseReserveAsCollateral(USDC.address, 1, true); 

                var userResDat = await dataProv.getUserReserveData(USDCadd,0,signer.address)

                expect(userResDat.currentATokenBalance.toString()).to.be.bignumber.equal(signerAmt.toString(), "Did not get atoken");

                var resDat =  await dataProv.getReserveData(USDCadd,0)
                if(symbol=="WETH"){
                  expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(signerAmt.add(amountWETH).toString(), "Reserve doesn't have liquidity");
                }
                else
                  expect(resDat.availableLiquidity.toString()).to.be.bignumber.equal(signerAmt.toString(), "Reserve doesn't have liquidity");
                console.log("Passed deposit checks\n")
                if(tokenConfig.borrowingEnabled){
                  console.log("Attempting max borrow of",symbol)
                  const tokenPrice = await oracle.connect(signer).callStatic.getAssetPrice(USDCadd);
                  console.log("Manual check: ",symbol," price is (USD) $",tokenPrice)
                  const wethPrice = await oracle.connect(signer).callStatic.getAssetPrice(WETHadd);
                  console.log("Manual check: weth price is (USD) $",wethPrice)

                  const tx = await lendingPool.connect(emergency).borrow(USDCadd, 0, MAX_UINT_AMOUNT, '0', await emergency.getAddress()); 
                  await tx.wait(1);
                  const events = await lendingPool.queryFilter('Borrow', tx.blockNumber, tx.blockNumber);
                  const borrowEvent = events[events.length - 1];
                  const amountBorrowed = borrowEvent.args["amount"]
                  console.log("Borrow amount: ", amountBorrowed)
                  console.log("* Gas used: ", tx.gasUsed);
                  const amountBorrowable = (
                    amountWETH.mul(wethPrice).mul(WETHConfig.baseLTVAsCollateral).mul(ethers.utils.parseUnits("1",tokenDec))
                  ).div
                  (
                    tokenPrice.mul(ethers.utils.parseUnits("1",WETHdec)).mul(tokenConfig.borrowFactor)
                  )
                  const expectedAmountBorrows = amountBorrowable.lt(signerAmt) ? amountBorrowable : signerAmt
                  console.log("Expected amount max borrow: ", expectedAmountBorrows)
                  expect(Math.abs(Number(amountBorrowed.toString())-expectedAmountBorrows)).to.be.lte(10)
                  var userDat = await lendingPool.connect(emergency).callStatic.getUserAccountData(emergency.address,0)

                  

                  const expected = tokenPrice.mul(amountBorrowed).div(ethers.utils.parseUnits("1",tokenDec)); //amount in USD

                  console.log("userDat.totalDebtETH.toString(): ", userDat.totalDebtETH.toString())
                  console.log("expected: ", expected)
                  expect( 
                      (Math.abs(Number(userDat.totalDebtETH.toString())-Number(expected)))
                    ).to.be.lte(3, "Did not get debt token"); //USD oracles have 8 decimals
                  
                    console.log("Passed borrow checks\n\n")

                  await expect(
                      lendingPool.connect(emergency).borrow(USDC.address, 0, ethers.utils.parseUnits("1000",tokenDec), '0', await emergency.getAddress())
                    ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);
                    console.log("Passed failed borrow checks\n\n")
                  console.log("Trying to repay")
                  await USDC.connect(emergency).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))
                  await lendingPool.connect(emergency).repay(USDCadd, 0, MAX_UINT_AMOUNT, await emergency.getAddress()); 
                  console.log("Finished tests for ",symbol)
                }
                else {
                  await expect(
                    lendingPool.connect(emergency).borrow(USDCadd, 0, MAX_UINT_AMOUNT, '0', await emergency.getAddress())
                    ).to.be.revertedWith(VL_BORROWING_NOT_ENABLED)
                }
                console.log("-----------------------------------")
                console.log()
                console.log()
                console.log()
            }

            for(let [symbol, address] of Object.entries(tokens)){
              
              //for some reason it's hard to get these tokens
              if(symbol=="WBTC" || symbol=="WETH" || symbol=="wstETH" || symbol=="FRAX" ){
                continue
              }
              console.log("Depositing ",symbol)
              var USDCadd = address
              var USDCABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()
              var USDC = new ethers.Contract(USDCadd,USDCABI)
              const tokenDec = await USDC.connect(signer).decimals();
              const WETHdec = await myWETH.connect(signer).decimals();
              const tokenConfig = config[symbol]
              
              if(symbol!="WETH") {
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
                
                await VELO_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseUnits("0.0", tokenDec), [path], signer.address, deadline,options)
              }
              var signerOrigAmt = await USDC.connect(signer).balanceOf(signer.address)
              //give some to emergency so they can repay debt
              await USDC.connect(signer).approve(emergency.address,ethers.utils.parseEther("100000.0"))
              await USDC.connect(signer).transfer(emergency.address, signerOrigAmt.div(10))

              var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

              expect(
                  signerAmt.toString()
              ).to.not.be.bignumber.equal(0, "Did not get", symbol);


              console.log("Got", signerAmt.toString())



              await USDC.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))

              /************************************************************************************/
              /****************** deposit BAL to pool and then borrow WETH  **********************/ 
              /************************************************************************************/
              const tx = await lendingPool.connect(signer).deposit(USDCadd, 0, signerAmt.toString(), signer.address, '0'); 
              const tx2 = await tx.wait(1);
              console.log("Deposited", symbol)
              console.log("* Gas used: ", tx2.gasUsed)
            }
          });

    }
)

