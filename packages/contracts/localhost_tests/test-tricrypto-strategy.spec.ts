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

makeSuite(
    "Tricrypto2 ",
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
        var triCryptoDepositAbi = fs.readFileSync("./localhost_tests/abis/tricrypto.json").toString()

        it("give WETH to users", async () => {
          const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
          var signer = await contractGetters.getFirstSigner();
          //give signer 1 WETH so he can get LP tokens
          var options = {value: DRE.ethers.utils.parseEther("100.0")}
          await myWETH.connect(signer).deposit(options);
          var signerWeth = await myWETH.connect(signer).balanceOf(signer.address);
          expect(
            signerWeth.toString()
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

          var amounts = [DRE.ethers.utils.parseEther("0"),DRE.ethers.utils.parseEther("0"),DRE.ethers.utils.parseEther("10.0")]

          await myWETH.connect(signer).approve(triCryptoDeposit.address,DRE.ethers.utils.parseEther("10000.0"))

          await triCryptoDeposit.connect(signer).add_liquidity(amounts,DRE.ethers.utils.parseEther("10"))

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

          await CurveToken.connect(signer).approve(lendingPool.address,DRE.ethers.utils.parseEther("1000.0"))
          await lendingPool.connect(signer).deposit(CurveToken.address, 1, DRE.ethers.utils.parseUnits('1'), await signer.getAddress(), '0');
          await lendingPool.connect(signer).deposit(CurveToken.address, 1, DRE.ethers.utils.parseUnits('0.5'), await emergency.getAddress(), '0');

          const addProv = await contractGetters.getLendingPoolAddressesProvider();

          const curveOracleAdd = await addProv.connect(signer).getCurvePriceOracleWrapper();
          var curveOracleAbi = [
            "function getAssetPrice(address asset) public view returns (uint256)"
        ]

        const curveOracle = new DRE.ethers.Contract(curveOracleAdd,curveOracleAbi);

          const pricePerToken = await curveOracle.connect(signer).getAssetPrice(CurveToken.address);
          console.log("pricePerToken: ",pricePerToken)

          await lendingPool.connect(signer).setUserUseReserveAsCollateral(CurveToken.address, 1, true);

          
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

          expect(aTokenHolds.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1.5"), "Did not deposit tricypto2")

          const amount = await strategy.connect(signer).pull();

          const aTokenHoldsAfter = await CurveToken.connect(signer).balanceOf(tricrypto2Tranch1ATokenAddress);
          const strategyHolds = await CurveToken.connect(signer).balanceOf(strategy.address);
          console.log("after atoken is holding : ", aTokenHoldsAfter, " after strategy: ", strategyHolds);

          expect(aTokenHoldsAfter.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0"), "Did not transfer tricypto2 to the booster")
          expect(strategyHolds.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0"), "Did not transfer tricypto2 to the booster")

          var origBalance = await strategy.balanceOfPool();

          console.log("strategy boosted balance: " + origBalance);

          expect(origBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1.5"), "Did not transfer tricypto2 to the booster")

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
                var tendData = (await strategy.tend()); //this will update the interest rate
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
            var strategyEndBoostedBalance = await strategy.balanceOfPool();
            expect(strategyEndBoostedBalance).to.be.gte(DRE.ethers.utils.parseEther("1.5"))
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

