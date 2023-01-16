import { TestEnv, makeSuite } from './helpers/make-suite';
import { deployDefaultReserveInterestRateStrategy } from '../../helpers/contracts-deployments';

import { APPROVAL_AMOUNT_LENDING_POOL, PERCENTAGE_FACTOR, RAY } from '../../helpers/constants';

import { rateStrategyStableOne } from '../../markets/aave/rateStrategies';

import { strategyDAI } from '../../markets/aave/reservesConfigs';
import { AToken, DefaultReserveInterestRateStrategy, MintableERC20 } from '../../types';
import BigNumber from 'bignumber.js';
import './helpers/utils/math';

const { expect } = require('chai');

makeSuite('Interest rate strategy tests', (testEnv: TestEnv) => {
  let strategyInstance: DefaultReserveInterestRateStrategy;
  let dai: MintableERC20;
  let aDai: AToken;
  let defaultReserveFactor = "1000";

  before(async () => {
    dai = testEnv.dai;
    aDai = testEnv.aDai;

    const { addressesProvider } = testEnv;

    strategyInstance = await deployDefaultReserveInterestRateStrategy(
      [
        addressesProvider.address,
        rateStrategyStableOne.optimalUtilizationRate,
        rateStrategyStableOne.baseVariableBorrowRate,
        rateStrategyStableOne.variableRateSlope1,
        rateStrategyStableOne.variableRateSlope2,
        rateStrategyStableOne.stableRateSlope1,
        rateStrategyStableOne.stableRateSlope2,
      ],
      false
    );
  });

  it('Checks rates at 0% utilization rate, empty reserve', async () => {
    const {
      0: currentLiquidityRate,
      1: currentVariableBorrowRate,
    } = await strategyInstance.calculateInterestRates({
      reserve: dai.address,
      aToken: aDai.address,
      liquidityAdded: 0,
      liquidityTaken: 0,
      totalVariableDebt: 0,
      reserveFactor: defaultReserveFactor,
      globalVMEXReserveFactor: 0
    });

    expect(currentLiquidityRate.toString()).to.be.equal('0', 'Invalid liquidity rate');
    // expect(currentStableBorrowRate.toString()).to.be.equal(
    //   new BigNumber(0.039).times(RAY).toFixed(0),
    //   'Invalid stable rate'
    // );
    expect(currentVariableBorrowRate.toString()).to.be.equal(
      rateStrategyStableOne.baseVariableBorrowRate,
      'Invalid variable rate'
    );
  });

  it('Checks rates at 80% utilization rate', async () => {
    const {
      0: currentLiquidityRate,
      1: currentVariableBorrowRate,
    } = await strategyInstance.calculateInterestRates({
      reserve: dai.address,
      aToken: aDai.address,
      liquidityAdded: '200000000000000000',
      liquidityTaken: 0,
      totalVariableDebt: '800000000000000000',
      reserveFactor: defaultReserveFactor,
      globalVMEXReserveFactor: 0
    });

    const expectedVariableRate = new BigNumber(rateStrategyStableOne.baseVariableBorrowRate).plus(
      rateStrategyStableOne.variableRateSlope1
    );

    expect(currentLiquidityRate.toString()).to.be.equal(
      expectedVariableRate
        .times(0.8)
        .percentMul(new BigNumber(PERCENTAGE_FACTOR).minus(defaultReserveFactor))
        .toFixed(0),
      'Invalid liquidity rate'
    );

    expect(currentVariableBorrowRate.toString()).to.be.equal(
      expectedVariableRate.toFixed(0),
      'Invalid variable rate'
    );

    // expect(currentStableBorrowRate.toString()).to.be.equal(
    //   new BigNumber(0.039).times(RAY).plus(rateStrategyStableOne.stableRateSlope1).toFixed(0),
    //   'Invalid stable rate'
    // );
  });

  it('Checks rates at 100% utilization rate', async () => {
    const {
      0: currentLiquidityRate,
      1: currentVariableBorrowRate,
    } = await strategyInstance.calculateInterestRates({
      reserve: dai.address,
      aToken: aDai.address,
      liquidityAdded: 0,
      liquidityTaken: 0,
      totalVariableDebt: '800000000000000000',
      reserveFactor: defaultReserveFactor,
      globalVMEXReserveFactor: 0
    });

    const expectedVariableRate = new BigNumber(rateStrategyStableOne.baseVariableBorrowRate)
      .plus(rateStrategyStableOne.variableRateSlope1)
      .plus(rateStrategyStableOne.variableRateSlope2);

    expect(currentLiquidityRate.toString()).to.be.equal(
      expectedVariableRate
        .percentMul(new BigNumber(PERCENTAGE_FACTOR).minus(defaultReserveFactor))
        .toFixed(0),
      'Invalid liquidity rate'
    );

    expect(currentVariableBorrowRate.toString()).to.be.equal(
      expectedVariableRate.toFixed(0),
      'Invalid variable rate'
    );
  });
});
