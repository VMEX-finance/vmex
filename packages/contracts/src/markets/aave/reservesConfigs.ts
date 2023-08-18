import { eContractid, IReserveParams } from '../../types';

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
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //0 is enum for Aave
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1100000000000000000', //100% for now
  reserveFactor: '100000000000000000',
};

export const strategyDAI: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '750000000000000000',
  liquidationThreshold: '800000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '1000000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '100000000000000000',
};

export const strategySUSD: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '0',
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1100000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyTUSD: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '750000000000000000',
  liquidationThreshold: '800000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1100000000000000000', //100% for now
  reserveFactor: '100000000000000000',
};

export const strategyUSDC: IReserveParams = {
  strategy: rateStrategyStableThree,
  baseLTVAsCollateral: '800000000000000000',
  liquidationThreshold: '850000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '0', //this means there is no cap
  borrowCap: '0', 
  borrowFactor: '1001000000000000000', //100% for now
  reserveFactor: '100000000000000000',
};

export const strategyUSDT: IReserveParams = {
  strategy: rateStrategyStableThree,
  baseLTVAsCollateral: '0',
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '100000000000000000',
};

export const strategyAAVE: IReserveParams = {
  strategy: rateStrategyAAVE,
  baseLTVAsCollateral: '500000000000000000',
  liquidationThreshold: '650000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1100000000000000000', //100% for now
  reserveFactor: '100000000000000000',
};

export const strategyBAT: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '700000000000000000',
  liquidationThreshold: '750000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1200000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyENJ: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '550000000000000000',
  liquidationThreshold: '600000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1300000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyWETH: IReserveParams = {
  strategy: rateStrategyWETH,
  baseLTVAsCollateral: '800000000000000000',
  liquidationThreshold: '825000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '1000', //10 weth for testing
  borrowCap: '800', //1,000,000
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '100000000000000000',
};

export const strategyKNC: IReserveParams = {
  strategy: rateStrategyVolatileTwo,
  baseLTVAsCollateral: '600000000000000000',
  liquidationThreshold: '650000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1400000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyLINK: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '700000000000000000',
  liquidationThreshold: '750000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1200000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyMANA: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '600000000000000000',
  liquidationThreshold: '650000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1300000000000000000', //100% for now
  reserveFactor: '350000000000000000',
};

export const strategyMKR: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '600000000000000000',
  liquidationThreshold: '650000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1200000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyREN: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '550000000000000000',
  liquidationThreshold: '600000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1400000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategySNX: IReserveParams = {
  strategy: rateStrategyVolatileThree,
  baseLTVAsCollateral: '150000000000000000',
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1500000000000000000', //100% for now
  reserveFactor: '350000000000000000',
};

// Invalid borrow rates in params currently, replaced with snx params
export const strategyUNI: IReserveParams = {
  strategy: rateStrategyVolatileThree,
  baseLTVAsCollateral: '600000000000000000',
  liquidationThreshold: '650000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.DelegationAwareAToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1300000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyWBTC: IReserveParams = {
  strategy: rateStrategyVolatileTwo,
  baseLTVAsCollateral: '700000000000000000',
  liquidationThreshold: '750000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '8',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyYFI: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '400000000000000000',
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1300000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyZRX: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '600000000000000000',
  liquidationThreshold: '650000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1400000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};


export const strategySTETH: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '250000000000000000',
  liquidationThreshold: '450000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for STETH
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyFrax: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '0', //0 means cannot be collateral
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for FRAX
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1100000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyBAL: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '250000000000000000',
  liquidationThreshold: '450000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18', //checked
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1100000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyCRV: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '250000000000000000',
  liquidationThreshold: '450000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1200000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyCVX: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '250000000000000000',
  liquidationThreshold: '450000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1300000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyBADGER: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '250000000000000000',
  liquidationThreshold: '450000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyLDO: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '250000000000000000',
  liquidationThreshold: '450000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyALCX: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '250000000000000000',
  liquidationThreshold: '450000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyOneinch: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '250000000000000000',
  liquidationThreshold: '450000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyCurveV1LPToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '250000000000000000', //change
  liquidationThreshold: '450000000000000000',//change
  liquidationBonus: '1150000000000000000', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 1, //1 is enum for Curve
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1005000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};


export const strategyCurveV2LPToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '250000000000000000', //change
  liquidationThreshold: '450000000000000000',//change
  liquidationBonus: '1150000000000000000', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 2, //1 is enum for Curve
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyYearnToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '250000000000000000', //change
  liquidationThreshold: '450000000000000000',//change
  liquidationBonus: '1150000000000000000', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 3, //3 is enum for yearn
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};