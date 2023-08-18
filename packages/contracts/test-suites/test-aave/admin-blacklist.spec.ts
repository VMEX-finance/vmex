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
import { CommonsConfig } from "../../../src/markets/aave/commons";

makeSuite("Admin whitelisting and blacklisting tests", (testEnv: TestEnv) => {
  const {
    INVALID_FROM_BALANCE_AFTER_TRANSFER,
    INVALID_TO_BALANCE_AFTER_TRANSFER,
    VL_TRANSFER_NOT_ALLOWED,
  } = ProtocolErrors;

  it("makes users[3] blacklisted", async () => {
    const { users, deployer, pool, configurator, helpersContract } = testEnv;

    await configurator
      .connect(deployer.signer)
      .setTrancheBlacklist(0, [users[3].address], [true]);

    const config = await pool
      .connect(deployer.signer).getUserConfiguration(users[3].address, 0)
    expect(config.data.toHexString()).to.be.equal("0x4000000000000000000000000000000000000000000000000000000000000000");
  });

  it("User 3 deposits 1000 DAI, should be blocked since on blacklist. User 0 can deposit and borrow fine", async () => {
    const { users, pool, dai, aDai } = testEnv;

    await dai
      .connect(users[0].signer)
      .mint(await convertToCurrencyDecimals(dai.address, "10000"));

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
      .deposit(dai.address, 0, amountDAItoDeposit, users[0].address, "0")

    await pool
      .connect(users[0].signer)
      .borrow(dai.address, 0, await convertToCurrencyDecimals(
        dai.address,
        "20"
      ), "0", users[0].address)

    await dai
      .connect(users[3].signer)
      .mint(await convertToCurrencyDecimals(dai.address, "1000"));

    await dai
      .connect(users[3].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await expect(
      pool
        .connect(users[3].signer)
        .deposit(dai.address, 0, amountDAItoDeposit, users[3].address, "0")
    ).to.be.revertedWith(ProtocolErrors.LP_BLACKLISTED_TRANCHE_PARTICIPANT);

    const config = await pool
      .connect(users[3].signer).getUserConfiguration(users[3].address, 0)
    expect(config.data.toHexString()).to.be.equal("0x4000000000000000000000000000000000000000000000000000000000000000");
  });

  it("User 0 should be unable to transfer tokens to User 3", async () => {
    const { users, pool, dai, aDai } = testEnv;

    await expect(
      aDai
        .connect(users[0].signer)
        .transfer(users[3].address, "100")
    ).to.be.revertedWith(ProtocolErrors.LP_BLACKLISTED_TRANCHE_PARTICIPANT);
  });
  //DAI is the first token init, so it would have the highest chance of messing with the blacklist/whitelist cause it occupies space 0
  it("makes users[0] now blacklisted. He should still be able to withdraw and repay, but not deposit or borrow more", async () => {
    const { users, deployer, pool, configurator, helpersContract, dai } = testEnv;

    await configurator
      .connect(deployer.signer)
      .setTrancheBlacklist(0, [users[0].address], [true]);

    const config = await pool
      .connect(deployer.signer).getUserConfiguration(users[0].address, 0)
    expect(config.data.toHexString()).to.be.equal("0x4000000000000000000000000000000000000000000000000000000000000003");

    await expect(pool
      .connect(users[0].signer)
      .borrow(dai.address, 0, await convertToCurrencyDecimals(
        dai.address,
        "20"
      ), "0", users[0].address)).to.be.revertedWith(ProtocolErrors.LP_BLACKLISTED_TRANCHE_PARTICIPANT);

    await pool
      .connect(users[0].signer)
      .repay(dai.address, 0, await convertToCurrencyDecimals(
        dai.address,
        "200"
      ), users[0].address)

    await pool
      .connect(users[0].signer)
      .withdraw(dai.address, 0, MAX_UINT_AMOUNT, users[0].address)
  });
});
