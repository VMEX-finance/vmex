// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { eOptimismNetwork, IChainlinkInternal, ICommonConfiguration, ProtocolErrors } from '../helpers/types';
import { MAX_UINT_AMOUNT } from "../helpers/constants";
import {OptimismConfig} from "../markets/optimism"
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { toBytes32, setStorageAt } from "../helpers/token-fork";
import { getPairsTokenAggregator } from "../helpers/contracts-getters";

const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json")
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

        const VELO_ROUTER_ADDRESS = "0x9c12939390052919aF3155f41Bf4160Fd3666A6f"
        const VELO_ROUTER_ABI = fs.readFileSync("./localhost_tests_OP/abis/velo.json").toString()
        const amountWETH = ethers.utils.parseEther("1.0");
        // [
        //   "function swapExactETHForTokens(uint amountOutMin, route[] calldata routes, address to, uint deadline) external payable returns (uint[] memory amounts)"
        // ]

        it("set heartbeat higher", async () => {
          var signer = await contractGetters.getFirstSigner();
          const addProv = await contractGetters.getLendingPoolAddressesProvider();

          const oracleAdd = await addProv.connect(signer).getPriceOracle();
          const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi.abi);

          const network = "optimism" as any
          const {
            ProtocolGlobalParams: { UsdAddress },
            ReserveAssets,
            ChainlinkAggregator,
            SequencerUptimeFeed,
            ProviderId
          } = OptimismConfig as ICommonConfiguration;
          const reserveAssets = await getParamPerNetwork(ReserveAssets, network);

          const chainlinkAggregators = await getParamPerNetwork(
            ChainlinkAggregator,
            network
          );
          let tokensToWatch = {
            ...reserveAssets,
            USD: UsdAddress,
          };
          
          if (!chainlinkAggregators) {
            throw "chainlinkAggregators is undefined. Check configuration at config directory";
          }
          const [tokens2, aggregators] = getPairsTokenAggregator(
            tokensToWatch,
            chainlinkAggregators,
            OptimismConfig.OracleQuoteCurrency
          );

          const ag2:IChainlinkInternal[] = aggregators.map((el:IChainlinkInternal)=>
          {
            return {
              feed: el.feed,
              heartbeat: 86400
            }
          })

          await oracle.connect(signer).setAssetSources(tokens2, ag2);
        });

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
            const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi.abi);
            const lendingPool = await contractGetters.getLendingPool();
            for(let [symbol, address] of Object.entries(tokens)){
                console.log("Testing ",symbol)
                let slot = -1;
                let keyFirst = true;
                if(symbol=="WBTC"){
                  slot = 0;
                  keyFirst = true;
                }
                else if(symbol=="wstETH"){
                  slot = 1;
                  keyFirst = true;
                }
                else if(symbol=="FRAX"){
                  slot = 0;
                  keyFirst = true;
                }
                else if(symbol=="ThreeCRV"){
                  slot = 26;
                  keyFirst = false;
                }
                else if(symbol=="sUSD3CRV"){
                  slot = 17;
                  keyFirst = false;
                }
                else if(symbol=="wstETHCRV"){
                  slot = 7;
                  keyFirst = false;
                }
                else if(symbol.substring(0,3)=="moo" || symbol.substring(0,4)=="beet" ){
                  slot = 0;
                  keyFirst = true;
                }
                else if(symbol.substring(0,4)=="velo"){
                  slot = 4;
                  keyFirst = true;
                }

                if(symbol=="SUSD"){
                  continue;
                }

                
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
                  } else {
                    index = ethers.utils.solidityKeccak256(
                      ["uint256", "uint256"],
                      [slot, signer.address] // slot, key
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
                var userResDat = await dataProv.getUserReserveData(USDCadd,0,signer.address)
                console.log("Amount of aTokens: ", userResDat.currentATokenBalance.toString())
                expect(Number(userResDat.currentATokenBalance.toString())).to.be.gte(Number(signerAmt.toString()), "Did not get atoken");

                console.log("Passed deposit checks\n")
                if(tokenConfig.borrowingEnabled){
                  console.log("Attempting max borrow of",symbol)
                  const tokenPrice = await oracle.connect(signer).callStatic.getAssetPrice(USDCadd);
                  console.log("Manual check: ",symbol," price is (USD) $",tokenPrice)
                  const wethPrice = await oracle.connect(signer).callStatic.getAssetPrice(WETHadd);
                  console.log("Manual check: weth price is (USD) $",wethPrice)

                  const amountBorrowable = (
                    amountWETH.mul(wethPrice).mul(WETHConfig.baseLTVAsCollateral).mul(ethers.utils.parseUnits("1",tokenDec))
                  ).div
                  (
                    tokenPrice.mul(ethers.utils.parseUnits("1",WETHdec)).mul(tokenConfig.borrowFactor)
                  )
                  const expectedAmountBorrows = amountBorrowable.lt(signerAmt) ? amountBorrowable : signerAmt

                  console.log("Expected amount max borrow: ", expectedAmountBorrows)
                  const amountBorrowed = expectedAmountBorrows.div(10)
                  console.log("Trying to borrow: ", amountBorrowed);

                  var resDat = await lendingPool.connect(signer).getReserveData(USDCadd, 0);
                  const aTokenBalance = await USDC.connect(signer).balanceOf(resDat.aTokenAddress);
                  console.log("atoken balance: ", aTokenBalance);
                  console.log("Amount of aTokens: ", userResDat.currentATokenBalance.toString())
                  const tx = await lendingPool.connect(emergency).borrow(USDCadd, 0, amountBorrowed, '0', await emergency.getAddress()); 
                  
                  var userDat = await lendingPool.connect(emergency).callStatic.getUserAccountData(emergency.address,0)

                  

                  const expected = tokenPrice.mul(amountBorrowed).div(ethers.utils.parseUnits("1",tokenDec)); //amount in USD

                  console.log("userDat.totalDebtETH.toString(): ", userDat.totalDebtETH.toString())
                  console.log("expected: ", expected)
                  expect( 
                      (Math.abs(Number(userDat.totalDebtETH.toString())-Number(expected)))
                    ).to.be.lte(100, "Did not get debt token"); //USD oracles have 8 decimals
                  
                    console.log("Passed borrow checks\n\n")

                  await expect(
                      lendingPool.connect(emergency).borrow(USDC.address, 0, expectedAmountBorrows, '0', await emergency.getAddress())
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

                //Just used to test the limits of gas. Don't run normally, cause will cause HeadersTimeoutError: Headers Timeout Error
                
                // if(Number(tokenConfig.baseLTVAsCollateral)!=0){
                //   //signer has the tokens as collateral. Check gas usage
                //   const tx = await lendingPool.connect(signer).borrow(myWETH.address, 0, ethers.utils.parseEther("0.001"), '0', await signer.getAddress()); 
                //   const tx2 = await tx.wait(1);
                //   console.log("* Gas used for borrowing with all tokens as collateral: ", tx2.gasUsed)

                // }
                console.log("-----------------------------------")
                console.log()
                console.log()
                console.log()
            }
          });

    }
)

