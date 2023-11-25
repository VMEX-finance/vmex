// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE, increaseTime, waitForTx } from "../helpers/misc-utils";

import { BigNumber, ethers, utils } from "ethers";
import { eBaseNetwork, eNetwork, IChainlinkInternal, ICommonConfiguration, ProtocolErrors } from '../helpers/types';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from "../helpers/constants";
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import {setBalance} from "../localhost_tests_utils/helpers/mint-tokens";
import { ConfigNames, loadPoolConfig } from "../helpers/configuration";

const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json")
const network = process.env.FORK
if(!network) throw "No fork"
const poolConfig = loadPoolConfig(network as ConfigNames);
makeSuite(
    "General testing of tokens",
    () => {
        const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW, VL_BORROWING_NOT_ENABLED } = ProtocolErrors;
        const fs = require('fs');
        const contractGetters = require('../helpers/contracts-getters.ts');
        // const lendingPool = await contractGetters.getLendingPool();
        // Load the first signer
        
        const WETHadd = getParamPerNetwork(poolConfig.WETH, network as eNetwork)
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

        const Stakingabi = [
          "function balanceOf(address owner) external view returns (uint256 balance)",
          "function earned(address owner) external view returns (uint256 balance)",
      ];

      const StakingCurveabi = [
        "function balanceOf(address owner) external view returns (uint256 balance)",
        "function claimable_reward(address account, address token) external view returns (uint256 balance)",
    ];

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
            const tokens = getParamPerNetwork(poolConfig.ReserveAssets, network as eNetwork);
            const config = poolConfig.ReservesConfig
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
                if(symbol=="bIB01" || symbol=="bIBTA" || symbol=="USDbC"){
                  continue
                }

                var USDCadd = address
                var USDCABI = fs.readFileSync("./localhost_tests_utils/abis/DAI_ABI.json").toString()
                var USDC = new ethers.Contract(USDCadd,USDCABI)
                const tokenDec = await USDC.connect(signer).decimals();
                const WETHdec = await myWETH.connect(signer).decimals();
                const tokenConfig = config[symbol]

                const origAmt = Math.round(Math.min(10.0, Number(tokenConfig.supplyCap)) * 10**Number(tokenDec))
                await setBalance(address, signer, origAmt.toString())
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

          it("wait and harvest all rewards", async () => {
            increaseTime(50000)
            if(!poolConfig.ExternalStakingContracts) throw "config not set"
            const tokens = getParamPerNetwork(poolConfig.ReserveAssets, network as eNetwork);
            const stakingContracts = getParamPerNetwork(poolConfig.ExternalStakingContracts, network as eNetwork);
            if(!tokens || !stakingContracts){
              return
            }
            var signer = await contractGetters.getFirstSigner();
            const incentivesController = await contractGetters.getIncentivesControllerProxy();
            const lendingPool = await contractGetters.getLendingPool();
            for(let [symbol, externalRewardsData] of Object.entries(stakingContracts)){
              let rewardAdd;//per curve FE, 3crv has not started streaming CRV yet
              if(symbol.substring(0,2)=="yv") {
                rewardAdd = "0x7D2382b1f8Af621229d33464340541Db362B4907"
              }
              if(symbol.substring(1,4)=="AMM") {
                if(network == "optimism") rewardAdd = "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db"
                if(network == "base") rewardAdd = "0x940181a94A35A4569E4529A3CDfB74e38FD98631"
              }
              if(symbol.substring(0,3)=="BPT") {
                rewardAdd = "0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921"
              }
              if(symbol.includes("CRV")) {
                if(network == "optimism") rewardAdd = "0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53" 
                if(network == "arbitrum") rewardAdd = "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978" 
                if(network == "base") rewardAdd = "0xD533a949740bb3306d119CC777fa900bA034cd52"
              }
              if(symbol.substring(0,3)=="CMLT") {
                rewardAdd = "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8"
              }
              console.log("Testing ", symbol);
              var USDCadd = tokens[symbol]
              var USDCABI = fs.readFileSync("./localhost_tests_utils/abis/DAI_ABI.json").toString()
              var yvUSDC = new ethers.Contract(USDCadd,USDCABI)
              const yvUSDCDat = await lendingPool.getReserveData(USDCadd, 0);
              const amountAtoken = await yvUSDC.connect(signer).balanceOf(yvUSDCDat.aTokenAddress)
              const amountIncentivesController = await yvUSDC.connect(signer).balanceOf(incentivesController.address)
              console.log("How much yvUSDC is held in aToken: ", amountAtoken)
              console.log("How much yvUSDC is held in incentives controller: ", )
              expect(amountAtoken).eq(BigNumber.from("0"))
              expect(amountIncentivesController).eq(BigNumber.from("0"))
              
              const stakingAddress = externalRewardsData.address

              let stakingContract;
              if(!symbol.includes("CRV")) stakingContract = new ethers.Contract(stakingAddress, Stakingabi);
              else stakingContract = new ethers.Contract(stakingAddress, StakingCurveabi);
              
              // const amtStaked = await stakingContract.connect(signer).balanceOf(incentivesController.address)
              // let earned
              // if(!symbol.includes("CRV")) earned = await stakingContract.connect(signer).earned(incentivesController.address)
              // else earned = await stakingContract.connect(signer).claimable_reward(incentivesController.address, rewardAdd)
              // console.log("earned: ",earned)
              // // expect(amtStaked).equal(ethers.utils.parseUnits("9.0", await yvUSDC.connect(signer).decimals()))
              // if(Number(earned)==0){
              //   console.log("Not streaming rewards")
              //   //  continue;
              // }
              // expect(earned).gt(0)

              const rewardToken = new ethers.Contract(rewardAdd, WETHabi)
              // const balanceBefore = await rewardToken.connect(signer).balanceOf(incentivesController.address);
              const receipt = await waitForTx(
                await incentivesController.harvestReward(stakingAddress)
              );

              // const balanceAfter = await rewardToken.connect(signer).balanceOf(incentivesController.address);
              // const reward = Number(balanceAfter) - Number(balanceBefore);
              // console.log("true rewards earned: ", reward);
              // console.log("earned: ", earned);
              console.log("-----------------------------------")
              console.log()
              console.log()
              console.log()
            }
          });

          it("Testing withdraw everything", async () => {
            const tokens = await getParamPerNetwork(poolConfig.ReserveAssets, network as eNetwork);
            const config = poolConfig.ReservesConfig
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
                
                var USDCadd = address
                var USDCABI = fs.readFileSync("./localhost_tests_utils/abis/DAI_ABI.json").toString()
                var USDC = new ethers.Contract(USDCadd,USDCABI)
                const dat = await lendingPool.getReserveData(USDCadd, 0)
                if(dat.aTokenAddress==ZERO_ADDRESS){
                  continue
                }
                var userResDat = await dataProv.getUserReserveData(USDCadd,0,signer.address)
                if(userResDat.currentATokenBalance.toString()=="0") {
                  continue;
                }

                /************************************************************************************/
                /****************** deposit BAL to pool and then borrow WETH  **********************/ 
                /************************************************************************************/
                const tx = await lendingPool.connect(signer).withdraw(USDCadd, 0, MAX_UINT_AMOUNT, signer.address); 
                var signerAmt = await USDC.connect(signer).balanceOf(signer.address)

                expect(
                    signerAmt.toString()
                ).to.not.be.bignumber.equal(0, "Did not get back", symbol);

                console.log("Passed withdraw checks\n")
                
                console.log("-----------------------------------")
            }
          });
    }
)

