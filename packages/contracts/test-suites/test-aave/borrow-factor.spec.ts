import {
  APPROVAL_AMOUNT_LENDING_POOL,
  MAX_UINT_AMOUNT,
  ZERO_ADDRESS,
  PERCENTAGE_FACTOR
} from "../../helpers/constants";
import { convertToCurrencyDecimals } from "../../helpers/contracts-helpers";
import { expect } from "chai";
import { ethers } from "ethers";
import { RateMode, ProtocolErrors } from "../../helpers/types";
import { makeSuite, TestEnv } from "./helpers/make-suite";
import { CommonsConfig } from "../../markets/aave/commons";
import { strategyUSDC, strategyWETH } from "../../markets/aave/reservesConfigs";
import { repay } from "./helpers/actions";

const AAVE_REFERRAL = CommonsConfig.ProtocolGlobalParams.AaveReferral;

makeSuite("Borrow factor withdraw borrow", (testEnv: TestEnv) => {
  const {
    INVALID_FROM_BALANCE_AFTER_TRANSFER,
    INVALID_TO_BALANCE_AFTER_TRANSFER,
    VL_TRANSFER_NOT_ALLOWED,
    VL_COLLATERAL_CANNOT_COVER_NEW_BORROW
  } = ProtocolErrors;

  it("User 0 deposits 1000 DAI and 2000 aave", async () => {
    const { users, pool, dai, aave, aAave, aDai } = testEnv;

    await dai
      .connect(users[0].signer)
      .mint(await convertToCurrencyDecimals(dai.address, "1000"));

    await dai
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 1 deposits 1000 DAI
    const amountDAItoDeposit = await convertToCurrencyDecimals(
      dai.address,
      "1000"
    );

    await pool
      .connect(users[0].signer)
      .deposit(dai.address, 0, amountDAItoDeposit, users[0].address, "0");

      await aave
      .connect(users[0].signer)
      .mint(ethers.utils.parseEther("2000"));

    await aave
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 1 deposits 1000 DAI
    const amountUSDCtoDeposit = ethers.utils.parseEther("2000");

    await pool
      .connect(users[0].signer)
      .deposit(aave.address, 0, amountUSDCtoDeposit, users[0].address, "0");

    const balanceDAI = await aDai.balanceOf(users[0].address);
    const balanceUSDC = await aAave.balanceOf(users[0].address);

    expect(balanceDAI.toString()).to.be.equal(
      amountDAItoDeposit.toString(),
      "invalid balance"
    );

    expect(balanceUSDC.toString()).to.be.equal(
      amountUSDCtoDeposit.toString(),
      "invalid balance"
    );
  });

  it("User 1 deposits 100 WETH and usdc and user 0 tries to borrow the WETH and usdc", async () => {
    const { users, pool, weth, usdc, helpersContract } = testEnv;

    await weth
      .connect(users[0].signer)
      .mint(await convertToCurrencyDecimals(weth.address, "1000"));

    await weth
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

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
        ethers.utils.parseEther("100.0"),
        users[1].address,
        "0"
      );


    await usdc
    .connect(users[0].signer)
    .mint(await convertToCurrencyDecimals(usdc.address, "1000000"));

    await usdc
      .connect(users[0].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await usdc
      .connect(users[1].signer)
      .mint(await convertToCurrencyDecimals(usdc.address, "10000"));

    await usdc
      .connect(users[1].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(users[1].signer)
      .deposit(
        usdc.address,
        0,
        await convertToCurrencyDecimals(usdc.address, "10000"),
        users[1].address,
        "0"
      );
    await pool
      .connect(users[0].signer)
      .borrow(
        weth.address,
        0,
        ethers.utils.parseEther("0.1"),
        AAVE_REFERRAL,
        users[0].address
      );

    const userReserveData = await helpersContract.getUserReserveData(
      weth.address,
      0,
      users[0].address
    );

    expect(userReserveData.currentVariableDebt.toString()).to.be.eq(
      ethers.utils.parseEther("0.1")
    );

    await pool
      .connect(users[0].signer)
      .borrow(
        usdc.address,
        0,
        await convertToCurrencyDecimals(usdc.address, "10"),
        AAVE_REFERRAL,
        users[0].address
      );

  });

});
