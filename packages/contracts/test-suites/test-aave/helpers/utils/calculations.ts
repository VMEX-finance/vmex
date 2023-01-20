import BigNumber from "bignumber.js";
import {
  DRE,
} from "../../../../helpers/misc-utils";
import {
  ONE_YEAR,
  RAY,
  MAX_UINT_AMOUNT,
  PERCENTAGE_FACTOR,
} from "../../../../helpers/constants";
import {
  IReserveParams,
  iAavePoolAssets,
  RateMode,
  tEthereumAddress,
} from "../../../../helpers/types";
import "./math";
import { ReserveData, UserReserveData } from "./interfaces";
import { expect } from "chai";
import { TestEnv } from "../make-suite";
import { getAToken, getVariableDebtToken} from "../../../../helpers/contracts-getters"
import {logger} from "../actions";
export const strToBN = (amount: string): BigNumber => new BigNumber(amount);

interface Configuration {
  reservesParams: iAavePoolAssets<IReserveParams>;
}

export const configuration: Configuration = <Configuration>{};

//userdata1 is global admin, userdata2 is tranche admin
export const checkAdminAllocation = (userDataBefore1: UserReserveData, userDataAfter1: UserReserveData, userDataBefore2: UserReserveData, userDataAfter2: UserReserveData, reserveDataBefore1: ReserveData, reserveDataAfter1: ReserveData) => {
  logger("reserveDataBefore1: ",reserveDataBefore1);
  logger("reserveDataAfter1: ",reserveDataAfter1);
  //only considering the current reserve, but if other reserves are collecting interest then this will not be updated (this is expected behavior as the contracts also work like this)
  const debtCollected = reserveDataBefore1.scaledVariableDebt.rayMul(reserveDataAfter1.variableBorrowIndex.minus(reserveDataBefore1.variableBorrowIndex));
  const actualTrancheAdminGain = (userDataAfter2.scaledATokenBalance.minus(userDataBefore2.scaledATokenBalance)).rayMul(reserveDataAfter1.liquidityIndex);
  const expectedTrancheAdminAllocation = debtCollected
    .percentMul(reserveDataBefore1.reserveFactor);

  const actualGlobalAdminGain = (userDataAfter1.scaledATokenBalance.minus(userDataBefore1.scaledATokenBalance)).rayMul(reserveDataAfter1.liquidityIndex);
  const expectedGlobalAdminAllocation = debtCollected
    // .percentMul(
    //   new BigNumber(PERCENTAGE_FACTOR).minus(reserveDataBefore1.reserveFactor)
    // )
    .minus(expectedTrancheAdminAllocation)
    .percentMul(reserveDataBefore1.VMEXReserveFactor)

  logger("actualTrancheAdminGain: ",actualTrancheAdminGain.toString())
  logger("expectedTrancheAdminAllocation: ",expectedTrancheAdminAllocation.toString())
  logger("actualGlobalAdminGain: ",actualGlobalAdminGain.toString())
  logger("expectedGlobalAdminAllocation: ",expectedGlobalAdminAllocation.toString())
  expect(actualTrancheAdminGain.minus(expectedTrancheAdminAllocation).decimalPlaces(0).absoluteValue().toNumber()).to.be.lt(20)
  expect(actualGlobalAdminGain.minus(expectedGlobalAdminAllocation).decimalPlaces(0).absoluteValue().toNumber()).to.be.lt(20)
}

export const calculateHF = async (testEnv: TestEnv, trancheId: string, user: tEthereumAddress):Promise<BigNumber> => {
  const { users, pool, dai, aDai, assetMappings, oracle, helpersContract } = testEnv;
  const reserves = await pool.getReservesList(trancheId);
  // logger("Reserves: ", reserves)
  let totalSupplied = new BigNumber("0");
  let totalBorrowed = new BigNumber("0");
  for(let i = 0;i<reserves.length;i++){
    const reserve = await pool.getReserveData(reserves[i], trancheId);
    // logger("Asset address: ", reserve)
    // logger("reserve.aTokenAddress: ", reserve.aTokenAddress)
    const aToken = await getAToken(reserve.aTokenAddress);
    const debtToken = await getVariableDebtToken(reserve.variableDebtTokenAddress);
    const supply = await aToken.balanceOf(user);
    const borrowed = await debtToken.balanceOf(user);
    const price = await oracle.getAssetPrice(reserves[i]);
    const unit = DRE.ethers.utils.parseUnits("1",(await assetMappings.getDecimals(reserves[i])))
    const params = await assetMappings.getParams(reserves[i]);
    const usrDat = await helpersContract.getUserReserveData(reserves[i], trancheId, user);
    if(supply.toString() != "0" && usrDat.usageAsCollateralEnabled){
      const suppliedValue = supply.mul(price).mul(params.liquidationThreshold).div(unit);
      totalSupplied = totalSupplied.plus(new BigNumber(suppliedValue.toString()));
    }


    if(borrowed.toString() != "0"){

      const borrowedValue = borrowed.mul(price).mul(params.borrowFactor).div(unit);
      totalBorrowed = totalBorrowed.plus(new BigNumber(borrowedValue.toString()));
    }
  }
  if(totalBorrowed.eq(new BigNumber("0"))){
    return new BigNumber(MAX_UINT_AMOUNT);
  }
  return totalSupplied.wadDiv(totalBorrowed);
}

export const calcExpectedUserDataAfterDeposit = (
  amountDeposited: string,
  reserveDataBeforeAction: ReserveData,
  reserveDataAfterAction: ReserveData,
  userDataBeforeAction: UserReserveData,
  txTimestamp: BigNumber,
  currentTimestamp: BigNumber,
  isCollateral: boolean,
  txCost: BigNumber
): UserReserveData => {
  const expectedUserData = <UserReserveData>{};

  expectedUserData.currentVariableDebt = calcExpectedVariableDebtTokenBalance(
    reserveDataBeforeAction,
    userDataBeforeAction,
    txTimestamp
  );

  expectedUserData.scaledVariableDebt = userDataBeforeAction.scaledVariableDebt;
  expectedUserData.variableBorrowIndex =
    userDataBeforeAction.variableBorrowIndex;

  expectedUserData.liquidityRate = reserveDataAfterAction.liquidityRate;

  expectedUserData.scaledATokenBalance = calcExpectedScaledATokenBalance(
    userDataBeforeAction,
    reserveDataAfterAction.liquidityIndex,
    new BigNumber(amountDeposited),
    new BigNumber(0)
  );
  expectedUserData.currentATokenBalance = calcExpectedATokenBalance(
    reserveDataBeforeAction,
    userDataBeforeAction,
    txTimestamp
  ).plus(amountDeposited);

  if (userDataBeforeAction.currentATokenBalance.eq(0)) {
    expectedUserData.usageAsCollateralEnabled = isCollateral === true;
  } else {
    expectedUserData.usageAsCollateralEnabled =
      userDataBeforeAction.usageAsCollateralEnabled;
  }

  expectedUserData.variableBorrowIndex =
    userDataBeforeAction.variableBorrowIndex;
  expectedUserData.walletBalance =
    userDataBeforeAction.walletBalance.minus(amountDeposited);

  expectedUserData.currentVariableDebt =
    calcExpectedVariableDebtTokenBalance(
      reserveDataBeforeAction,
      userDataBeforeAction,
      txTimestamp
    );

  return expectedUserData;
};

export const calcExpectedUserDataAfterWithdraw = (
  amountWithdrawn: string,
  reserveDataBeforeAction: ReserveData,
  reserveDataAfterAction: ReserveData,
  userDataBeforeAction: UserReserveData,
  txTimestamp: BigNumber,
  currentTimestamp: BigNumber,
  txCost: BigNumber
): UserReserveData => {
  const expectedUserData = <UserReserveData>{};

  const aTokenBalance = calcExpectedATokenBalance(
    reserveDataBeforeAction,
    userDataBeforeAction,
    txTimestamp
  );

  if (amountWithdrawn == MAX_UINT_AMOUNT) {
    amountWithdrawn = aTokenBalance.toFixed(0);
  }

  expectedUserData.scaledATokenBalance = calcExpectedScaledATokenBalance(
    userDataBeforeAction,
    reserveDataAfterAction.liquidityIndex,
    new BigNumber(0),
    new BigNumber(amountWithdrawn)
  );

  expectedUserData.currentATokenBalance = aTokenBalance.minus(amountWithdrawn);

  expectedUserData.scaledVariableDebt = userDataBeforeAction.scaledVariableDebt;

  expectedUserData.currentVariableDebt = calcExpectedVariableDebtTokenBalance(
    reserveDataBeforeAction,
    userDataBeforeAction,
    txTimestamp
  );

  expectedUserData.variableBorrowIndex =
    userDataBeforeAction.variableBorrowIndex;

  expectedUserData.liquidityRate = reserveDataAfterAction.liquidityRate;

  if (userDataBeforeAction.currentATokenBalance.eq(0)) {
    expectedUserData.usageAsCollateralEnabled = true;
  } else {
    //if the user is withdrawing everything, usageAsCollateralEnabled must be false
    if (expectedUserData.currentATokenBalance.eq(0)) {
      expectedUserData.usageAsCollateralEnabled = false;
    } else {
      expectedUserData.usageAsCollateralEnabled =
        userDataBeforeAction.usageAsCollateralEnabled;
    }
  }

  expectedUserData.walletBalance =
    userDataBeforeAction.walletBalance.plus(amountWithdrawn);

  return expectedUserData;
};


export const calcExpectedReserveDataAfterDeposit = (
  amountDeposited: string,
  reserveDataBeforeAction: ReserveData,
  txTimestamp: BigNumber
  //multiplier: TrancheMultiplier
): ReserveData => {
  const expectedReserveData: ReserveData = <ReserveData>{};

  expectedReserveData.address = reserveDataBeforeAction.address;

  expectedReserveData.totalLiquidity = new BigNumber(
    reserveDataBeforeAction.totalLiquidity
  ).plus(amountDeposited);
  expectedReserveData.availableLiquidity = new BigNumber(
    reserveDataBeforeAction.availableLiquidity
  ).plus(amountDeposited);

  expectedReserveData.liquidityIndex = calcExpectedLiquidityIndex(
    reserveDataBeforeAction,
    txTimestamp
  );
  expectedReserveData.variableBorrowIndex = calcExpectedVariableBorrowIndex(
    reserveDataBeforeAction,
    txTimestamp
  );
  expectedReserveData.totalVariableDebt = calcExpectedTotalVariableDebt(
    reserveDataBeforeAction,
    expectedReserveData.variableBorrowIndex
  );

  expectedReserveData.scaledVariableDebt =
    reserveDataBeforeAction.scaledVariableDebt;

  expectedReserveData.utilizationRate = calcExpectedUtilizationRate(
    expectedReserveData.totalVariableDebt,
    expectedReserveData.totalLiquidity
  );
  const rates = calcExpectedInterestRates(
    reserveDataBeforeAction.symbol,
    //multiplier,
    expectedReserveData.utilizationRate,
    expectedReserveData.totalVariableDebt,
    reserveDataBeforeAction.reserveFactor,
    reserveDataBeforeAction.VMEXReserveFactor,
  );
  expectedReserveData.liquidityRate = rates[0];
  expectedReserveData.variableBorrowRate = rates[1];

  return expectedReserveData;
};

export const calcExpectedReserveDataAfterWithdraw = (
  amountWithdrawn: string,
  reserveDataBeforeAction: ReserveData,
  userDataBeforeAction: UserReserveData,
  txTimestamp: BigNumber
): ReserveData => {
  const expectedReserveData: ReserveData = <ReserveData>{};

  expectedReserveData.address = reserveDataBeforeAction.address;

  if (amountWithdrawn == MAX_UINT_AMOUNT) {
    amountWithdrawn = calcExpectedATokenBalance(
      reserveDataBeforeAction,
      userDataBeforeAction,
      txTimestamp
    ).toFixed();
  }

  expectedReserveData.availableLiquidity = new BigNumber(
    reserveDataBeforeAction.availableLiquidity
  ).minus(amountWithdrawn);

  expectedReserveData.scaledVariableDebt =
    reserveDataBeforeAction.scaledVariableDebt;

  expectedReserveData.liquidityIndex = calcExpectedLiquidityIndex(
    reserveDataBeforeAction,
    txTimestamp
  );
  expectedReserveData.variableBorrowIndex = calcExpectedVariableBorrowIndex(
    reserveDataBeforeAction,
    txTimestamp
  );

  expectedReserveData.totalVariableDebt =
    expectedReserveData.scaledVariableDebt.rayMul(
      expectedReserveData.variableBorrowIndex
    );

  expectedReserveData.totalLiquidity = new BigNumber(
    reserveDataBeforeAction.availableLiquidity
  )
    .minus(amountWithdrawn)
    .plus(expectedReserveData.totalVariableDebt);

  expectedReserveData.utilizationRate = calcExpectedUtilizationRate(
    expectedReserveData.totalVariableDebt,
    expectedReserveData.totalLiquidity
  );
  const rates = calcExpectedInterestRates(
    reserveDataBeforeAction.symbol,
    expectedReserveData.utilizationRate,
    expectedReserveData.totalVariableDebt,
    reserveDataBeforeAction.reserveFactor,
    reserveDataBeforeAction.VMEXReserveFactor,
  );
  expectedReserveData.liquidityRate = rates[0];
  expectedReserveData.variableBorrowRate = rates[1];

  return expectedReserveData;
};

export const calcExpectedReserveDataAfterBorrow = (
  amountBorrowed: string,
  borrowRateMode: string,
  reserveDataBeforeAction: ReserveData,
  userDataBeforeAction: UserReserveData,
  txTimestamp: BigNumber,
  currentTimestamp: BigNumber
): ReserveData => {
  const expectedReserveData = <ReserveData>{};

  expectedReserveData.address = reserveDataBeforeAction.address;

  const amountBorrowedBN = new BigNumber(amountBorrowed);

  expectedReserveData.liquidityIndex = calcExpectedLiquidityIndex(
    reserveDataBeforeAction,
    txTimestamp
  );

  expectedReserveData.variableBorrowIndex = calcExpectedVariableBorrowIndex(
    reserveDataBeforeAction,
    txTimestamp
  );

  expectedReserveData.availableLiquidity =
    reserveDataBeforeAction.availableLiquidity.minus(amountBorrowedBN);

  expectedReserveData.lastUpdateTimestamp = txTimestamp;

  expectedReserveData.scaledVariableDebt =
    reserveDataBeforeAction.scaledVariableDebt.plus(
      amountBorrowedBN.rayDiv(expectedReserveData.variableBorrowIndex)
    );

  const totalVariableDebtAfterTx =
    expectedReserveData.scaledVariableDebt.rayMul(
      expectedReserveData.variableBorrowIndex
    );

  const utilizationRateAfterTx = calcExpectedUtilizationRate(
    totalVariableDebtAfterTx,
    expectedReserveData.availableLiquidity
      .plus(totalVariableDebtAfterTx)
  );

  const rates = calcExpectedInterestRates(
    reserveDataBeforeAction.symbol,
    utilizationRateAfterTx,
    totalVariableDebtAfterTx,
    reserveDataBeforeAction.reserveFactor,
    reserveDataBeforeAction.VMEXReserveFactor,
  );

  expectedReserveData.liquidityRate = rates[0];

  expectedReserveData.variableBorrowRate = rates[1];

  expectedReserveData.totalVariableDebt =
    expectedReserveData.scaledVariableDebt.rayMul(
      calcExpectedReserveNormalizedDebt(
        expectedReserveData.variableBorrowRate,
        expectedReserveData.variableBorrowIndex,
        txTimestamp,
        currentTimestamp
      )
    );

  expectedReserveData.totalLiquidity = expectedReserveData.availableLiquidity
    .plus(expectedReserveData.totalVariableDebt);

  expectedReserveData.utilizationRate = calcExpectedUtilizationRate(
    expectedReserveData.totalVariableDebt,
    expectedReserveData.totalLiquidity
  );

  return expectedReserveData;
};

export const calcExpectedReserveDataAfterRepay = (
  amountRepaid: string,
  borrowRateMode: RateMode,
  reserveDataBeforeAction: ReserveData,
  userDataBeforeAction: UserReserveData,
  txTimestamp: BigNumber,
  currentTimestamp: BigNumber
): ReserveData => {
  const expectedReserveData: ReserveData = <ReserveData>{};

  expectedReserveData.address = reserveDataBeforeAction.address;

  let amountRepaidBN = new BigNumber(amountRepaid);

  const userVariableDebt = calcExpectedVariableDebtTokenBalance(
    reserveDataBeforeAction,
    userDataBeforeAction,
    txTimestamp
  );

  //if amount repaid == MAX_UINT_AMOUNT, user is repaying everything
  if (amountRepaidBN.abs().eq(MAX_UINT_AMOUNT)) {
      amountRepaidBN = userVariableDebt;
  }

  expectedReserveData.liquidityIndex = calcExpectedLiquidityIndex(
    reserveDataBeforeAction,
    txTimestamp
  );
  expectedReserveData.variableBorrowIndex = calcExpectedVariableBorrowIndex(
    reserveDataBeforeAction,
    txTimestamp
  );

  expectedReserveData.scaledVariableDebt =
    reserveDataBeforeAction.scaledVariableDebt.minus(
      amountRepaidBN.rayDiv(expectedReserveData.variableBorrowIndex)
    );

  expectedReserveData.totalVariableDebt =
    expectedReserveData.scaledVariableDebt.rayMul(
      expectedReserveData.variableBorrowIndex
    );

  expectedReserveData.availableLiquidity =
    reserveDataBeforeAction.availableLiquidity.plus(amountRepaidBN);

  expectedReserveData.totalLiquidity = expectedReserveData.availableLiquidity
    .plus(expectedReserveData.totalVariableDebt);

  expectedReserveData.utilizationRate = calcExpectedUtilizationRate(
    expectedReserveData.totalVariableDebt,
    expectedReserveData.totalLiquidity
  );

  const rates = calcExpectedInterestRates(
    reserveDataBeforeAction.symbol,
    expectedReserveData.utilizationRate,
    expectedReserveData.totalVariableDebt,
    reserveDataBeforeAction.reserveFactor,
    reserveDataBeforeAction.VMEXReserveFactor,
  );
  expectedReserveData.liquidityRate = rates[0];

  expectedReserveData.variableBorrowRate = rates[1];

  expectedReserveData.lastUpdateTimestamp = txTimestamp;

  return expectedReserveData;
};

export const calcExpectedUserDataAfterBorrow = (
  amountBorrowed: string,
  interestRateMode: string,
  reserveDataBeforeAction: ReserveData,
  expectedDataAfterAction: ReserveData,
  userDataBeforeAction: UserReserveData,
  txTimestamp: BigNumber,
  currentTimestamp: BigNumber
): UserReserveData => {
  const expectedUserData = <UserReserveData>{};

  const amountBorrowedBN = new BigNumber(amountBorrowed);
  expectedUserData.scaledVariableDebt =
  userDataBeforeAction.scaledVariableDebt.plus(
      amountBorrowedBN.rayDiv(expectedDataAfterAction.variableBorrowIndex)
    );

  logger("Before calcExpectedVariableDebtTokenBalance, expectedUserData: ", JSON.stringify(expectedUserData))

  expectedUserData.currentVariableDebt = calcExpectedVariableDebtTokenBalance(
    expectedDataAfterAction,
    expectedUserData,
    currentTimestamp
  );

  expectedUserData.liquidityRate = expectedDataAfterAction.liquidityRate;

  expectedUserData.usageAsCollateralEnabled =
    userDataBeforeAction.usageAsCollateralEnabled;

  expectedUserData.currentATokenBalance = calcExpectedATokenBalance(
    expectedDataAfterAction,
    userDataBeforeAction,
    currentTimestamp
  );

  expectedUserData.scaledATokenBalance =
    userDataBeforeAction.scaledATokenBalance;

  expectedUserData.walletBalance =
    userDataBeforeAction.walletBalance.plus(amountBorrowed);

  return expectedUserData;
};

export const calcExpectedUserDataAfterRepay = (
  totalRepaid: string,
  rateMode: RateMode,
  reserveDataBeforeAction: ReserveData,
  expectedDataAfterAction: ReserveData,
  userDataBeforeAction: UserReserveData,
  user: string,
  onBehalfOf: string,
  txTimestamp: BigNumber,
  currentTimestamp: BigNumber
): UserReserveData => {
  const expectedUserData = <UserReserveData>{};

  const variableDebt = calcExpectedVariableDebtTokenBalance(
    reserveDataBeforeAction,
    userDataBeforeAction,
    currentTimestamp
  );

  let totalRepaidBN = new BigNumber(totalRepaid);
  if (totalRepaidBN.abs().eq(MAX_UINT_AMOUNT)) {
    totalRepaidBN = variableDebt;
  }

  expectedUserData.scaledVariableDebt =
    userDataBeforeAction.scaledVariableDebt.minus(
      totalRepaidBN.rayDiv(expectedDataAfterAction.variableBorrowIndex)
    );
  expectedUserData.currentVariableDebt =
    expectedUserData.scaledVariableDebt.rayMul(
      expectedDataAfterAction.variableBorrowIndex
    );

  expectedUserData.liquidityRate = expectedDataAfterAction.liquidityRate;

  expectedUserData.usageAsCollateralEnabled =
    userDataBeforeAction.usageAsCollateralEnabled;

  expectedUserData.currentATokenBalance = calcExpectedATokenBalance(
    reserveDataBeforeAction,
    userDataBeforeAction,
    txTimestamp
  );
  expectedUserData.scaledATokenBalance =
    userDataBeforeAction.scaledATokenBalance;

  if (user === onBehalfOf) {
    expectedUserData.walletBalance =
      userDataBeforeAction.walletBalance.minus(totalRepaidBN);
  } else {
    //wallet balance didn't change
    expectedUserData.walletBalance = userDataBeforeAction.walletBalance;
  }

  return expectedUserData;
};

export const calcExpectedUserDataAfterSetUseAsCollateral = (
  useAsCollateral: boolean,
  reserveDataBeforeAction: ReserveData,
  userDataBeforeAction: UserReserveData,
  txCost: BigNumber
): UserReserveData => {
  const expectedUserData = { ...userDataBeforeAction };

  expectedUserData.usageAsCollateralEnabled = useAsCollateral;

  return expectedUserData;
};

const calcExpectedScaledATokenBalance = (
  userDataBeforeAction: UserReserveData,
  index: BigNumber,
  amountAdded: BigNumber,
  amountTaken: BigNumber
) => {
  return userDataBeforeAction.scaledATokenBalance
    .plus(amountAdded.rayDiv(index))
    .minus(amountTaken.rayDiv(index));
};

export const calcExpectedATokenBalance = (
  reserveData: ReserveData,
  userData: UserReserveData,
  currentTimestamp: BigNumber
) => {
  const index = calcExpectedReserveNormalizedIncome(
    reserveData,
    currentTimestamp
  );

  const { scaledATokenBalance: scaledBalanceBeforeAction } = userData;

  return scaledBalanceBeforeAction.rayMul(index);
};

export const calcExpectedVariableDebtTokenBalance = (
  reserveData: ReserveData,
  userData: UserReserveData,
  currentTimestamp: BigNumber
) => {
  const normalizedDebt = calcExpectedReserveNormalizedDebt(
    reserveData.variableBorrowRate,
    reserveData.variableBorrowIndex,
    reserveData.lastUpdateTimestamp,
    currentTimestamp
  );

  const { scaledVariableDebt } = userData;

  return scaledVariableDebt.rayMul(normalizedDebt);
};

const calcLinearInterest = (
  rate: BigNumber,
  currentTimestamp: BigNumber,
  lastUpdateTimestamp: BigNumber
) => {
  const timeDifference = currentTimestamp.minus(lastUpdateTimestamp);

  const cumulatedInterest = rate
    .multipliedBy(timeDifference)
    .dividedBy(new BigNumber(ONE_YEAR))
    .plus(RAY);

  return cumulatedInterest;
};

const calcCompoundedInterest = (
  rate: BigNumber,
  currentTimestamp: BigNumber,
  lastUpdateTimestamp: BigNumber
) => {
  const timeDifference = currentTimestamp.minus(lastUpdateTimestamp);

  if (timeDifference.eq(0)) {
    return new BigNumber(RAY);
  }

  const expMinusOne = timeDifference.minus(1);
  const expMinusTwo = timeDifference.gt(2) ? timeDifference.minus(2) : 0;

  const ratePerSecond = rate.div(ONE_YEAR);

  const basePowerTwo = ratePerSecond.rayMul(ratePerSecond);
  const basePowerThree = basePowerTwo.rayMul(ratePerSecond);

  const secondTerm = timeDifference
    .times(expMinusOne)
    .times(basePowerTwo)
    .div(2);
  const thirdTerm = timeDifference
    .times(expMinusOne)
    .times(expMinusTwo)
    .times(basePowerThree)
    .div(6);

  return new BigNumber(RAY)
    .plus(ratePerSecond.times(timeDifference))
    .plus(secondTerm)
    .plus(thirdTerm);
};

export const calcExpectedInterestRates = (
  reserveSymbol: string,
  utilizationRate: BigNumber,
  totalVariableDebt: BigNumber,
  reserveFactor: BigNumber,
  VMEXReserveFactor: BigNumber,
): BigNumber[] => {
  const { reservesParams } = configuration;

  const reserveIndex = Object.keys(reservesParams).findIndex(
    (value) => value === reserveSymbol
  );
  const [, reserveConfiguration] = (
    Object.entries(reservesParams) as [string, IReserveParams][]
  )[reserveIndex];

  let variableBorrowRate: BigNumber = new BigNumber(
    reserveConfiguration.strategy.baseVariableBorrowRate
  );

  const optimalRate = new BigNumber(
    reserveConfiguration.strategy.optimalUtilizationRate
  );
  const excessRate = new BigNumber(RAY).minus(optimalRate);
  if (utilizationRate.gt(optimalRate)) {
    const excessUtilizationRateRatio = utilizationRate
      .minus(reserveConfiguration.strategy.optimalUtilizationRate)
      .rayDiv(excessRate);

    variableBorrowRate = variableBorrowRate
      .plus(reserveConfiguration.strategy.variableRateSlope1)
      .plus(
        new BigNumber(reserveConfiguration.strategy.variableRateSlope2).rayMul(
          excessUtilizationRateRatio
        )
      );
  } else {
    variableBorrowRate = variableBorrowRate.plus(
      utilizationRate
        .rayDiv(optimalRate)
        .rayMul(new BigNumber(reserveConfiguration.strategy.variableRateSlope1))
    );
  }

  const expectedOverallRate = variableBorrowRate;
  let liquidityRate = expectedOverallRate
    .rayMul(utilizationRate)
    .percentMul(
      new BigNumber(PERCENTAGE_FACTOR).minus(reserveFactor)
    )
    .percentMul(
      new BigNumber(PERCENTAGE_FACTOR).minus(VMEXReserveFactor)
    );
  return [liquidityRate, variableBorrowRate];
};

export const calcExpectedOverallBorrowRate = (
  totalVariableDebt: BigNumber,
  currentVariableBorrowRate: BigNumber,
): BigNumber => {
  const totalBorrows = totalVariableDebt;

  if (totalBorrows.eq(0)) return strToBN("0");

  const weightedVariableRate = totalVariableDebt
    .wadToRay()
    .rayMul(currentVariableBorrowRate);

  const overallBorrowRate = weightedVariableRate
    .rayDiv(totalBorrows.wadToRay());

  return overallBorrowRate;
};

export const calcExpectedUtilizationRate = (
  totalVariableDebt: BigNumber,
  totalLiquidity: BigNumber
): BigNumber => {
  if (totalVariableDebt.eq("0")) {
    return strToBN("0");
  }

  const utilization = totalVariableDebt
    .rayDiv(totalLiquidity);

  return utilization;
};

const calcExpectedReserveNormalizedIncome = (
  reserveData: ReserveData,
  currentTimestamp: BigNumber
) => {
  const { liquidityRate, liquidityIndex, lastUpdateTimestamp } = reserveData;

  //if utilization rate is 0, nothing to compound
  if (liquidityRate.eq("0")) {
    return liquidityIndex;
  }

  const cumulatedInterest = calcLinearInterest(
    liquidityRate,
    currentTimestamp,
    lastUpdateTimestamp
  );

  const income = cumulatedInterest.rayMul(liquidityIndex);

  return income;
};

const calcExpectedReserveNormalizedDebt = (
  variableBorrowRate: BigNumber,
  variableBorrowIndex: BigNumber,
  lastUpdateTimestamp: BigNumber,
  currentTimestamp: BigNumber
) => {
  //if utilization rate is 0, nothing to compound
  if (variableBorrowRate.eq("0")) {
    return variableBorrowIndex;
  }

  const cumulatedInterest = calcCompoundedInterest(
    variableBorrowRate,
    currentTimestamp,
    lastUpdateTimestamp
  );

  const debt = cumulatedInterest.rayMul(variableBorrowIndex);

  return debt;
};

const calcExpectedLiquidityIndex = (
  reserveData: ReserveData,
  timestamp: BigNumber
) => {
  //if utilization rate is 0, nothing to compound
  if (reserveData.utilizationRate.eq("0")) {
    return reserveData.liquidityIndex;
  }

  const cumulatedInterest = calcLinearInterest(
    reserveData.liquidityRate,
    timestamp,
    reserveData.lastUpdateTimestamp
  );

  return cumulatedInterest.rayMul(reserveData.liquidityIndex);
};

const calcExpectedVariableBorrowIndex = (
  reserveData: ReserveData,
  timestamp: BigNumber
) => {
  //if totalVariableDebt is 0, nothing to compound
  if (reserveData.totalVariableDebt.eq("0")) {
    return reserveData.variableBorrowIndex;
  }

  const cumulatedInterest = calcCompoundedInterest(
    reserveData.variableBorrowRate,
    timestamp,
    reserveData.lastUpdateTimestamp
  );

  return cumulatedInterest.rayMul(reserveData.variableBorrowIndex);
};

const calcExpectedTotalVariableDebt = (
  reserveData: ReserveData,
  expectedVariableDebtIndex: BigNumber
) => {
  return reserveData.scaledVariableDebt.rayMul(expectedVariableDebtIndex);
};
