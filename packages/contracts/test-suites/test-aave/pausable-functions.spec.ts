import { makeSuite, TestEnv } from './helpers/make-suite';
import { ProtocolErrors, RateMode } from '../../helpers/types';
import { APPROVAL_AMOUNT_LENDING_POOL, oneEther } from '../../helpers/constants';
import { convertToCurrencyDecimals } from '../../helpers/contracts-helpers';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'bignumber.js';
import { MockFlashLoanReceiver } from '../../types/MockFlashLoanReceiver';
import { getEmergencyAdminT0, getMockFlashLoanReceiver } from '../../helpers/contracts-getters';

const { expect } = require('chai');

makeSuite('Pausable Pool', (testEnv: TestEnv) => {

  const {
    LP_IS_PAUSED,
    INVALID_FROM_BALANCE_AFTER_TRANSFER,
    INVALID_TO_BALANCE_AFTER_TRANSFER,
  } = ProtocolErrors;

  const tranche = 0;
  it('User 0 deposits 1000 DAI. Configurator pauses pool. Transfers to user 1 reverts. Configurator unpauses the network and next transfer succees', async () => {
    const { users, pool, dai, aDai, configurator } = testEnv;
    const t0EmergencyAdmin = await getEmergencyAdminT0();

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[0].signer).mint(amountDAItoDeposit);

    // user 0 deposits 1000 DAI
    await dai.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool
      .connect(users[0].signer)
      .deposit(dai.address, tranche, amountDAItoDeposit, users[0].address, '0');

    const user0Balance = await aDai.balanceOf(users[0].address);
    const user1Balance = await aDai.balanceOf(users[1].address);

    // Configurator pauses the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(true, tranche);

    // User 0 tries the transfer to User 1
    await expect(
      aDai.connect(users[0].signer).transfer(users[1].address, amountDAItoDeposit)
    ).to.revertedWith(LP_IS_PAUSED);

    let pausedFromBalance = await aDai.balanceOf(users[0].address);
    let pausedToBalance = await aDai.balanceOf(users[1].address);

    expect(pausedFromBalance).to.be.equal(
      user0Balance.toString(),
      INVALID_TO_BALANCE_AFTER_TRANSFER
    );
    expect(pausedToBalance.toString()).to.be.equal(
      user1Balance.toString(),
      INVALID_FROM_BALANCE_AFTER_TRANSFER
    );

    // Configurator unpauses the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(false, tranche);

    // Configurator pauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(true);

    // User 0 tries the transfer to User 1
    await expect(
      aDai.connect(users[0].signer).transfer(users[1].address, amountDAItoDeposit)
    ).to.revertedWith(LP_IS_PAUSED);

    pausedFromBalance = await aDai.balanceOf(users[0].address);
    pausedToBalance = await aDai.balanceOf(users[1].address);

    expect(pausedFromBalance).to.be.equal(
      user0Balance.toString(),
      INVALID_TO_BALANCE_AFTER_TRANSFER
    );
    expect(pausedToBalance.toString()).to.be.equal(
      user1Balance.toString(),
      INVALID_FROM_BALANCE_AFTER_TRANSFER
    );

    // Configurator unpauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(false);

    // User 0 succeeds transfer to User 1
    await aDai.connect(users[0].signer).transfer(users[1].address, amountDAItoDeposit);

    const fromBalance = await aDai.balanceOf(users[0].address);
    const toBalance = await aDai.balanceOf(users[1].address);

    expect(fromBalance.toString()).to.be.equal(
      user0Balance.sub(amountDAItoDeposit),
      INVALID_FROM_BALANCE_AFTER_TRANSFER
    );
    expect(toBalance.toString()).to.be.equal(
      user1Balance.add(amountDAItoDeposit),
      INVALID_TO_BALANCE_AFTER_TRANSFER
    );
  });

  it('Deposit', async () => {
    const { users, pool, dai, aDai, configurator } = testEnv;
    const t0EmergencyAdmin = await getEmergencyAdminT0();

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[0].signer).mint(amountDAItoDeposit);

    // user 0 deposits 1000 DAI
    await dai.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    // Configurator pauses the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(true, tranche);
    await expect(
      pool.connect(users[0].signer).deposit(dai.address, tranche, amountDAItoDeposit, users[0].address, '0')
    ).to.revertedWith(LP_IS_PAUSED);

    // Configurator unpauses the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(false, tranche);


    // Configurator pauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(true);

    // User 0 tries the transfer to User 1
    await expect(
      pool.connect(users[0].signer).deposit(dai.address, tranche, amountDAItoDeposit, users[0].address, '0')
    ).to.revertedWith(LP_IS_PAUSED);

    // Configurator unpauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(false);
  });

  it('Withdraw', async () => {
    const { users, pool, dai, aDai, configurator } = testEnv;
    const t0EmergencyAdmin = await getEmergencyAdminT0();

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[0].signer).mint(amountDAItoDeposit);

    // user 0 deposits 1000 DAI
    await dai.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool
      .connect(users[0].signer)
      .deposit(dai.address, tranche, amountDAItoDeposit, users[0].address, '0');

    // Configurator pauses the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(true, tranche);

    // user tries to burn
    await expect(
      pool.connect(users[0].signer).withdraw(dai.address, tranche, amountDAItoDeposit, users[0].address)
    ).to.revertedWith(LP_IS_PAUSED);

    // Configurator unpauses the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(false, tranche);

    // Configurator pauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(true);

    // User 0 tries the transfer to User 1
    await expect(
      pool.connect(users[0].signer).withdraw(dai.address, tranche, amountDAItoDeposit, users[0].address)
    ).to.revertedWith(LP_IS_PAUSED);

    // Configurator unpauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(false);
  });

  it('Borrow', async () => {
    const { pool, dai, users, configurator } = testEnv;
    const t0EmergencyAdmin = await getEmergencyAdminT0();

    const user = users[1];
    // Pause the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(true, tranche);

    // Try to execute liquidation
    await expect(
      pool.connect(user.signer).borrow(dai.address, tranche, '1', '0', user.address)
    ).revertedWith(LP_IS_PAUSED);

    // Unpause the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(false, tranche);

    // Configurator pauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(true);

    // User 0 tries the transfer to User 1
    await expect(
      pool.connect(users[0].signer).borrow(dai.address, tranche, '1', '0', user.address)
    ).to.revertedWith(LP_IS_PAUSED);

    // Configurator unpauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(false);
  });

  it('Repay', async () => {
    const { pool, dai, users, configurator } = testEnv;
    const t0EmergencyAdmin = await getEmergencyAdminT0();

    const user = users[1];
    // Pause the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(true, tranche);

    // Try to execute liquidation
    await expect(pool.connect(user.signer).repay(dai.address, tranche, '1', user.address)).revertedWith(
      LP_IS_PAUSED
    );

    // Unpause the pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(false, tranche);

    // Configurator pauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(true);

    // User 0 tries the transfer to User 1
    await expect(
      pool.connect(users[0].signer).repay(dai.address, tranche, '1', user.address)
    ).to.revertedWith(LP_IS_PAUSED);

    // Configurator unpauses everything the pool
    await configurator.connect(t0EmergencyAdmin).setEveryTranchePause(false);
  });

  it('Liquidation call', async () => {
    const { users, pool, usdc, oracle, weth, configurator, helpersContract } = testEnv;
    const depositor = users[3];
    const borrower = users[4];
    const t0EmergencyAdmin = await getEmergencyAdminT0();

    //mints USDC to depositor
    await usdc
      .connect(depositor.signer)
      .mint(await convertToCurrencyDecimals(usdc.address, '1000'));

    //approve protocol to access depositor wallet
    await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 3 deposits 1000 USDC
    const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, '1000');

    await pool
      .connect(depositor.signer)
      .deposit(usdc.address, tranche, amountUSDCtoDeposit, depositor.address, '0');

    //user 4 deposits 1 ETH
    const amountETHtoDeposit = await convertToCurrencyDecimals(weth.address, '1');

    //mints WETH to borrower
    await weth.connect(borrower.signer).mint(amountETHtoDeposit);

    //approve protocol to access borrower wallet
    await weth.connect(borrower.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(borrower.signer)
      .deposit(weth.address, tranche, amountETHtoDeposit, borrower.address, '0');

    //user 4 borrows
    const userGlobalData = await pool.callStatic.getUserAccountData(borrower.address, tranche);

    const usdcPrice = await oracle.callStatic.getAssetPrice(usdc.address);

    const amountUSDCToBorrow = await convertToCurrencyDecimals(
      usdc.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(usdcPrice.toString())
        .multipliedBy(0.9502)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(usdc.address, tranche, amountUSDCToBorrow, '0', borrower.address);

    // Drops HF below 1
    await oracle.setAssetPrice(
      usdc.address,
      new BigNumber(usdcPrice.toString()).multipliedBy(1.2).toFixed(0)
    );

    //mints dai to the liquidator
    await usdc.mint(await convertToCurrencyDecimals(usdc.address, '1000'));
    await usdc.approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    const userReserveDataBefore = await helpersContract.getUserReserveData(
      usdc.address,
      tranche,
      borrower.address
    );

    const amountToLiquidate = new BigNumber(userReserveDataBefore.currentVariableDebt.toString())
      .multipliedBy(0.5)
      .toFixed(0);

    // Pause pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(true, tranche);

    // Do liquidation
    await expect(
      pool.liquidationCall(weth.address, usdc.address, tranche, borrower.address, amountToLiquidate, true)
    ).revertedWith(LP_IS_PAUSED);

    // Unpause pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(false, tranche);
  });

  it('SwapBorrowRateMode', async () => {
    const { pool, weth, dai, usdc, users, configurator } = testEnv;
    const user = users[1];
    const t0EmergencyAdmin = await getEmergencyAdminT0();
    const amountWETHToDeposit = parseEther('10');
    const amountDAIToDeposit = parseEther('120');
    const amountToBorrow = parseUnits('65', 6);

    await weth.connect(user.signer).mint(amountWETHToDeposit);
    await weth.connect(user.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool.connect(user.signer).deposit(weth.address, tranche, amountWETHToDeposit, user.address, '0');

    await dai.connect(user.signer).mint(amountDAIToDeposit);
    await dai.connect(user.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool.connect(user.signer).deposit(dai.address, tranche, amountDAIToDeposit, user.address, '0');

    await pool.connect(user.signer).borrow(usdc.address, tranche, amountToBorrow, 0, user.address);

    // Pause pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(true, tranche);

    // Unpause pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(false, tranche);
  });

  it('setUserUseReserveAsCollateral', async () => {
    const { pool, weth, users, configurator } = testEnv;
    const user = users[1];
    const t0EmergencyAdmin = await getEmergencyAdminT0();

    const amountWETHToDeposit = parseEther('1');
    await weth.connect(user.signer).mint(amountWETHToDeposit);
    await weth.connect(user.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    await pool.connect(user.signer).deposit(weth.address, tranche, amountWETHToDeposit, user.address, '0');

    // Pause pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(true, tranche);

    await expect(
      pool.connect(user.signer).setUserUseReserveAsCollateral(weth.address, tranche, false)
    ).revertedWith(LP_IS_PAUSED);

    // Unpause pool
    await configurator.connect(t0EmergencyAdmin).setTranchePause(false, tranche);
  });
});
