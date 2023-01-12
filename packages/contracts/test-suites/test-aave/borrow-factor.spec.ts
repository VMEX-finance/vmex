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

  it("Calculate the max available borrows for user 0 for weth and usdc", async () => {
    const { users, pool, usdc, weth, oracle, helpersContract } = testEnv;

    let usrData = await pool.getUserAccountData(users[0].address, 0, true);
    console.log("usrData: ",usrData)
    console.log("usrData.availableBorrowsETH: ", usrData.availableBorrowsETH)
    let amountWETH = usrData.availableBorrowsETH
    .mul(10000)
    .div(strategyWETH.borrowFactor)
    .mul(await convertToCurrencyDecimals(weth.address, "1"))
    .div(await oracle.getAssetPrice(weth.address));
    const tooMuchWETH = amountWETH.mul(11).div(10);
    console.log("amountWETH: ", amountWETH)

    await expect(pool
      .connect(users[0].signer)
      .borrow(
        weth.address,
        0,
        tooMuchWETH,
        AAVE_REFERRAL,
        users[0].address
      )).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);

      //oracle is amount of eth in 1 usdc. So we need to divide by the oracle price and multiply by decimals
      let amountUSDC = usrData.availableBorrowsETH
      .mul(10000)
      .div(strategyUSDC.borrowFactor)
      .mul(await convertToCurrencyDecimals(usdc.address, "1"))
      .div(await oracle.getAssetPrice(usdc.address));

      const tooMuchUSDC = amountUSDC.mul(11).div(10);
      console.log("tooMuchUSDC: ", tooMuchUSDC)

      await expect(pool
        .connect(users[0].signer)
        .borrow(
          usdc.address,
          0,
          tooMuchUSDC,
          AAVE_REFERRAL,
          users[0].address
        )).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);
      
        console.log("Attempt to borrow max weth")
        await pool
          .connect(users[0].signer)
          .borrow(
            weth.address,
            0,
            MAX_UINT_AMOUNT,
            AAVE_REFERRAL,
            users[0].address
          )
        usrData = await pool.getUserAccountData(users[0].address, 0, true);
        expect(usrData.healthFactor).to.be.gte(ethers.utils.parseEther("1"));
        console.log("availableBorrowsETH after max weth borrow: ",usrData.availableBorrowsETH)
        // expect(usrData.availableBorrowsETH).to.be.lte("1000");
        const userWETHReserveData = await helpersContract.getUserReserveData(
          weth.address,
          0,
          users[0].address
        );

        console.log("WETH debt: ", userWETHReserveData.currentVariableDebt)

        expect(userWETHReserveData.currentVariableDebt).to.be.gt(ethers.utils.parseEther("0"))
        expect(usrData.availableBorrowsETH).to.be.lte("100000000000");
        console.log("borrowed max weth")


        await pool
        .connect(users[0].signer)
        .repay(
          weth.address,
          0,
          MAX_UINT_AMOUNT,
          users[0].address
        )


        console.log("Attempt to borrow max usdc")

        await pool
          .connect(users[0].signer)
          .borrow(
            usdc.address,
            0,
            MAX_UINT_AMOUNT,
            AAVE_REFERRAL,
            users[0].address
          )
          usrData = await pool.getUserAccountData(users[0].address, 0, false);
        expect(usrData.healthFactor).to.be.gte(ethers.utils.parseEther("1"));
        console.log("availableBorrowsETH after max usdc borrow: ",usrData.availableBorrowsETH)
        expect(usrData.availableBorrowsETH).to.be.lte("100000000000");

        const userUSDCReserveData = await helpersContract.getUserReserveData(
          usdc.address,
          0,
          users[0].address
        );

        console.log("USDC debt: ", userUSDCReserveData.currentVariableDebt)

        expect(userUSDCReserveData.currentVariableDebt).to.be.gt(0)

        console.log("borrowed max usdc")
          await pool
          .connect(users[0].signer)
          .repay(
            usdc.address,
            0,
            MAX_UINT_AMOUNT,
            users[0].address
          )

        
  });

  it("Attempt to borrow max usdc when over limit", async () => {
    const { users, pool, usdc, weth, oracle, helpersContract } = testEnv;

    await pool
      .connect(users[0].signer)
      .deposit(
        weth.address,
        0,
        ethers.utils.parseEther("100.0"),
        users[0].address,
        "0"
      );

        await pool
          .connect(users[0].signer)
          .borrow(
            usdc.address,
            0,
            MAX_UINT_AMOUNT,
            AAVE_REFERRAL,
            users[0].address
          )
        let  usrData = await pool.getUserAccountData(users[0].address, 0, false);
        expect(usrData.healthFactor).to.be.gte(ethers.utils.parseEther("1"));
        console.log("availableBorrowsETH after max usdc borrow: ",usrData.availableBorrowsETH)

        const userUSDCReserveData = await helpersContract.getUserReserveData(
          usdc.address,
          0,
          users[0].address
        );

        console.log("USDC debt: ", userUSDCReserveData.currentVariableDebt)

        expect(userUSDCReserveData.currentVariableDebt).to.be.gte(await convertToCurrencyDecimals(usdc.address, "10000"))

        console.log("borrowed max usdc")
          await pool
          .connect(users[0].signer)
          .repay(
            usdc.address,
            0,
            MAX_UINT_AMOUNT,
            users[0].address
          )

          await pool
          .connect(users[0].signer)
          .withdraw(
            weth.address,
            0,
            MAX_UINT_AMOUNT,
            users[0].address
          )
  });

  it("User 0 tries to withdraw", async () => {
    const { users, pool, oracle, dai, aave, usdc, weth } = testEnv;
    await pool
      .connect(users[0].signer)
      .borrow(
        weth.address,
        0,
        ethers.utils.parseEther("0.1"),
        AAVE_REFERRAL,
        users[0].address
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

    await pool
          .connect(users[0].signer)
          .withdraw(
            dai.address,
            0,
            MAX_UINT_AMOUNT,
            users[0].address
          );
    let usrData = await pool.getUserAccountData(users[0].address, 0, false);
    const riskAdjustedTotalDebt = usrData.totalDebtETH.mul(usrData.avgBorrowFactor).div(ethers.utils.parseEther("1"))
    const availableWithdrawsEth = usrData.totalCollateralETH.mul(usrData.currentLiquidationThreshold).div(ethers.utils.parseEther("1")).sub(riskAdjustedTotalDebt)
    const availableAaveWithdraw = availableWithdrawsEth.mul(await convertToCurrencyDecimals(aave.address, "1")).div(await oracle.getAssetPrice(aave.address))
    console.log("availableAaveWithdraw: ",availableAaveWithdraw)
    const tooMuchWithdraw = availableAaveWithdraw.mul(11).div(10)
    await expect(pool
          .connect(users[0].signer)
          .withdraw(
            aave.address,
            0,
            MAX_UINT_AMOUNT,
            users[0].address
          )).to.be.revertedWith(VL_TRANSFER_NOT_ALLOWED)
    
          await expect(pool
            .connect(users[0].signer)
            .withdraw(
              aave.address,
              0,
              MAX_UINT_AMOUNT,
              users[0].address
            )).to.be.revertedWith(VL_TRANSFER_NOT_ALLOWED)

    await pool
            .connect(users[0].signer)
            .withdraw(
              aave.address,
              0,
              availableAaveWithdraw,
              users[0].address
            )
    
    
  });
});
