// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";
import rawBRE from "hardhat";
import { BigNumber, utils } from "ethers";
import { ProtocolErrors } from '../helpers/types';
import {getCurvePrice} from "./helpers/curve-calculation";
import {UserAccountData} from "./interfaces/index";
import {almostEqualOrEqual} from "./helpers/almostEqual";
import {calculateExpectedInterest, calculateUserStake, calculateAdminInterest} from "./helpers/strategy-interest";
chai.use(function (chai: any, utils: any) {
  chai.Assertion.overwriteMethod(
    "almostEqualOrEqual",
    function (original: any) {
      return function (this: any, expected: UserAccountData) {
        const actual = <UserAccountData>this._obj;

        almostEqualOrEqual.apply(this, [expected, actual]);
      };
    }
  );
});

before(async () => {
    await rawBRE.run("set-DRE");

    console.log("\n***************");
    console.log("DRE finished");
    console.log("***************\n");
  });
makeSuite(
    "3pool ",
    () => {
      const reserveFactor = BigNumber.from(1000);
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


        

          it("give WETH to users", async () => {
            const lendingPool = await contractGetters.getLendingPool();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            var signer = await contractGetters.getFirstSigner();
            //give signer 1 WETH so he can get LP tokens
            var options = {value: DRE.ethers.utils.parseEther("1.0")}
            await myWETH.connect(signer).deposit(options);
            var signerWeth = await myWETH.connect(signer).balanceOf(signer.address);
            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1.0"), "Did not get WETH");

            await myWETH.connect(signer).approve(lendingPool.address,DRE.ethers.utils.parseEther("100.0"))

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

          it("Uniswap ETH for DAI", async () => {
            const DAI = new DRE.ethers.Contract(DAIadd,DAI_ABI)
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const emergency = (await DRE.ethers.getSigners())[1]
            var signer = await contractGetters.getFirstSigner();
            const lendingPool = await contractGetters.getLendingPool();

            const dataProv = await contractGetters.getAaveProtocolDataProvider();

            const UNISWAP_ROUTER_CONTRACT = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI)

            const path = [myWETH.address, DAI.address];
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

            //emergency deposits 100 WETH to pool to provide liquidity
            var options = {value: ethers.utils.parseEther("1000.0")}

            await UNISWAP_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseEther("1000000.0"), path, signer.address, deadline,options)

            var signerDAI = await DAI.connect(signer).balanceOf(signer.address)

            expect(
                signerDAI.toString()
            ).to.not.be.bignumber.equal(0, "Did not get DAI");
          });

          it("get LP tokens", async () => {
            //emergency deposits 100 WETH to pool to provide liquidity
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const emergency = (await DRE.ethers.getSigners())[1]
            var signer = await contractGetters.getFirstSigner();
            const DAI = new DRE.ethers.Contract(DAIadd,DAI_ABI)
            const lendingPool = await contractGetters.getLendingPool();

            var triCryptoDeposit = new DRE.ethers.Contract(triCryptoDepositAdd,triCryptoDepositAbi)

            var amounts = [ethers.utils.parseEther("10000"),ethers.utils.parseEther("0"),ethers.utils.parseEther("0")]

            await DAI.connect(signer).approve(triCryptoDeposit.address,ethers.utils.parseEther("100000"))

            // await triCryptoDeposit.connect(signer).calc_token_amount([10**2, 10**2,10**2],true)
            await triCryptoDeposit.connect(signer).add_liquidity(amounts,ethers.utils.parseEther("0.1"))

            var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)
            var mycurve = await CurveToken.connect(signer).balanceOf(signer.address)

            console.log("my curve amount ",mycurve)

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
            await lendingPool.connect(signer).deposit(CurveToken.address, 1, DRE.ethers.utils.parseUnits('1000'), await signer.getAddress(), '0');
            await lendingPool.connect(signer).deposit(CurveToken.address, 1, DRE.ethers.utils.parseUnits('500'), await emergency.getAddress(), '0');

            await lendingPool.connect(signer).setUserUseReserveAsCollateral(CurveToken.address, 1, true);

            var userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)

            const addProv = await contractGetters.getLendingPoolAddressesProvider();

            const curveOracleAdd = await addProv.connect(signer).getCurvePriceOracleWrapper();
            var curveOracleAbi = [
                "function getAssetPrice(address asset) public view returns (uint256)"
            ]

            const curveOracle = new DRE.ethers.Contract(curveOracleAdd,curveOracleAbi);

            const pricePerToken = await curveOracle.connect(signer).getAssetPrice(CurveToken.address);
            console.log("pricePerToken: ",pricePerToken)
            var col = BigNumber.from(pricePerToken.toString()).mul(1000)
            expect(
              userDat.totalCollateralETH.toString()
            ).to.be.bignumber.equal(col.toString(), "Did not deposit 3crv");

            await lendingPool.connect(signer).borrow(myWETH.address, 1, DRE.ethers.utils.parseEther("0.01"), 1, '0', signer.address);

            userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)

            expect(
              userDat.totalDebtETH.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.01"), "Did not get debt token");


            var signerWeth = await myWETH.connect(signer).balanceOf(signer.address);

            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1.01"), "Did not get WETH");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, DRE.ethers.utils.parseEther("1000"), 1, '0', signer.address)
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);
          });

          it("strategy pulls LP and invests", async () => {
            const lendingPool = await contractGetters.getLendingPool();
            
            const signer = await contractGetters.getFirstSigner();
            const emergencyAdmin = (await DRE.ethers.getSigners())[1]
            var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)
            const dataProv = await contractGetters.getAaveProtocolDataProvider();
  
            const userReserveData = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
  
            var userDatBefore:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)
            const tricrypto2Tranch1ATokenAddress =
              (await lendingPool.getReserveData(CurveToken.address, 1)).aTokenAddress;
            // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2
  
            const tricrypto2Tranch1AToken =
              await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);
  
            const aTokenBalance = await tricrypto2Tranch1AToken.totalSupply();
            console.log("tricrypto2 atoken total supply: ", aTokenBalance);
  
            const strategy = await contractGetters.getCrvLpStrategy(tricrypto2Tranch1AToken.getStrategy()); //get specific implementation of the strategy
  
            const vTokenAddress = await strategy.connect(signer).vToken(); //this should be the same as tricrypto2Tranch1AToken
            console.log("vtoken address: ", vTokenAddress);
  
            expect(tricrypto2Tranch1ATokenAddress).to.be.equal(vTokenAddress, "tricrypto strategy doesn't have correct aToken address");
  
            const underlying = await strategy.connect(signer).underlying();
            console.log("underlying address: ", underlying);
  
            var CurveToken2 = new DRE.ethers.Contract(underlying,CurveTokenAddabi) //this is just the tricrypto token
            const aTokenHolds = await CurveToken2.connect(signer).balanceOf(vTokenAddress); //this is seeing how much tricrypto the vTokenAddress is holding
            console.log("atoken is holding : ", aTokenHolds);
  
            expect(aTokenHolds.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1500"), "Did not deposit tricypto2")
  
            const amount = await strategy.connect(signer).pull();
  
            const aTokenHoldsAfter = await CurveToken.connect(signer).balanceOf(tricrypto2Tranch1ATokenAddress);
            const strategyHolds = await CurveToken.connect(signer).balanceOf(strategy.address);
            console.log("after atoken is holding : ", aTokenHoldsAfter, " after strategy: ", strategyHolds);
  
            expect(aTokenHoldsAfter.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0"), "Did not transfer tricypto2 to the booster")
            expect(strategyHolds.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0"), "Did not transfer tricypto2 to the booster")
  
            var origBalance = await strategy.balanceOfPool();
  
            console.log("strategy boosted balance: " + origBalance);
  
            expect(origBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1500"), "Did not transfer tricypto2 to the booster")
  
            // check that the user is still healthy after strategy withdraws
            var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)
            console.log("USER DATA: ", userData);
  
            
            expect(userDatBefore.totalCollateralETH).to.be.almostEqualOrEqual(userData.totalCollateralETH);
          });
  
          it("strategy booster earns interest redeposits", async () => {
            const lendingPool = await contractGetters.getLendingPool();
            
            const signer = await contractGetters.getFirstSigner();
            const emergencyAdmin = (await DRE.ethers.getSigners())[1]
            const dataProv = await contractGetters.getAaveProtocolDataProvider();
            var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)
  
            const tricrypto2Tranch1ATokenAddress =
              (await lendingPool.getReserveData(CurveToken.address, 1)).aTokenAddress;
            // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2
  
            const tricrypto2Tranch1AToken =
              await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);
  
              const strategy = await contractGetters.getCrvLpStrategy(tricrypto2Tranch1AToken.getStrategy()); //get specific implementation of the strategy
  
              for(let i = 0; i<3;i++){
                  var strategyStartBoostedBalance = await strategy.balanceOfPool();
                  console.log("strategy START boosted balance: " + strategyStartBoostedBalance);
                  // increase time by 24 hours
                  await DRE.ethers.provider.send("evm_increaseTime", [86400])
                  const aTokenBalance = await tricrypto2Tranch1AToken.totalSupply();
  
                  var userReserveDataSignerBefore = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
                  var userReserveDataEmergBefore = await dataProv.getUserReserveData(CurveToken.address, 1, emergencyAdmin.address);
                  var userReserveDataAdminBefore = await dataProv.getUserReserveData(CurveToken.address, 1, "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49");
  
                  var signerStake = calculateUserStake(userReserveDataSignerBefore.currentATokenBalance, aTokenBalance )
                  var emergStake = calculateUserStake(userReserveDataEmergBefore.currentATokenBalance, aTokenBalance )
                  var adminStake = calculateUserStake(userReserveDataAdminBefore.currentATokenBalance, aTokenBalance)
  
                  console.log("signerStake: ", signerStake)
                  console.log("Amount earned: ",(await strategy.earned()))
                  try{
                      await strategy.tend(); //this will update the interest rate
                  } catch {
                    i--;
                    continue;
                  }
                  // var rc = await tendData.wait();
                  // var event = rc.events.find(event => event.event === 'InterestRateUpdated');
                  // console.log("InterestRateUpdated data: ",event)
  
                  var strategyBoostedBalance = await strategy.balanceOfPool();
  
                  console.log("strategyBoostedBalance: ",strategyBoostedBalance)
  
                  expect(strategyBoostedBalance).to.be.not.bignumber.equal(BigNumber.from("0")); //note this might fail if we are using another block to fork.  1000297709364698937
  
                  
                  var userReserveDataSigner = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
                  
                  console.log("signer userReserveData.currentATokenBalance: ",userReserveDataSigner.currentATokenBalance )
                  var actualSignerInterest = userReserveDataSigner.currentATokenBalance.sub(userReserveDataSignerBefore.currentATokenBalance);
                  var expectedSignerInterest = calculateExpectedInterest(strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor, signerStake);
                  expect(actualSignerInterest
                    .sub(expectedSignerInterest).toNumber())
                    .to.be.lessThan(10).and.greaterThan(-10);
                  
                  var actualSignerRate = actualSignerInterest.mul("1000000000000000000000000000").div(userReserveDataSignerBefore.currentATokenBalance).mul(365)
                  var expectedSignerRate = await strategy.getLatestRate();
                  console.log("actualSignerRate: ", actualSignerRate)
                  console.log("expectedSignerRate: ", expectedSignerRate)
                  if(i!=0){
                    expect(actualSignerRate.div("1000000000000000000000000")
                    .sub(expectedSignerRate.div("1000000000000000000000000")).toNumber())
                    .to.be.lessThan(10).and.greaterThan(-10);
                  }
                  
  
                  
                  var userReserveDataEmerg = await dataProv.getUserReserveData(CurveToken.address, 1, emergencyAdmin.address);
                  console.log("emergency userReserveData.currentATokenBalance: ",userReserveDataEmerg.currentATokenBalance )
                  var actualEmergInterest = userReserveDataEmerg.currentATokenBalance.sub(userReserveDataEmergBefore.currentATokenBalance);
                  var expectedEmergInterest = calculateExpectedInterest(strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor, emergStake);
                  expect(actualEmergInterest
                    .sub(expectedEmergInterest).toNumber())
                    .to.be.lessThan(10).and.greaterThan(-10);
  
  
                  var userReserveDataAdmin = await dataProv.getUserReserveData(CurveToken.address, 1, "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49");
                console.log("vmex admin userReserveData.currentATokenBalance: ",userReserveDataAdmin.currentATokenBalance )
                var actualAdminInterest = userReserveDataAdmin.currentATokenBalance.sub(userReserveDataAdminBefore.currentATokenBalance);
                var expectedAdminInterest = calculateExpectedInterest(strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor, adminStake)
                  .add(calculateAdminInterest(strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor));
                expect(
                  (actualAdminInterest
                  .sub(expectedAdminInterest).toNumber())
                  ).to.be.lessThan(10).and.greaterThan(-10);
  
                expect(
                  userReserveDataSigner.currentATokenBalance
                  .add(userReserveDataAdmin.currentATokenBalance)
                  .add(userReserveDataEmerg.currentATokenBalance).div(100)
                  ).to.be.almostEqualOrEqual(strategyBoostedBalance.div(100)); 
              }
            var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)
            console.log("USER DATA after tend: ", userData); //now the user collateral increases slightly since liquidity rate increases a little, so your atoken amount also increases a little
            // NOTICE: confirmed that oracle price will increase after tending
          });
  
  
          it("all users withdraws which withdraws from the booster", async () => {
            const lendingPool = await contractGetters.getLendingPool();
            const signer = await contractGetters.getFirstSigner();
            const emergencyAdmin = (await DRE.ethers.getSigners())[1]
            const dataProv = await contractGetters.getAaveProtocolDataProvider();
            var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)

            await lendingPool.connect(signer)
              .repay(
                myWETH.address,
                1,
                DRE.ethers.utils.parseEther("1.0"),
                1,
                await signer.getAddress());
                var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)
                console.log("USER DATA after repay: ", userData);
            const tricrypto2Tranch1ATokenAddress =
              (await lendingPool.getReserveData(CurveToken.address, 1)).aTokenAddress;
            // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2
  
            const tricrypto2Tranch1AToken =
              await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);
  
              const strategy = await contractGetters.getCrvLpStrategy(tricrypto2Tranch1AToken.getStrategy()); //get specific implementation of the strategy
  
            await lendingPool.connect(signer)
              .withdraw(
                CurveToken.address,
                1,
                (await dataProv.getUserReserveData(CurveToken.address, 1, signer.address)).currentATokenBalance, //withdraw all
                await signer.getAddress());
              
                await lendingPool.connect(emergencyAdmin)
                .withdraw(
                  CurveToken.address,
                  1,
                  (await dataProv.getUserReserveData(CurveToken.address, 1, emergencyAdmin.address)).currentATokenBalance, //withdraw all
                  await emergencyAdmin.getAddress());
  
            var strategyBoostedBalance = await strategy.balanceOfPool();
            console.log("strategy AFTER WITHDRAW boosted balance: " + strategyBoostedBalance);
            expect((await dataProv.getUserReserveData(CurveToken.address, 1, "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49")).currentATokenBalance.div(100)).to.be.almostEqualOrEqual(strategyBoostedBalance.div(100))
          });
    }
)

