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
    "Tricrypto2 ",
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


        it("unpause lending pools", async () => {
          const emergency = (await DRE.ethers.getSigners())[1];
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

          await CurveToken.connect(signer).approve(lendingPool.address,DRE.ethers.utils.parseEther("1000.0"))
          await lendingPool.connect(signer).deposit(CurveToken.address, 1, DRE.ethers.utils.parseUnits('1'), await signer.getAddress(), '0');

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
          const strategy = await contractGetters.getTricrypto2Strategy();
          const signer = await contractGetters.getFirstSigner();
          const emergencyAdmin = (await DRE.ethers.getSigners())[1]
          var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)
          const dataProv = await contractGetters.getAaveProtocolDataProvider();

          const userReserveData = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);

          var userDatBefore:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1)
          const tricrypto2Tranch1ATokenAddress =
            (await lendingPool.getReserveData(CurveToken.address, 1)).aTokenAddress;
          // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2

          const tricrypto2Tranch1AToken =
            await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);

          const aTokenBalance = await tricrypto2Tranch1AToken.totalSupply();
          console.log("tricrypto2 atoken total supply: ", aTokenBalance);

          const vTokenAddress = await strategy.connect(signer).vToken(); //this should be the same as tricrypto2Tranch1AToken
          console.log("vtoken address: ", vTokenAddress);

          expect(tricrypto2Tranch1ATokenAddress).to.be.equal(vTokenAddress, "tricrypto strategy doesn't have correct aToken address");

          const underlying = await strategy.connect(signer).underlying();
          console.log("underlying address: ", underlying);

          var CurveToken2 = new DRE.ethers.Contract(underlying,CurveTokenAddabi) //this is just the tricrypto token
          const aTokenHolds = await CurveToken2.connect(signer).balanceOf(vTokenAddress); //this is seeing how much tricrypto the vTokenAddress is holding
          console.log("atoken is holding : ", aTokenHolds);

          expect(aTokenHolds.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1"), "Did not deposit tricypto2")

          const amount = await strategy.connect(signer).pull();

          const aTokenHoldsAfter = await CurveToken.connect(signer).balanceOf(tricrypto2Tranch1ATokenAddress);
          const strategyHolds = await CurveToken.connect(signer).balanceOf(strategy.address);
          console.log("after atoken is holding : ", aTokenHoldsAfter, " after strategy: ", strategyHolds);

          expect(aTokenHoldsAfter.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0"), "Did not transfer tricypto2 to the booster")
          expect(strategyHolds.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0"), "Did not transfer tricypto2 to the booster")

          var origBalance = await strategy.balanceOfPool();

          console.log("strategy boosted balance: " + origBalance);

          expect(origBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1"), "Did not transfer tricypto2 to the booster")

          // check that the user is still healthy after strategy withdraws
          var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1)
          console.log("USER DATA: ", userData);

          
          expect(userDatBefore.totalCollateralETH).to.be.almostEqualOrEqual(userData.totalCollateralETH);
        });

        it("strategy booster earns interest redeposits", async () => {
          const lendingPool = await contractGetters.getLendingPool();
          const strategy = await contractGetters.getTricrypto2Strategy();
          const signer = await contractGetters.getFirstSigner();
          const emergencyAdmin = (await DRE.ethers.getSigners())[1]
          const dataProv = await contractGetters.getAaveProtocolDataProvider();
          var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)

          var strategyStartBoostedBalance = await strategy.balanceOfPool();
          console.log("strategy START boosted balance: " + strategyStartBoostedBalance);
          expect(strategyStartBoostedBalance).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1"), "Booster starts with one");
          
          var userReserveData = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
          expect(userReserveData.currentATokenBalance).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1"), "User still needs the aTokens of original deposit");

          var userReserveData = await dataProv.getUserReserveData(CurveToken.address, 1, "0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c");
          expect(userReserveData.currentATokenBalance).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0"), "Admin starts with nothing");

          // increase time by 24 hours
          await DRE.ethers.provider.send("evm_increaseTime", [86400])

          // var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData("0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c",1)
          // console.log("VMEX ADMIN DATA before tend: ", userData); //now the user collateral increases slightly since liquidity rate increases a little, so your atoken amount also increases a little

          expect(await strategy.calculateAverageRate()).to.be.bignumber.equal(BigNumber.from("0"), "rate starts at zero");
          console.log("before tend: ");
          var tendData = await strategy.tend(); //this will update the interest rate

          expect(await strategy.calculateAverageRate()).to.be.bignumber.equal(BigNumber.from("15523416873587429285714285"), "rate is now not zero"); //again this might be different with different block to fork
          
          // increase time by 24 hours
          await DRE.ethers.provider.send("evm_increaseTime", [86400]) 
          console.log("after tend: ");
          await lendingPool.connect(signer).deposit(CurveToken.address, 1, DRE.ethers.utils.parseUnits('0.001'), await emergencyAdmin.getAddress(), '0'); //deposit something for emergency so reserve rates are updated

          var strategyBoostedBalance = await strategy.balanceOfPool();

          console.log("strategyBoostedBalance: ",strategyBoostedBalance)

          expect(strategyBoostedBalance).to.be.bignumber.equal(BigNumber.from("1000297709364698937")); //note this might fail if we are using another block to fork

          
          var userReserveData = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
          //can't hardcode these values since based on current timestamp, it might be a bit more or less?
          //.div(BigNumber.from("10000000000")) is to round to account for those errors
          expect(userReserveData.currentATokenBalance.div(BigNumber.from("100000000000"))).to.be.bignumber.equal(BigNumber.from("1000076558709855637").div(BigNumber.from("100000000000")), "Admin gets 10% of the tricrypto generated");  //user doesn't exactly have the other portion of aTokens since it's based on a moving average

          var userReserveData = await dataProv.getUserReserveData(CurveToken.address, 1, "0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c");
          
        //   strategyBoostedBalance.sub(DRE.ethers.utils.parseEther("1")).div(10)//not exactly 10% since the 24 hour interest is also applied
          expect(userReserveData.currentATokenBalance.div(BigNumber.from("1000000"))).to.be.bignumber.equal(BigNumber.from("29773215694381").div(BigNumber.from("1000000")), "Admin gets 10% of the tricrypto generated"); 

          var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1)
          console.log("USER DATA after tend: ", userData); //now the user collateral increases slightly since liquidity rate increases a little, so your atoken amount also increases a little
          expect(userData.totalCollateralETH.div(BigNumber.from("100000000000"))).to.be.bignumber.equal(BigNumber.from("596930797180116849").div(BigNumber.from("100000000000")));

          // NOTICE: confirmed that oracle price will increase after tending
        });


        it("strategy booster earns interest redeposits 10 times, make sure that you're not overdrafting", async () => {
            const lendingPool = await contractGetters.getLendingPool();
            const strategy = await contractGetters.getTricrypto2Strategy();
            const signer = await contractGetters.getFirstSigner();
            const emergencyAdmin = (await DRE.ethers.getSigners())[1]
            const dataProv = await contractGetters.getAaveProtocolDataProvider();
            var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)
            
            //with 5 and 10, get uniswap error
            for(let i = 0; i<2;i++){
                //in last test, already waited 24 hours. Can try tending again first
                var tendData = await strategy.tend(); //this will update the interest rate
                // increase time by 24 hours
                await DRE.ethers.provider.send("evm_increaseTime", [86400]) 

            await lendingPool.connect(signer).deposit(CurveToken.address, 1, DRE.ethers.utils.parseUnits('0.001'), await emergencyAdmin.getAddress(), '0'); //deposit something for emergency so reserve rates are updated
            }
            
            console.log("strategy.calculateAverageRate(): ", await strategy.calculateAverageRate())
            //expect(await strategy.calculateAverageRate()).to.be.bignumber.equal(BigNumber.from("15523416873587429285714285"), "rate is now not zero"); //again this might be different with different block to fork
  
            var strategyBoostedBalance = await strategy.balanceOfPool();
  
            console.log("strategyBoostedBalance: ",strategyBoostedBalance)
  
            //expect(strategyBoostedBalance).to.be.bignumber.equal(BigNumber.from("1000297709364698937")); //note this might fail if we are using another block to fork
  
            
            var userReserveDataSigner = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
            //can't hardcode these values since based on current timestamp, it might be a bit more or less?
            //.div(BigNumber.from("10000000000")) is to round to account for those errors
            console.log("userReserveDataSigner.currentATokenBalance signer: ", userReserveDataSigner.currentATokenBalance)
            //expect(userReserveData.currentATokenBalance.div(BigNumber.from("10000000000"))).to.be.bignumber.equal(BigNumber.from("1000076558709855637").div(BigNumber.from("10000000000")), "Admin gets 10% of the tricrypto generated");  //user doesn't exactly have the other portion of aTokens since it's based on a moving average
  
            var userReserveDataAdmin = await dataProv.getUserReserveData(CurveToken.address, 1, "0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c");
            
          //   strategyBoostedBalance.sub(DRE.ethers.utils.parseEther("1")).div(10)//not exactly 10% since the 24 hour interest is also applied
            console.log("userReserveDataAdmin.currentATokenBalance vmex admin:",userReserveDataAdmin.currentATokenBalance)  
          //expect(userReserveData.currentATokenBalance.div(BigNumber.from("1000000"))).to.be.bignumber.equal(BigNumber.from("29773215694381").div(BigNumber.from("1000000")), "Admin gets 10% of the tricrypto generated"); 
  
            var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1)
            console.log("USER DATA after tend: ", userData); //now the user collateral increases slightly since liquidity rate increases a little, so your atoken amount also increases a little
            //expect(userData.totalCollateralETH.div(BigNumber.from("100000000000"))).to.be.bignumber.equal(BigNumber.from("596930797180116849").div(BigNumber.from("100000000000")));
            expect(  (strategyBoostedBalance.sub(userReserveDataAdmin.currentATokenBalance.add(userReserveDataSigner.currentATokenBalance))).toNumber()   ).to.be.greaterThan(0)
            // NOTICE: confirmed that oracle price will increase after tending
          });

        it("user withdraws which withdraws from the booster", async () => {
          const lendingPool = await contractGetters.getLendingPool();
          const strategy = await contractGetters.getTricrypto2Strategy();
          const signer = await contractGetters.getFirstSigner();
          const emergencyAdmin = (await DRE.ethers.getSigners())[1]
          var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)

          const tricrypto2Tranch1ATokenAddress =
            (await lendingPool.getReserveData(CurveToken.address, 1)).aTokenAddress;
          // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2

          const tricrypto2Tranch1AToken =
            await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);

          // withdraw half funds back to the aToken
          // await lendingPool
          //   .connect(emergencyAdmin)
          //   .withdrawFromStrategy(CurveToken.address, 1, DRE.ethers.utils.parseUnits('0.5'));

          // user withdraws half of his funds
          await lendingPool.connect(signer)
            .withdraw(
              CurveToken.address,
              1,
              DRE.ethers.utils.parseUnits('0.1'),
              await signer.getAddress());
            
          

          var strategyBoostedBalance = await strategy.balanceOfPool();
          console.log("strategy AFTER WITHDRAW boosted balance: " + strategyBoostedBalance);

          // check that the user is still healthy after strategy withdraws
          let userData = await lendingPool.connect(signer).getUserAccountData(signer.address,1)
          console.log("USER DATA: ", userData);
        });
    }
)

