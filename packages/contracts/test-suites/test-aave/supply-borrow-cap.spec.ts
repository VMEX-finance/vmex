import {
  APPROVAL_AMOUNT_LENDING_POOL,
  MAX_UINT_AMOUNT,
  ZERO_ADDRESS,
} from "../../helpers/constants";
import { convertToCurrencyDecimals } from "../../helpers/contracts-helpers";
import { expect } from "chai";
import { ethers } from "ethers";
import { RateMode, ProtocolErrors } from "../../helpers/types";
import { makeSuite, TestEnv } from "./helpers/make-suite";
import { CommonsConfig } from "../../src/common";
import { strategyDAI, strategyWETH } from "../../src/markets/aave/reservesConfigs";

const AAVE_REFERRAL = CommonsConfig.ProtocolGlobalParams.AaveReferral;

makeSuite("Supply cap", (testEnv: TestEnv) => {
  const {
    INVALID_FROM_BALANCE_AFTER_TRANSFER,
    INVALID_TO_BALANCE_AFTER_TRANSFER,
    VL_TRANSFER_NOT_ALLOWED,
    VL_SUPPLY_CAP_EXCEEDED,
    VL_BORROW_CAP_EXCEEDED,
  } = ProtocolErrors;

  it("User 0 deposits 1000000 DAI, Tries to deposit 1 more but will revert. Another user tries depositing and also reverts", async () => {
    const { users, pool, dai, aDai } = testEnv;

    await dai
      .connect(users[0].signer)
      .mint(await convertToCurrencyDecimals(dai.address, "10000000"));

    await dai
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

      await dai
      .connect(users[1].signer)
      .mint(await convertToCurrencyDecimals(dai.address, "10000000"));

    await dai
      .connect(users[1].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 1 deposits 1000 DAI
    const amountDAItoDeposit = await convertToCurrencyDecimals(
      dai.address,
      strategyDAI.supplyCap
    );

    const amountDAItoDeposit2 = await convertToCurrencyDecimals(
      dai.address,
      "1"
    );

    await pool
      .connect(users[0].signer)
      .deposit(dai.address, 0, amountDAItoDeposit, users[0].address, "0");

    await expect(pool
      .connect(users[0].signer)
      .deposit(dai.address, 0, amountDAItoDeposit2, users[0].address, "0")).to.be.revertedWith(VL_SUPPLY_CAP_EXCEEDED);

    
      await expect(pool
        .connect(users[1].signer)
        .deposit(dai.address, 0, amountDAItoDeposit2, users[1].address, "0")).to.be.revertedWith(VL_SUPPLY_CAP_EXCEEDED);

    
        await pool
          .connect(users[1].signer)
          .deposit(dai.address, 1, amountDAItoDeposit2, users[1].address, "0");

          await pool
          .connect(users[0].signer)
          .deposit(dai.address, 1, amountDAItoDeposit2, users[0].address, "0");


      await expect(pool
        .connect(users[1].signer)
        .deposit(dai.address, 1, amountDAItoDeposit, users[1].address, "0")).to.be.revertedWith(VL_SUPPLY_CAP_EXCEEDED);
  });

  it("User 1 deposits 1000 WETH and user 0 tries to borrow the WETH deposited DAI as collateral, tries to borrow more than borrow cap", async () => {
    const { users, pool, weth, usdc, helpersContract } = testEnv;
    const userAddress = await pool.signer.getAddress();

    await usdc
      .connect(users[0].signer)
      .mint(await convertToCurrencyDecimals(usdc.address, "1000000000000"));

    await usdc
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    
      await pool
      .connect(users[0].signer)
      .deposit(usdc.address, 0, await convertToCurrencyDecimals(usdc.address, "1000000000000"), users[0].address, "0");

    await weth
      .connect(users[1].signer)
      .mint(await convertToCurrencyDecimals(weth.address, "1000"));

    await weth
      .connect(users[1].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(users[1].signer)
      .deposit(
        weth.address,
        0,
        ethers.utils.parseEther("1000.0"),
        userAddress,
        "0"
      );
    await expect(pool
      .connect(users[0].signer)
      .borrow(
        weth.address,
        0,
        ethers.utils.parseEther("800.01"),
        AAVE_REFERRAL,
        users[0].address
      )).to.be.revertedWith(VL_BORROW_CAP_EXCEEDED);

    await pool
    .connect(users[0].signer)
    .borrow(
      weth.address,
      0,
      ethers.utils.parseEther("800"),
      AAVE_REFERRAL,
      users[0].address
    )

    const userReserveData = await helpersContract.getUserReserveData(
      weth.address,
      0,
      users[0].address
    );

    expect(userReserveData.currentVariableDebt.toString()).to.be.eq(
      ethers.utils.parseEther("800")
    );
  });
});
