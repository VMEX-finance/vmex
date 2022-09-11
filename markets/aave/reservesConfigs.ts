import { eContractid, IReserveParams } from '../../helpers/types';

import {
  rateStrategyStableOne,
  rateStrategyStableTwo,
  rateStrategyStableThree,
  rateStrategyWETH,
  rateStrategyAAVE,
  rateStrategyCurve,
  rateStrategyVolatileOne,
  rateStrategyVolatileTwo,
  rateStrategyVolatileThree,
  rateStrategyVolatileFour,
} from './rateStrategies';

export const strategyBUSD: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '0',
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '1000',
  risk: 0,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0, //0 is enum for Aave
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyDAI: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '7500',
  liquidationThreshold: '8000',
  liquidationBonus: '10500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '1000',
  risk: 0,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000', //1 (for testing)
  hasStrategy: false,
};

export const strategySUSD: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '0',
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 0,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyTUSD: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '7500',
  liquidationThreshold: '8000',
  liquidationBonus: '10500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '1000',
  risk: 0,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyUSDC: IReserveParams = {
  strategy: rateStrategyStableThree,
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8500',
  liquidationBonus: '10500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '1000',
  risk: 0,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //a lot, 10^24 /10^6
  hasStrategy: false,
};

export const strategyUSDT: IReserveParams = {
  strategy: rateStrategyStableThree,
  baseLTVAsCollateral: '0',
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '1000',
  risk: 0,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyAAVE: IReserveParams = {
  strategy: rateStrategyAAVE,
  baseLTVAsCollateral: '5000',
  liquidationThreshold: '6500',
  liquidationBonus: '11000',
  borrowingEnabled: false,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '0',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyBAT: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '7000',
  liquidationThreshold: '7500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyENJ: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '5500',
  liquidationThreshold: '6000',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyWETH: IReserveParams = {
  strategy: rateStrategyWETH,
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8250',
  liquidationBonus: '10500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '1000',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyKNC: IReserveParams = {
  strategy: rateStrategyVolatileTwo,
  baseLTVAsCollateral: '6000',
  liquidationThreshold: '6500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyLINK: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '7000',
  liquidationThreshold: '7500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyMANA: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '6000',
  liquidationThreshold: '6500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyMKR: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '6000',
  liquidationThreshold: '6500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyREN: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '5500',
  liquidationThreshold: '6000',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategySNX: IReserveParams = {
  strategy: rateStrategyVolatileThree,
  baseLTVAsCollateral: '1500',
  liquidationThreshold: '4000',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

// Invalid borrow rates in params currently, replaced with snx params
export const strategyUNI: IReserveParams = {
  strategy: rateStrategyVolatileThree,
  baseLTVAsCollateral: '6000',
  liquidationThreshold: '6500',
  liquidationBonus: '11000',
  borrowingEnabled: false,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.DelegationAwareAToken,
  reserveFactor: '2000',
  risk: 1,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyWBTC: IReserveParams = {
  strategy: rateStrategyVolatileTwo,
  baseLTVAsCollateral: '7000',
  liquidationThreshold: '7500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '8',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 0,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyYFI: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '4000',
  liquidationThreshold: '5500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 2,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyZRX: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '6000',
  liquidationThreshold: '6500',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '2000',
  risk: 2,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyXSUSHI: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 2,
  isLendable: true,
  allowedHigherTranche: true,
  assetType: 0,
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategySTETH: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 2,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 0, //this is since there is a chainlink aggregator for STETH
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyFrax: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 2,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 0, //this is since there is a chainlink aggregator for Frax
  canBeCollateral: false, //frax can't be collateral
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyBAL: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18', //checked
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 1,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 0, 
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyCRV: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 1,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 0, 
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: true,
};

export const strategyCVX: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 1,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 0, 
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: true,
};

export const strategyBADGER: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 1,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 0, 
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyLDO: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 1,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 0, 
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyALCX: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 1,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 0, 
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyOneinch: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '2500',
  liquidationThreshold: '4500',
  liquidationBonus: '11500',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  reserveFactor: '3500',
  risk: 1,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 0, 
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: false,
};

export const strategyCurveLPToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '2500', //change
  liquidationThreshold: '4500',//change
  liquidationBonus: '11500', //change
  borrowingEnabled: false,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  reserveFactor: '0',
  risk: 2,
  isLendable: false,
  allowedHigherTranche: true,
  assetType: 1, //1 is enum for Curve
  canBeCollateral: true,
  collateralCap: '1000000000000000000000000', //1,000,000
  hasStrategy: true,
};

