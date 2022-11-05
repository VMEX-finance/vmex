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
import { CommonsConfig } from "../../markets/aave/commons";

makeSuite('Admin whitelisting and blacklisting tests', (testEnv: TestEnv) => {
  const {
    INVALID_FROM_BALANCE_AFTER_TRANSFER,
    INVALID_TO_BALANCE_AFTER_TRANSFER,
    VL_TRANSFER_NOT_ALLOWED,
  } = ProtocolErrors;

  it('makes users[3] whitelisted', async () => {
    const { users, deployer, pool, configurator, helpersContract } = testEnv;

    configurator.connect(deployer.signer).setWhitelist(0, users[3].address, true);
  });

  it("User 0 deposits 1000 DAI, should be blocked since not on whitelist. User 3 can deposit fine", async () => {
    const { users, pool, dai, aDai } = testEnv;

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

    await expect( pool
      .connect(users[0].signer)
      .deposit(dai.address, 0, amountDAItoDeposit, users[0].address, "0")).to.be.revertedWith("Tranche requires whitelist");

    await dai
      .connect(users[3].signer)
      .mint(await convertToCurrencyDecimals(dai.address, "1000"));

    await dai
      .connect(users[3].signer)
      .approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);


    await expect( pool
      .connect(users[3].signer)
      .deposit(dai.address, 0, amountDAItoDeposit, users[3].address, "0")).to.not.be.revertedWith("Tranche requires whitelist");
  });

});
