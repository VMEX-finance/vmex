// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;

import rawBRE from "hardhat";
import { utils } from "ethers";
import BigNumber from "bignumber.js";

import { getUserData } from '../test-suites/test-aave/helpers/utils/helpers';
import { calcExpectedStableDebtTokenBalance } from '../test-suites/test-aave/helpers/utils/calculations';
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";

import { ProtocolErrors } from '../helpers/types';
import {getCurvePrice} from "./helpers/curve-calculation";
import {UserAccountData} from "./interfaces/index";
import {almostEqualOrEqual} from "./helpers/almostEqual";
import { DRE, increaseTime } from "../helpers/misc-utils";
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

        const TRANCHE = 1;    // tranche 1 has lp positions
        const STABLE_RATE = 1;

        const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        const WETH_ABI = [
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


        const TRICRYPTO2_ADDR = "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff"
        const CURVE_TOKEN_ABI = [
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


        const TRICRYPTO2_CURVE_POOL_ADDR = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46" //0xD51a44d3FaE010294C616388b506AcdA1bfAAE46 this is the address given on curve.fi/contracts
        const TRICRYPTO2_CURVE_POOL_ABI = fs.readFileSync("./localhost_tests/abis/tricrypto.json").toString()

        const CURVE_ORACLE_ABI = [
            "function getAssetPrice(address asset) public view returns (uint256)"
        ]

        const CONVEX_BOOSTER = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
        const CONVEX_BOOSTER_ABI = [
          "function isShutdown() external view returns(bool)",
          "function earmarkRewards(uint256 _pid) external returns(bool)"
        ]
        const PID = 38;


        before('Before LendingPool liquidation: set config', () => {
          BigNumber.config({ DECIMAL_PLACES: 0, ROUNDING_MODE: BigNumber.ROUND_DOWN });
        });

        after('After LendingPool liquidation: reset config', () => {
          BigNumber.config({ DECIMAL_PLACES: 20, ROUNDING_MODE: BigNumber.ROUND_HALF_UP });
        });


        it("give WETH to users", async () => {
          const weth = new DRE.ethers.Contract(WETH_ADDR,WETH_ABI)
          var borrower = await contractGetters.getFirstSigner();
          //give borrower 100 WETH so he can get LP tokens
          var options = {value: DRE.ethers.utils.parseEther("10000.0")}
          await weth.connect(borrower).deposit(options);
          var signerWeth = await weth.connect(borrower).balanceOf(borrower.address);
          expect(
            signerWeth.toString()
          ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("10000.0"), "Did not get WETH");
        });

        it("deposit WETH", async () => {
          //emergency deposits 100 WETH to pool to provide liquidity
          const weth = new DRE.ethers.Contract(WETH_ADDR,WETH_ABI)
          const emergency = (await DRE.ethers.getSigners())[1]
          const lendingPool = await contractGetters.getLendingPool();

          const dataProv = await contractGetters.getAaveProtocolDataProvider();

          var options = {value: DRE.ethers.utils.parseEther("10000.0")}
          await weth.connect(emergency).deposit(options);
          var signerWeth = await weth.connect(emergency).balanceOf(emergency.address);

          expect(
            signerWeth.toString()
          ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("10000.0"), "Did not get WETH");

          await weth.connect(emergency).approve(lendingPool.address,DRE.ethers.utils.parseEther("10000.0"))

          await lendingPool.connect(emergency).deposit(weth.address, TRANCHE, DRE.ethers.utils.parseUnits('1000'), await emergency.getAddress(), '0');
          const resDat = await dataProv.getReserveData(weth.address, TRANCHE)

          expect(
            resDat.availableLiquidity.toString()
          ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1000.0"), "Did not get WETH");
        });

        it("get LP tokens", async () => {
          //emergency deposits 100 WETH to pool to provide liquidity
          const weth = new DRE.ethers.Contract(WETH_ADDR,WETH_ABI)
          const borrower = await contractGetters.getFirstSigner();

          const triCryptoDeposit = new DRE.ethers.Contract(TRICRYPTO2_CURVE_POOL_ADDR,TRICRYPTO2_CURVE_POOL_ABI)

          var amounts = [
            DRE.ethers.utils.parseEther("0"),
            DRE.ethers.utils.parseEther("0"),
            DRE.ethers.utils.parseEther("10000.0")]

          await weth.connect(borrower).approve(triCryptoDeposit.address,DRE.ethers.utils.parseEther("10000.0"))

          await triCryptoDeposit.connect(borrower).add_liquidity(amounts,DRE.ethers.utils.parseEther("10"))

          // 0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF (this is EXACT MATCH, used to be deployed in our system),
          // 0xc4AD29ba4B3c580e6D59105FFf484999997675Ff  (this is similar match, THIS IS ADDRESS ON CURVE FRONTEND, WHICH IS WHAT WE NEED TO USE),  however, this is the address that triCryptoDeposit address uses. So I think we need to redeploy with this token


          const tricrypto2Token = new DRE.ethers.Contract(TRICRYPTO2_ADDR,CURVE_TOKEN_ABI)
          var mycurve = await tricrypto2Token.connect(borrower).balanceOf(borrower.address)
          expect(
            mycurve.toString()
          ).to.not.be.equal("0", "Did not get curve"); //this can be general, we assume that curve's stuff is correct
        });

        it("deposit 100 LP and borrow WETH", async () => {
          //emergency deposits 100 WETH to pool to provide liquidity
          const weth = new DRE.ethers.Contract(WETH_ADDR,WETH_ABI)
          const borrower = await contractGetters.getFirstSigner();
          const lendingPool = await contractGetters.getLendingPool();
          const tricrypto2Token = new DRE.ethers.Contract(TRICRYPTO2_ADDR,CURVE_TOKEN_ABI);

          const amountTricryptoToDeposit = "100";

          await tricrypto2Token.connect(borrower).approve(lendingPool.address,DRE.ethers.utils.parseEther("1000"))
          await lendingPool.connect(borrower).deposit(tricrypto2Token.address, TRANCHE, DRE.ethers.utils.parseUnits(amountTricryptoToDeposit), await borrower.getAddress(), '0');
          await lendingPool.connect(borrower).setUserUseReserveAsCollateral(tricrypto2Token.address, TRANCHE, true);

          var userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,TRANCHE,false)

          /*
          //calcualte expected amount (not done here since USDT has different number of decimals)
          var curvePoolAdd = '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46';
          var curvePoolAbi = [
              "function get_virtual_price() external view returns (uint256)"
          ]
          var curvePool = new DRE.ethers.Contract(curvePoolAdd,curvePoolAbi);
          var vprice = await curvePool.connect(borrower).get_virtual_price();
          const aaveOracle = await contractGetters.getAaveOracle();
          const prices = [await aaveOracle.connect(borrower).getAssetPrice("0xdAC17F958D2ee523a2206206994597C13D831ec7"), //usdt
          await aaveOracle.connect(borrower).getAssetPrice("0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"), //wbtc
          await aaveOracle.connect(borrower).getAssetPrice("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")] //weth
          const pricePerToken = BigNumber.from(getCurvePrice(vprice,prices).toString()).mul(10**18)

          //since we only deposit 1 whole tricrypto, this is the total collateral in our vault
          console.log("pricePerToken: ",pricePerToken)
          */
          const addProv = await contractGetters.getLendingPoolAddressesProvider();

          const curveOracleAddr = await addProv.connect(borrower).getCurvePriceOracleWrapper();

          const curveOracle = new DRE.ethers.Contract(curveOracleAddr,CURVE_ORACLE_ABI);

          const pricePerToken = await curveOracle.connect(borrower).getAssetPrice(tricrypto2Token.address);
          console.log("pricePerToken: ",pricePerToken)
          expect(
            userData.totalCollateralETH.toString()
            ).to.be.bignumber.equal(pricePerToken.mul(amountTricryptoToDeposit).toString(), "Did not deposit tricypto2");

          console.log("availableBorrowsETH: ",userData.availableBorrowsETH)
          const amountWETHToBorrow =
            new BigNumber(userData.availableBorrowsETH.toString())
              .times(0.9)
              .toFixed(0)

          console.log("Trying to borrow ", amountWETHToBorrow, " of WETH");

          //borrow 90% of available borrows from TRANCHE 1, 1 means stable rate
          await lendingPool.connect(borrower).borrow(weth.address, TRANCHE, amountWETHToBorrow, STABLE_RATE, '0', borrower.address);

          userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,1,false)
          console.log("USER DATA: ", userData);
          expect(
            userData.totalDebtETH.toString()
          ).to.be.bignumber.equal(amountWETHToBorrow, "Did not deposit tricypto2");
        });

        // it("strategy pulls LP and invests", async () => {
        //   const lendingPool = await contractGetters.getLendingPool();
        //   const strategy = await contractGetters.getTricrypto2Strategy();
        //   const borrower = await contractGetters.getFirstSigner();
        //   const tricrypto2Token = new DRE.ethers.Contract(TRICRYPTO2_ADDR,CURVE_TOKEN_ABI)
        //   const dataProv = await contractGetters.getAaveProtocolDataProvider();

        //   const userReserveData = await dataProv.getUserReserveData(tricrypto2Token.address, TRANCHE, borrower.address);
        //   const tricrypto2Tranch1ATokenAddress =
        //     (await lendingPool.getReserveData(tricrypto2Token.address, TRANCHE)).aTokenAddress;
        //   // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2

        //   const tricrypto2Tranch1AToken =
        //     await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);

        //   const aTokenBalance = await tricrypto2Tranch1AToken.totalSupply();
        //   console.log("tricrypto2 atoken total supply: ", aTokenBalance);

        //   const vTokenAddress = await strategy.connect(borrower).vToken();
        //   console.log("vtoken address: ", vTokenAddress);
        //   const underlying = await strategy.connect(borrower).underlying();
        //   console.log("underlying address: ", underlying);

        //   var CurveToken2 = new DRE.ethers.Contract(underlying,CURVE_TOKEN_ABI)
        //   const aTokenHolds = await CurveToken2.connect(borrower).balanceOf(vTokenAddress);
        //   console.log("atoken is holding : ", aTokenHolds);

        //   const amount = await strategy.connect(borrower).pull();

        //   const aTokenHoldsAfter = await tricrypto2Token.connect(borrower).balanceOf(tricrypto2Tranch1ATokenAddress);
        //   const strategyHolds = await tricrypto2Token.connect(borrower).balanceOf(strategy.address);
        //   console.log("after atoken is holding : ", aTokenHoldsAfter, " after strategy: ", strategyHolds);

        //   var origBalance = await strategy.balanceOfPool();

        //   console.log("strategy boosted balance: " + origBalance);

        //   // check that the user is still healthy after strategy withdraws
        //   let userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,TRANCHE,false)
        //   console.log("USER DATA: ", userData);
        // });

        // it("perform a small withdrawal after some time", async () => {
        //   const lendingPool = await contractGetters.getLendingPool();
        //   const strategy = await contractGetters.getTricrypto2Strategy();
        //   const borrower = await contractGetters.getFirstSigner();
        //   const emergency = (await DRE.ethers.getSigners())[1];
        //   const tricrypto2Token = new DRE.ethers.Contract(TRICRYPTO2_ADDR,CURVE_TOKEN_ABI);

        //   let userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,TRANCHE,false)
        //   console.log("USER DATA BEFORE WAITING LONG TIME: ", userData);

        //   await increaseTime(4100000);
        //   // 2800000 (1 month)- pass
        //   // 4000000 - pass
        //   // 4100000 - fails

        //   userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,TRANCHE,false)
        //   console.log("USER DATA AFTER WAITING LONG TIME: ", userData);

        //   // // updates state of weth and tricrypto2 reserve
        //   await lendingPool.connect(emergency).deposit(WETH_ADDR, TRANCHE, DRE.ethers.utils.parseUnits('1'), await emergency.getAddress(), '0');
        //   console.log("after emergency deposit");
        //   await lendingPool.connect(borrower).deposit(TRICRYPTO2_ADDR, TRANCHE, DRE.ethers.utils.parseUnits('0.001'), await borrower.getAddress(), '0');
        //   console.log("after borrower deposit");

        //   let userDataBeforeWithdraw = await lendingPool.connect(borrower).getUserAccountData(borrower.address,1,false)
        //   console.log("USER DATA BEFORE WITHDRAW: ", userDataBeforeWithdraw);
        //   // user withdraws 0.1 tricrypto2
        //   const tx = await lendingPool.connect(borrower)
        //     .withdraw(
        //       tricrypto2Token.address,
        //       TRANCHE,
        //       DRE.ethers.utils.parseUnits('1'),
        //       await borrower.getAddress());


        //   var strategyBoostedBalance = await strategy.balanceOfPool();
        //   console.log("strategy AFTER WITHDRAW boosted balance: " + strategyBoostedBalance);
        // });

        // it("strategy booster earns interest redeposits", async () => {
        //   const strategy = await contractGetters.getTricrypto2Strategy();

        //   var strategyStartBoostedBalance = await strategy.balanceOfPool();
        //   console.log("strategy START boosted balance: " + strategyStartBoostedBalance);

        //   // increase time by 10 hours
        //   await increaseTime(36000);

        //   var tendData = await strategy.tend();

        //   console.log("strategy tended: ", tendData);

        //   var postBalance = await strategy.balanceOf();
        //   console.log("strategy post balance: ", postBalance);

        //   var strategyBoostedBalance = await strategy.balanceOfPool();
        //   console.log("strategy NEW boosted balance: " + strategyBoostedBalance);
        // });

        // it("user withdraws which withdraws from the booster", async () => {
        //   const lendingPool = await contractGetters.getLendingPool();
        //   const strategy = await contractGetters.getTricrypto2Strategy();
        //   const borrower = await contractGetters.getFirstSigner();
        //   const tricrypto2Token = new DRE.ethers.Contract(TRICRYPTO2_ADDR,CURVE_TOKEN_ABI);

        //   // const tricrypto2Tranch1ATokenAddress =
        //   //   (await lendingPool.getReserveData(tricrypto2Token.address, TRANCHE)).aTokenAddress;
        //   // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2

        //   // const tricrypto2Tranch1AToken =
        //   //   await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);

        //   // // // check that the user is still healthy after strategy withdraws
        //   // let userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,TRANCHE,false)
        //   // console.log("USER DATA BEFORE WAITING LONG TIME: ", userData);

        //   // await increaseTime(4100000);
        //   // // 2800000 (1 month)- passes
        //   // // 4000000 - passes
        //   // // 4100000 - fails

        //   // const emergency = (await DRE.ethers.getSigners())[1];
        //   // const booster = new DRE.ethers.Contract(CONVEX_BOOSTER, CONVEX_BOOSTER_ABI);
        //   // // const isPoolShutDown = await booster.connect(emergency).isShutdown();
        //   // // console.log("ispoolshut down?", isPoolShutDown);

        //   // // reset the rewards in the booster
        //   // booster.connect(emergency).earmarkRewards(PID);

        //   // // updates state of weth and tricrypto2 reserve
        //   // await lendingPool.connect(emergency).deposit(WETH_ADDR, TRANCHE, DRE.ethers.utils.parseUnits('1'), await emergency.getAddress(), '0');
        //   // await lendingPool.connect(borrower).deposit(TRICRYPTO2_ADDR, TRANCHE, DRE.ethers.utils.parseUnits('0.0000001'), await borrower.getAddress(), '0');

        //   // userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,TRANCHE,false)
        //   // console.log("USER DATA AFTER WAITING LONG TIME: ", userData);

        //   // // var tendData = await strategy.tend();
        //   // // console.log("strategy tended: ", tendData);

        //   // // var postBalance = await strategy.balanceOf();
        //   // // console.log("strategy post balance: ", postBalance);

        //   let userDataBeforeWithdraw = await lendingPool.connect(borrower).getUserAccountData(borrower.address,1,false)
        //   console.log("USER DATA BEFORE WITHDRAW: ", userDataBeforeWithdraw);

        //   // user withdraws 0.1 tricrypto2
        //   const tx = await lendingPool.connect(borrower)
        //     .withdraw(
        //       tricrypto2Token.address,
        //       TRANCHE,
        //       DRE.ethers.utils.parseUnits('0.1'),
        //       await borrower.getAddress());

        //   const receipt = await tx.wait();
        //   receipt.events?.filter((x) => {console.log("event: ", x.event)})

        //   var strategyBoostedBalance = await strategy.balanceOfPool();
        //   console.log("strategy AFTER WITHDRAW boosted balance: " + strategyBoostedBalance);

        //   // check that the user is still healthy after strategy withdraws
        //   const userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,1,false)
        //   console.log("USER DATA: ", userData);
        // });

        // it('Drop the health factor below 1', async () => {
        //   const borrower = await contractGetters.getFirstSigner();
        //   const emergency = (await DRE.ethers.getSigners())[1];
        //   const lendingPool = await contractGetters.getLendingPool();

        //   // check that the user is still healthy after strategy withdraws
        //   let userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,TRANCHE,false)
        //   console.log("USER DATA BEFORE WAITING LONG TIME: ", userData);

        //   // increase time by 1000000 hours
        //   // await increaseTime(360000000);
        //   // user withdraws most of his funds
        //   const tricrypto2Token = new DRE.ethers.Contract(TRICRYPTO2_ADDR,CURVE_TOKEN_ABI);
        //   const tx = await lendingPool.connect(borrower)
        //     .withdraw(
        //       tricrypto2Token.address,
        //       TRANCHE,
        //       DRE.ethers.utils.parseUnits('0.5'),
        //       await borrower.getAddress());

        //   // updates state of weth and tricrypto2 reserve
        //   await lendingPool.connect(emergency).deposit(WETH_ADDR, TRANCHE, DRE.ethers.utils.parseUnits('1'), await emergency.getAddress(), '0');
        //   await lendingPool.connect(borrower).deposit(TRICRYPTO2_ADDR, TRANCHE, DRE.ethers.utils.parseUnits('0.0000001'), await borrower.getAddress(), '0');

        //   userData = await lendingPool.connect(borrower).getUserAccountData(borrower.address,TRANCHE,false)
        //   console.log("USER DATA AFTER WAITING LONG TIME: ", userData);

        //   expect(userData.healthFactor.toString()).to.be.bignumber.lt(
        //     DRE.ethers.utils.parseUnits('1'),
        //     "Invalid health factor"
        //   );
        // });

        // it('Liquidates the borrow', async () => {
        //   const helpersContract = await contractGetters.getAaveProtocolDataProvider();
        //   const liquidator = (await DRE.ethers.getSigners())[2];
        //   const borrower = await contractGetters.getFirstSigner();
        //   const weth = new DRE.ethers.Contract(WETH_ADDR,WETH_ABI);
        //   const lendingPool = await contractGetters.getLendingPool();
        //   const strategy = await contractGetters.getTricrypto2Strategy();
        //   // const addrProv = await contractGetters.getLendingPoolAddressesProvider();
        //   // const addrProvColAddr = await addrProv.getLendingPoolCollateralManager();
        //   // console.log("addr prov col manager addr ", addrProvColAddr);

        //   const lendingPoolCollateralManager = await contractGetters.getLendingPoolCollateralManager();
        //   const tricrypto2Token = new DRE.ethers.Contract(TRICRYPTO2_ADDR,CURVE_TOKEN_ABI)

        //   //mints weth to the liquidator
        //   var options = {value: DRE.ethers.utils.parseEther("1000.0")}
        //   await weth.connect(liquidator).deposit(options);

        //   //approve protocol to access the liquidator wallet
        //   await weth.connect(liquidator).approve(lendingPool.address, DRE.ethers.utils.parseEther("1000"));

        //   const wethReserveDataBefore = await helpersContract.getReserveData(weth.address, TRANCHE);
        //   const tricrypto2ReserveDataBefore = await helpersContract.getReserveData(tricrypto2Token.address, TRANCHE);

        //   const userReserveDataBefore = await getUserData(
        //     lendingPool,
        //     helpersContract,
        //     weth.address,
        //     TRANCHE.toString(),
        //     borrower.address
        //   );

        //   console.log("user reserve data before liquidation:", userReserveDataBefore);

        //   const amountToLiquidate = userReserveDataBefore.currentStableDebt.div(2).toString();
        //   console.log("amount to liquidate:", amountToLiquidate);

        //   await increaseTime(100);

        //   const tx = await lendingPool
        //   .connect(liquidator)
        //   .liquidationCall(TRICRYPTO2_ADDR, WETH_ADDR, TRANCHE, borrower.address, amountToLiquidate, false);

        //   const userReserveDataAfter = await getUserData(
        //     lendingPool,
        //     helpersContract,
        //     weth.address,
        //     TRANCHE.toString(),
        //     borrower.address
        //     );

        //   console.log("user reserve data after liquidation:", userReserveDataAfter);

        //   const wethReserveDataAfter = await helpersContract.getReserveData(weth.address, TRANCHE);
        //   console.log("WETH reserve after: ", wethReserveDataAfter);
        //   const tricrypto2ReserveDataAfter = await helpersContract.getReserveData(tricrypto2Token.address, TRANCHE);
        //   console.log("tricrypto2 reserve after: ", tricrypto2ReserveDataAfter);

        //   // get the curve oracle and aave oracle
        //   const curveOracle = await contractGetters.getCurvePriceOracleWrapper();
        //   const aaveOracle = await contractGetters.getAaveOracle();

        //   const collateralPrice = await curveOracle.getAssetPrice(tricrypto2Token.address);
        //   const principalPrice = await aaveOracle.getAssetPrice(weth.address);

        //   const collateralDecimals = (
        //     await helpersContract.getReserveConfigurationData(tricrypto2Token.address, TRANCHE)
        //   ).decimals.toString();
        //   const principalDecimals = (
        //     await helpersContract.getReserveConfigurationData(weth.address, TRANCHE)
        //   ).decimals.toString();

        //   const expectedCollateralLiquidated = new BigNumber(principalPrice.toString())
        //     .times(new BigNumber(amountToLiquidate).times(105))
        //     .times(new BigNumber(10).pow(collateralDecimals))
        //     .div(
        //       new BigNumber(collateralPrice.toString()).times(new BigNumber(10).pow(principalDecimals))
        //     )
        //     .div(100)
        //     .decimalPlaces(0, BigNumber.ROUND_DOWN);

        //   console.log("EXPECTED COLLATERAL LIQUIDATED IS:", expectedCollateralLiquidated.toString())

        //   if (!tx.blockNumber) {
        //     expect(false, 'Invalid block number');
        //     return;
        //   }
        //   const txTimestamp = new BigNumber(
        //     (await DRE.ethers.provider.getBlock(tx.blockNumber)).timestamp
        //   );

        //   const stableDebtBeforeTx = calcExpectedStableDebtTokenBalance(
        //     userReserveDataBefore.principalStableDebt,
        //     userReserveDataBefore.stableBorrowRate,
        //     userReserveDataBefore.stableRateLastUpdated,
        //     txTimestamp
        //   );

        //   expect(userReserveDataAfter.currentStableDebt.toString()).to.be.bignumber.almostEqual(
        //     stableDebtBeforeTx.minus(amountToLiquidate).toFixed(0),
        //     'Invalid user debt after liquidation'
        //   );

        //   //the liquidity index of the principal reserve needs to be bigger than the index before
        //   expect(wethReserveDataAfter.liquidityIndex.toString()).to.be.bignumber.gte(
        //     wethReserveDataBefore.liquidityIndex.toString(),
        //     'Invalid liquidity index'
        //   );

        //   //the principal APY after a liquidation needs to be lower than the APY before
        //   expect(wethReserveDataAfter.liquidityRate.toString()).to.be.bignumber.lt(
        //     wethReserveDataBefore.liquidityRate.toString(),
        //     'Invalid liquidity APY'
        //   );

        //   expect(wethReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
        //     new BigNumber(wethReserveDataBefore.availableLiquidity.toString())
        //       .plus(amountToLiquidate)
        //       .toFixed(0),
        //     'Invalid principal available liquidity'
        //   );

        //   expect(tricrypto2ReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
        //     new BigNumber(tricrypto2ReserveDataAfter.availableLiquidity.toString())
        //       .minus(expectedCollateralLiquidated)
        //       .toFixed(0),
        //     'Invalid collateral available liquidity'
        //   );
        // });
    }
)

