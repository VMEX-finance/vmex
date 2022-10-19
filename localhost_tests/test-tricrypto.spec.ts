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
          console.log("USER DATA: ", userDat);
          expect(
            userDat.totalDebtETH.toString()
          ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.01"), "Did not deposit tricypto2");
        });

        it("strategy pulls LP and invests", async () => {
          const lendingPool = await contractGetters.getLendingPool();
          const strategy = await contractGetters.getTricrypto2Strategy();
          const signer = await contractGetters.getFirstSigner();
          const emergencyAdmin = (await DRE.ethers.getSigners())[1]
          var CurveToken = new DRE.ethers.Contract(CurveTokenAdd,CurveTokenAddabi)
          const dataProv = await contractGetters.getAaveProtocolDataProvider();

          const userReserveData = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
          const tricrypto2Tranch1ATokenAddress =
            (await lendingPool.getReserveData(CurveToken.address, 1)).aTokenAddress;
          // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2

          const tricrypto2Tranch1AToken =
            await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);

          const aTokenBalance = await tricrypto2Tranch1AToken.totalSupply();
          console.log("tricrypto2 atoken total supply: ", aTokenBalance);

          const vTokenAddress = await strategy.connect(signer).vToken();
          console.log("vtoken address: ", vTokenAddress);
          const underlying = await strategy.connect(signer).underlying();
          console.log("underlying address: ", underlying);

          var CurveToken2 = new DRE.ethers.Contract(underlying,CurveTokenAddabi)
          const aTokenHolds = await CurveToken2.connect(signer).balanceOf(vTokenAddress);
          console.log("atoken is holding : ", aTokenHolds);

          // let filter1 = {
          //     address: strategy.address,
          //     topics: [
          //         // the name of the event, parnetheses containing the data type of each event, no spaces
          //         utils.id("StrategyPullFromLendingPool(address,uint256)")
          //     ]
          // };
          // let filter2 = {
          //     address: strategy.address,
          //     topics: [
          //         // the name of the event, parnetheses containing the data type of each event, no spaces
          //         utils.id("SetWithdrawalMaxDeviationThreshold(uint256)")
          //     ]
          // };

          // DRE.ethers.provider.on(filter1, (addr, val) => {
          //   console.log("withdraw lp", val);
          // })

          // DRE.ethers.provider.on(filter2, (val) => {
          //     console.log("set withdraw to", val);
          // })

          const amount = await strategy.connect(signer).pull();

          const aTokenHoldsAfter = await CurveToken.connect(signer).balanceOf(tricrypto2Tranch1ATokenAddress);
          const strategyHolds = await CurveToken.connect(signer).balanceOf(strategy.address);
          console.log("after atoken is holding : ", aTokenHoldsAfter, " after strategy: ", strategyHolds);

          var origBalance = await strategy.balanceOfPool();

          console.log("strategy boosted balance: " + origBalance);

          // check that the user is still healthy after strategy withdraws
          let userData = await lendingPool.connect(signer).getUserAccountData(signer.address,1)
          console.log("USER DATA: ", userData);
        });

        it("strategy booster earns interest redeposits", async () => {
          const lendingPool = await contractGetters.getLendingPool();
          const strategy = await contractGetters.getTricrypto2Strategy();
          const signer = await contractGetters.getFirstSigner();

          var strategyStartBoostedBalance = await strategy.balanceOfPool();
          console.log("strategy START boosted balance: " + strategyStartBoostedBalance);

          // increase time by 10 hours
          await DRE.ethers.provider.send("evm_increaseTime", [36000])

          var tendData = await strategy.tend();

          console.log("strategy tended: ", tendData);

          var pull = await strategy.pull();

          var strategyBoostedBalance = await strategy.balanceOfPool();
          console.log("strategy NEW boosted balance: " + strategyBoostedBalance);
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

