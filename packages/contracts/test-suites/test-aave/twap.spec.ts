import {BigNumber} from "ethers";

import { DRE } from "../../helpers/misc-utils";
import {
  APPROVAL_AMOUNT_LENDING_POOL,
  oneEther,
} from "../../helpers/constants";
import { convertToCurrencyDecimals } from "../../helpers/contracts-helpers";
import { makeSuite } from "./helpers/make-suite";
import { ProtocolErrors, RateMode } from "../../helpers/types";
import { calcExpectedVariableDebtTokenBalance } from "./helpers/utils/calculations";
import { getUserData, getReserveData } from "./helpers/utils/helpers";

const chai = require("chai");
const { expect } = chai;

makeSuite(
  "Oracle twap test",
  (testEnv) => {
    const {
      VL_COLLATERAL_CANNOT_COVER_NEW_BORROW,
    } = ProtocolErrors;


    let userGlobalDataBeforeManipTest;

    it("Average over 24 hours", async () => {
      const { dai, users, pool, oracle } = testEnv;
      await oracle.updateTWAP(dai.address); //zeros it

      
      var expected:BigNumber =  BigNumber.from("0"); //trapezoid rule, where first and last points are multiplied by 1 but all other points are multiplied by 2

      // expected = expected.add(daiPrice);
      for(let i = 0;i<23;i++){
        var daiPriceBefore = await oracle.getAssetPrice(dai.address);
        await oracle.setAssetPrice(
          dai.address,
          BigNumber.from(daiPriceBefore.toString()).mul(101).div(100)
        );
        var daiPriceAfter = await oracle.getAssetPrice(dai.address);
        await DRE.ethers.provider.send("evm_increaseTime", [3600]) //an hour

        await oracle.updateTWAP(dai.address);
        let avgPrice = (daiPriceBefore.add(daiPriceAfter)).div(2)
        expected = expected.add(avgPrice.mul(3600))
        
      }
      expected = expected.div(3600*23);
      console.log("oracle.getAssetTWAPPrice(dai.address).div(10000): ", await oracle.getAssetTWAPPrice(dai.address));
      console.log("expected: ", expected)
      expect(BigNumber.from(await oracle.getAssetTWAPPrice(dai.address)).div(1000000000000)).to.be.bignumber.equal(expected.div(1000000000000));
      
    });

    it("Mock dai price manipulation to try to borrow more than collateral", async () => {
      const { dai, weth, users, pool, oracle } = testEnv;
      const depositor = users[0];
      const borrower = users[1];

      //mints DAI to depositor
      await dai
        .connect(depositor.signer)
        .mint(await convertToCurrencyDecimals(dai.address, "1000"));
      
      console.log("HERE!")

      //approve protocol to access depositor wallet
      await dai
        .connect(depositor.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      //user 1 deposits 1000 DAI
      const amountDAItoDeposit = await convertToCurrencyDecimals(
        dai.address,
        "1000"
      );
      await pool
        .connect(depositor.signer)
        .deposit(
          dai.address,
          "1",
          amountDAItoDeposit,
          depositor.address,
          "0"
        );

      const amountETHtoDeposit = await convertToCurrencyDecimals(
        weth.address,
        "100"
      );

      //mints WETH to borrower
      await weth.connect(borrower.signer).mint(amountETHtoDeposit);

      //approve protocol to access borrower wallet
      await weth
        .connect(borrower.signer)
        .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      //user 2 deposits 1 WETH
      await pool
        .connect(borrower.signer)
        .deposit(
          weth.address,
          "1",
          amountETHtoDeposit,
          borrower.address,
          "0"
        );
        console.log("HERE2")
      var userGlobalDataBeforeManip = await pool.getUserAccountData(depositor.address, 1, true);
      console.log("userGlobalDataBeforeManip: ", userGlobalDataBeforeManip);

      userGlobalDataBeforeManipTest = await pool.getUserAccountData(depositor.address, 1, false);
      console.log("userGlobalDataBeforeManipTest: ", userGlobalDataBeforeManipTest);

      //dai gets manipulated 300% and immediately tries to update the state (before the automatic 1 hour update)
      var daiPrice = await oracle.getAssetPrice(dai.address);
      await DRE.ethers.provider.send("evm_increaseTime", [3600]) //an hour
      await oracle.setAssetPrice(
        dai.address,
        BigNumber.from(daiPrice.toString()).mul(3)
      );
      await oracle.updateTWAP(dai.address);

      //user 2 borrows
      const userGlobalData = await pool.getUserAccountData(depositor.address, 1,true);
      console.log("userGlobalData after manip: ", userGlobalData);


      var wethPrice = await oracle.getAssetPrice(weth.address);

      const amountEthToBorrow = await convertToCurrencyDecimals(
        dai.address,
        BigNumber.from(userGlobalDataBeforeManip.availableBorrowsETH.toString())
          .div(wethPrice.toString())
          .mul(295).div(100).toString() //if price really did skyrocket 300%, they should be able to take out this borrow
      );

      await expect(pool
        .connect(depositor.signer)
        .borrow(
          weth.address,
          "1",
          amountEthToBorrow,
          RateMode.Variable,
          "0",
          depositor.address
        )).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);

      
    });

    it("don't update for a while", async () => {
      const { dai, users, pool, oracle } = testEnv;
      // await oracle.updateTWAP(dai.address); //zeros it

      const depositor = users[0];
      var userGlobalData = await pool.getUserAccountData(depositor.address, 1,true);
      console.log("userGlobalData before change: ", userGlobalData); //should be pretty high



      await DRE.ethers.provider.send("evm_increaseTime", [864000]) //10 day
      var daiPrice = await oracle.getAssetPrice(dai.address);

      //after a day, it still carries the interpolated value between then and dividing by 3
      //the other option is to just return the current price rather than the interpolated price
      //most of the time it returns the current price since operations first update state
      await oracle.setAssetPrice(
        dai.address,
        BigNumber.from(daiPrice.toString()).div(3)
      );

      var userGlobalData = await pool.getUserAccountData(depositor.address, 1,true);
      console.log("userGlobalData after change back to original: ", userGlobalData); //should be back to orig
      expect(userGlobalData.totalCollateralETH).to.be.equal(userGlobalDataBeforeManipTest.totalCollateralETH);

      expect(BigNumber.from(await oracle.getAssetTWAPPrice(dai.address))).to.be.bignumber.equal(daiPrice.div(3).mul(2));

      await oracle.updateTWAP(dai.address);
      var daiPrice1 = await oracle.getAssetPrice(dai.address);
      expect(BigNumber.from(await oracle.getAssetTWAPPrice(dai.address))).to.be.bignumber.equal(daiPrice1); //last also equals recent

      await DRE.ethers.provider.send("evm_increaseTime", [43200]) //half a day
      
      await oracle.setAssetPrice(
        dai.address,
        BigNumber.from(daiPrice1.toString()).mul(105).div(100)
      );

      var daiPrice2 = await oracle.getAssetPrice(dai.address);

      // var daiPrice = await oracle.getAssetPrice(dai.address);



      expect(BigNumber.from(await oracle.getAssetTWAPPrice(dai.address))).to.be.bignumber.equal(daiPrice1.mul(1025).div(1000)); //last also equals recent

      await oracle.updateTWAP(dai.address);

      expect(BigNumber.from(await oracle.getAssetTWAPPrice(dai.address))).to.be.bignumber.equal(daiPrice1.mul(1025).div(1000)); //last also equals recent


      await DRE.ethers.provider.send("evm_increaseTime", [3600]) //an hour
      
      
      await oracle.setAssetPrice(
        dai.address,
        BigNumber.from(daiPrice.toString()).mul(105).div(100)
      );

      var daiPrice3 = await oracle.getAssetPrice(dai.address);

      let expected = (daiPrice1.add(daiPrice2)).div(2).mul(43200).add(daiPrice2.add(daiPrice3).div(2).mul(3600))
      expected = expected.div(43200+3600)
      var got = await oracle.getAssetTWAPPrice(dai.address);
        console.log("oracle.getAssetTWAPPrice(dai.address): ",got)
        console.log("expected: ",expected)

      expect(BigNumber.from(got.div(1000000000000))).to.be.bignumber.equal(expected.div(1000000000000)); //last also equals recent

      await oracle.updateTWAP(dai.address);

      var got = await oracle.getAssetTWAPPrice(dai.address);
      expect(got.div(1000000000000)).to.be.bignumber.equal(expected.div(1000000000000)); //last also equals recent
    });
  }
);
