import BigNumber from 'bignumber.js';

import { DRE, increaseTime } from '../../helpers/misc-utils';
import { APPROVAL_AMOUNT_LENDING_POOL, oneEther } from '../../helpers/constants';
import { convertToCurrencyDecimals } from '../../helpers/contracts-helpers';
import { makeSuite } from './helpers/make-suite';
import { ProtocolErrors, RateMode } from '../../helpers/types';
import { calcExpectedStableDebtTokenBalance } from './helpers/utils/calculations';
import { getUserData } from './helpers/utils/helpers';

import { parseEther } from 'ethers/lib/utils';

const chai = require('chai');

const { expect } = chai;

makeSuite('LendingPool liquidation on strategy - liquidator receiving the underlying asset', (testEnv) => {
  const { INVALID_HF } = ProtocolErrors;
  const tranche = 1;

  before('Before LendingPool liquidation: set config', () => {
    BigNumber.config({ DECIMAL_PLACES: 0, ROUNDING_MODE: BigNumber.ROUND_DOWN });
  });

  after('After LendingPool liquidation: reset config', () => {
    BigNumber.config({ DECIMAL_PLACES: 20, ROUNDING_MODE: BigNumber.ROUND_HALF_UP });
  });

  it("It's not possible to liquidate on a non-active collateral or a non active principal", async () => {
    const { configurator, tricrypto2T1, pool, users, daiT1 } = testEnv;
    const user = users[1];
    await configurator.deactivateReserve(tricrypto2T1.address, tranche);

    await expect(
      pool.liquidationCall(tricrypto2T1.address, daiT1.address, tranche, user.address, parseEther('1000'), false)
    ).to.be.revertedWith('2');

    await configurator.activateReserve(tricrypto2T1.address, tranche);

    await configurator.deactivateReserve(daiT1.address, tranche);

    await expect(
      pool.liquidationCall(tricrypto2T1.address, daiT1.address, tranche, user.address, parseEther('1000'), false)
    ).to.be.revertedWith('2');

    await configurator.activateReserve(daiT1.address, tranche);
  });

  it('Deposits tricrypto2, borrows DAI in tranche 1', async () => {
    const { daiT1, tricrypto2T1, users, pool, oracle } = testEnv;
    const depositor = users[0];
    const borrower = users[1];

    //mints daiT1 to depositor
    await daiT1.connect(depositor.signer).mint(await convertToCurrencyDecimals(daiT1.address, '1000'));

    //approve protocol to access depositor wallet
    await daiT1.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 1 deposits 1000 DAI
    const amountDAItoDeposit = await convertToCurrencyDecimals(daiT1.address, '1000');

    console.log("amoint dai to deposit", amountDAItoDeposit);

    await pool
      .connect(depositor.signer)
      .deposit(daiT1.address, tranche, amountDAItoDeposit, depositor.address, '0');

    //user 2 deposits 1 ETH
    const amountTricrypto2toDeposit = await convertToCurrencyDecimals(tricrypto2T1.address, '1');

    //mints Tricrypto2 to borrower
    await tricrypto2T1.connect(borrower.signer).mint(await convertToCurrencyDecimals(tricrypto2T1.address, '1000'));

    //approve protocol to access the borrower wallet
    await tricrypto2T1.connect(borrower.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(borrower.signer)
      .deposit(tricrypto2T1.address, tranche, amountTricrypto2toDeposit, borrower.address, '0');

    //user 2 borrows

    const userGlobalData = await pool.getUserAccountData(borrower.address, tranche);
    const daiPrice = await oracle.getAssetPrice(daiT1.address);

    const amountDAIToBorrow = await convertToCurrencyDecimals(
      daiT1.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(daiPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(daiT1.address, tranche, amountDAIToBorrow, RateMode.Stable, '0', borrower.address);

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address, tranche);

    expect(userGlobalDataAfter.currentLiquidationThreshold.toString()).to.be.bignumber.equal(
      '4500',
      INVALID_HF
    );
  });

  it('Drop the health factor below 1', async () => {
    const { daiT1, users, pool, oracle } = testEnv;
    const borrower = users[1];

    const daiPrice = await oracle.getAssetPrice(daiT1.address);

    await oracle.setAssetPrice(
      daiT1.address,
      new BigNumber(daiPrice.toString()).multipliedBy(2.18).toFixed(0)
    );

    const userGlobalData = await pool.getUserAccountData(borrower.address, tranche);

    expect(userGlobalData.healthFactor.toString()).to.be.bignumber.lt(
      oneEther.toFixed(0),
      INVALID_HF
    );
  });

  it('Liquidates the borrow', async () => {
    const { daiT1, tricrypto2T1, users, pool, oracle, curveOracle, helpersContract } = testEnv;
    const liquidator = users[3];
    const borrower = users[1];

    //mints daiT1 to the liquidator
    await daiT1.connect(liquidator.signer).mint(await convertToCurrencyDecimals(daiT1.address, '1000'));

    //approve protocol to access the liquidator wallet
    await daiT1.connect(liquidator.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    const daiReserveDataBefore = await helpersContract.getReserveData(daiT1.address, tranche);
    const tricrypto2ReserveDataBefore = await helpersContract.getReserveData(tricrypto2T1.address, tranche);

    const userReserveDataBefore = await getUserData(
      pool,
      helpersContract,
      daiT1.address,
      tranche.toString(),
      borrower.address
    );

    const amountToLiquidate = userReserveDataBefore.currentStableDebt.div(2).toFixed(0);
    console.log("amount to liquidate: ", amountToLiquidate);
    await increaseTime(100);

    const tx = await pool
      .connect(liquidator.signer)
      .liquidationCall(tricrypto2T1.address, daiT1.address, tranche, borrower.address, amountToLiquidate, false);

    const userReserveDataAfter = await getUserData(
      pool,
      helpersContract,
      daiT1.address,
      tranche.toString(),
      borrower.address
    );

    const daiReserveDataAfter = await helpersContract.getReserveData(daiT1.address, tranche);
    const tricrypto2ReserveDataAfter = await helpersContract.getReserveData(tricrypto2T1.address, tranche);

    const collateralPrice = await curveOracle.getAssetPrice(tricrypto2T1.address);
    console.log(curveOracle.address);
    const principalPrice = await oracle.getAssetPrice(daiT1.address);

    const collateralDecimals = (
      await helpersContract.getReserveConfigurationData(tricrypto2T1.address, tranche)
    ).decimals.toString();
    const principalDecimals = (
      await helpersContract.getReserveConfigurationData(daiT1.address, tranche)
    ).decimals.toString();

    const expectedCollateralLiquidated = new BigNumber(principalPrice.toString())
      .times(new BigNumber(amountToLiquidate).times(105))
      .times(new BigNumber(10).pow(collateralDecimals))
      .div(
        new BigNumber(collateralPrice.toString()).times(new BigNumber(10).pow(principalDecimals))
      )
      .div(100)
      .decimalPlaces(0, BigNumber.ROUND_DOWN);
    console.log("collateral price: ", collateralPrice, " principle price: ", principalPrice);
    console.log("collateral decimals", collateralDecimals)

    if (!tx.blockNumber) {
      expect(false, 'Invalid block number');
      return;
    }
    const txTimestamp = new BigNumber(
      (await DRE.ethers.provider.getBlock(tx.blockNumber)).timestamp
    );

    const stableDebtBeforeTx = calcExpectedStableDebtTokenBalance(
      userReserveDataBefore.principalStableDebt,
      userReserveDataBefore.stableBorrowRate,
      userReserveDataBefore.stableRateLastUpdated,
      txTimestamp
    );

    expect(userReserveDataAfter.currentStableDebt.toString()).to.be.bignumber.almostEqual(
      stableDebtBeforeTx.minus(amountToLiquidate).toFixed(0),
      'Invalid user debt after liquidation'
    );

    //the liquidity index of the principal reserve needs to be bigger than the index before
    expect(daiReserveDataAfter.liquidityIndex.toString()).to.be.bignumber.gte(
      daiReserveDataBefore.liquidityIndex.toString(),
      'Invalid liquidity index'
    );

    //the principal APY after a liquidation needs to be lower than the APY before
    expect(daiReserveDataAfter.liquidityRate.toString()).to.be.bignumber.lt(
      daiReserveDataBefore.liquidityRate.toString(),
      'Invalid liquidity APY'
    );

    expect(daiReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      new BigNumber(daiReserveDataBefore.availableLiquidity.toString())
        .plus(amountToLiquidate)
        .toFixed(0),
      'Invalid principal available liquidity'
    );

    expect(tricrypto2ReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      new BigNumber(tricrypto2ReserveDataBefore.availableLiquidity.toString())
        .minus(expectedCollateralLiquidated)
        .toFixed(0),
      'Invalid collateral available liquidity'
    );
  });

  it('User 3 deposits 1000 USDC, user 4 1 Tricrypto2, user 4 borrows - drops HF, liquidates the borrow', async () => {
    const { usdc, users, pool, oracle, tricrypto2T1, helpersContract } = testEnv;

    const depositor = users[3];
    const borrower = users[4];
    const liquidator = users[5];

    //mints USDC to depositor
    await usdc
      .connect(depositor.signer)
      .mint(await convertToCurrencyDecimals(usdc.address, '1000'));

    //approve protocol to access depositor wallet
    await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //depositor deposits 1000 USDC
    const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, '1000');

    await pool
      .connect(depositor.signer)
      .deposit(usdc.address, tranche, amountUSDCtoDeposit, depositor.address, '0');

    //borrower deposits 1 ETH
    const amountETHtoDeposit = await convertToCurrencyDecimals(tricrypto2T1.address, '1');

    //mints Tricrypto2 to borrower
    await tricrypto2T1.connect(borrower.signer).mint(await convertToCurrencyDecimals(tricrypto2T1.address, '1000'));

    //approve protocol to access the borrower wallet
    await tricrypto2T1.connect(borrower.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(borrower.signer)
      .deposit(tricrypto2T1.address, tranche, amountETHtoDeposit, borrower.address, '0');

    //borrower borrows
    const userGlobalData = await pool.getUserAccountData(borrower.address, tranche);

    const usdcPrice = await oracle.getAssetPrice(usdc.address);

    const amountUSDCToBorrow = await convertToCurrencyDecimals(
      usdc.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(usdcPrice.toString())
        .multipliedBy(0.9502)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(usdc.address, tranche, amountUSDCToBorrow, RateMode.Stable, '0', borrower.address);

    //drops HF below 1
    await oracle.setAssetPrice(
      usdc.address,
      new BigNumber(usdcPrice.toString()).multipliedBy(1.12).toFixed(0)
    );

    //mints dai to the liquidator

    await usdc
      .connect(liquidator.signer)
      .mint(await convertToCurrencyDecimals(usdc.address, '1000'));

    //approve protocol to access depositor wallet
    await usdc.connect(liquidator.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    const userReserveDataBefore = await helpersContract.getUserReserveData(
      usdc.address,
      tranche,
      borrower.address
    );

    const usdcReserveDataBefore = await helpersContract.getReserveData(usdc.address, tranche);
    const tricrypto2ReserveDataBefore = await helpersContract.getReserveData(tricrypto2T1.address, tranche);

    const amountToLiquidate = DRE.ethers.BigNumber.from(
      userReserveDataBefore.currentStableDebt.toString()
    )
      .div(2)
      .toString();

    await pool
      .connect(liquidator.signer)
      .liquidationCall(tricrypto2T1.address, usdc.address, tranche, borrower.address, amountToLiquidate, false);

    const userReserveDataAfter = await helpersContract.getUserReserveData(
      usdc.address,
      tranche,
      borrower.address
    );

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address, tranche);

    const usdcReserveDataAfter = await helpersContract.getReserveData(usdc.address, tranche);
    const tricrypto2ReserveDataAfter = await helpersContract.getReserveData(tricrypto2T1.address, tranche);

    const collateralPrice = await oracle.getAssetPrice(tricrypto2T1.address);
    const principalPrice = await oracle.getAssetPrice(usdc.address);

    const collateralDecimals = (
      await helpersContract.getReserveConfigurationData(tricrypto2T1.address, tranche)
    ).decimals.toString();
    const principalDecimals = (
      await helpersContract.getReserveConfigurationData(usdc.address, tranche)
    ).decimals.toString();

    const expectedCollateralLiquidated = new BigNumber(principalPrice.toString())
      .times(new BigNumber(amountToLiquidate).times(105))
      .times(new BigNumber(10).pow(collateralDecimals))
      .div(
        new BigNumber(collateralPrice.toString()).times(new BigNumber(10).pow(principalDecimals))
      )
      .div(100)
      .decimalPlaces(0, BigNumber.ROUND_DOWN);

    expect(userGlobalDataAfter.healthFactor.toString()).to.be.bignumber.gt(
      oneEther.toFixed(0),
      'Invalid health factor'
    );

    expect(userReserveDataAfter.currentStableDebt.toString()).to.be.bignumber.almostEqual(
      new BigNumber(userReserveDataBefore.currentStableDebt.toString())
        .minus(amountToLiquidate)
        .toFixed(0),
      'Invalid user borrow balance after liquidation'
    );

    //the liquidity index of the principal reserve needs to be bigger than the index before
    expect(usdcReserveDataAfter.liquidityIndex.toString()).to.be.bignumber.gte(
      usdcReserveDataBefore.liquidityIndex.toString(),
      'Invalid liquidity index'
    );

    //the principal APY after a liquidation needs to be lower than the APY before
    expect(usdcReserveDataAfter.liquidityRate.toString()).to.be.bignumber.lt(
      usdcReserveDataBefore.liquidityRate.toString(),
      'Invalid liquidity APY'
    );

    expect(usdcReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      new BigNumber(usdcReserveDataBefore.availableLiquidity.toString())
        .plus(amountToLiquidate)
        .toFixed(0),
      'Invalid principal available liquidity'
    );

    expect(tricrypto2ReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      new BigNumber(tricrypto2ReserveDataBefore.availableLiquidity.toString())
        .minus(expectedCollateralLiquidated)
        .toFixed(0),
      'Invalid collateral available liquidity'
    );
  });

  it('User 4 deposits 10 AAVE - drops HF, liquidates the AAVE, which results on a lower amount being liquidated', async () => {
    const { aave, usdc, users, pool, oracle, helpersContract } = testEnv;

    const depositor = users[3];
    const borrower = users[4];
    const liquidator = users[5];

    //mints AAVE to borrower
    await aave.connect(borrower.signer).mint(await convertToCurrencyDecimals(aave.address, '10'));

    //approve protocol to access the borrower wallet
    await aave.connect(borrower.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //borrower deposits 10 AAVE
    const amountToDeposit = await convertToCurrencyDecimals(aave.address, '10');

    await pool
      .connect(borrower.signer)
      .deposit(aave.address, tranche, amountToDeposit, borrower.address, '0');
    const usdcPrice = await oracle.getAssetPrice(usdc.address);

    //drops HF below 1
    await oracle.setAssetPrice(
      usdc.address,
      new BigNumber(usdcPrice.toString()).multipliedBy(1.14).toFixed(0)
    );

    //mints usdc to the liquidator
    await usdc
      .connect(liquidator.signer)
      .mint(await convertToCurrencyDecimals(usdc.address, '1000'));

    //approve protocol to access depositor wallet
    await usdc.connect(liquidator.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    const userReserveDataBefore = await helpersContract.getUserReserveData(
      usdc.address,
      tranche,
      borrower.address
    );

    const usdcReserveDataBefore = await helpersContract.getReserveData(usdc.address, tranche);
    const aaveReserveDataBefore = await helpersContract.getReserveData(aave.address, tranche);

    const amountToLiquidate = new BigNumber(userReserveDataBefore.currentStableDebt.toString())
      .div(2)
      .decimalPlaces(0, BigNumber.ROUND_DOWN)
      .toFixed(0);

    const collateralPrice = await oracle.getAssetPrice(aave.address);
    const principalPrice = await oracle.getAssetPrice(usdc.address);

    await pool
      .connect(liquidator.signer)
      .liquidationCall(aave.address, usdc.address, tranche, borrower.address, amountToLiquidate, false);

    const userReserveDataAfter = await helpersContract.getUserReserveData(
      usdc.address,
      tranche,
      borrower.address
    );

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address, tranche);

    const usdcReserveDataAfter = await helpersContract.getReserveData(usdc.address, tranche);
    const aaveReserveDataAfter = await helpersContract.getReserveData(aave.address, tranche);

    const aaveConfiguration = await helpersContract.getReserveConfigurationData(aave.address, tranche);
    const collateralDecimals = aaveConfiguration.decimals.toString();
    const liquidationBonus = aaveConfiguration.liquidationBonus.toString();

    const principalDecimals = (
      await helpersContract.getReserveConfigurationData(usdc.address, tranche)
    ).decimals.toString();

    const expectedCollateralLiquidated = oneEther.multipliedBy('10');

    const expectedPrincipal = new BigNumber(collateralPrice.toString())
      .times(expectedCollateralLiquidated)
      .times(new BigNumber(10).pow(principalDecimals))
      .div(
        new BigNumber(principalPrice.toString()).times(new BigNumber(10).pow(collateralDecimals))
      )
      .times(10000)
      .div(liquidationBonus.toString())
      .decimalPlaces(0, BigNumber.ROUND_DOWN);

    expect(userGlobalDataAfter.healthFactor.toString()).to.be.bignumber.gt(
      oneEther.toFixed(0),
      'Invalid health factor'
    );

    expect(userReserveDataAfter.currentStableDebt.toString()).to.be.bignumber.almostEqual(
      new BigNumber(userReserveDataBefore.currentStableDebt.toString())
        .minus(expectedPrincipal)
        .toFixed(0),
      'Invalid user borrow balance after liquidation'
    );

    expect(usdcReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      new BigNumber(usdcReserveDataBefore.availableLiquidity.toString())
        .plus(expectedPrincipal)
        .toFixed(0),
      'Invalid principal available liquidity'
    );

    expect(aaveReserveDataAfter.availableLiquidity.toString()).to.be.bignumber.almostEqual(
      new BigNumber(aaveReserveDataBefore.availableLiquidity.toString())
        .minus(expectedCollateralLiquidated)
        .toFixed(0),
      'Invalid collateral available liquidity'
    );
  });
});
