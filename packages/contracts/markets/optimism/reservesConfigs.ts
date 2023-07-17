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

export const strategyDAI: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '750000000000000000',
  liquidationThreshold: '800000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '0',
  borrowCap: '0',
  borrowFactor: '1050000000000000000', //105%
  reserveFactor: '100000000000000000',
};

export const strategyLUSD: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '750000000000000000',
  liquidationThreshold: '800000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '0',
  borrowCap: '0',
  borrowFactor: '1050000000000000000', //105%
  reserveFactor: '100000000000000000',
};

export const strategySUSD: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '500000000000000000',
  liquidationThreshold: '750000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '20000000', //20 mil
  borrowCap: '0',
  borrowFactor: '1400000000000000000', //140%
  reserveFactor: '100000000000000000',
};

export const strategyUSDC: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '750000000000000000',
  liquidationThreshold: '800000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '0', //this means there is no cap
  borrowCap: '0',
  borrowFactor: '1050000000000000000', //105% for now
  reserveFactor: '100000000000000000',
};

export const strategyUSDT: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '750000000000000000',
  liquidationThreshold: '800000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '0',
  borrowCap: '0',
  borrowFactor: '1050000000000000000', //105% for now
  reserveFactor: '100000000000000000',
};

export const strategyWETH: IReserveParams = {
  strategy: rateStrategyWETH,
  baseLTVAsCollateral: '800000000000000000',
  liquidationThreshold: '850000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '40000', //40,000
  borrowCap: '20000', //20,000
  borrowFactor: '1100000000000000000', //110% for now
  reserveFactor: '100000000000000000',
};

export const strategySNX: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '500000000000000000',
  liquidationThreshold: '600000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '500000',
  borrowCap: '250000',
  borrowFactor: '1400000000000000000', //140% for now
  reserveFactor: '150000000000000000',
};

export const strategyWBTC: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '700000000000000000',
  liquidationThreshold: '800000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '8',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '1000',
  borrowCap: '600',
  borrowFactor: '1100000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategywstETH: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '700000000000000000',
  liquidationThreshold: '800000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for STETH
  supplyCap: '6000',
  borrowCap: '1000',
  borrowFactor: '1100000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyRETH: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '700000000000000000',
  liquidationThreshold: '800000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 7, 
  supplyCap: '6000',
  borrowCap: '1000',
  borrowFactor: '1100000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyFRAX: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '0', //0 means cannot be collateral
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for FRAX
  supplyCap: '20000000', // 20 mil
  borrowCap: '0',
  borrowFactor: '1400000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyOP: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '500000000000000000', //0 means cannot be collateral
  liquidationThreshold: '600000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for OP
  supplyCap: '1000000',
  borrowCap: '500000',
  borrowFactor: '1400000000000000000', //140% for now
  reserveFactor: '150000000000000000',
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
  baseLTVAsCollateral: '500000000000000000', //change
  liquidationThreshold: '550000000000000000',//change
  liquidationBonus: '1080000000000000000', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 3, //3 is enum for yearn
  supplyCap: '10000',
  borrowCap: '10000',
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyStableYearn: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '750000000000000000', //change
  liquidationThreshold: '800000000000000000',//change
  liquidationBonus: '1020000000000000000', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 3, //3 is enum for yearn
  supplyCap: '1000000',
  borrowCap: '0',
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};


export const strategyVeloToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '250000000000000000', //change
  liquidationThreshold: '450000000000000000',//change
  liquidationBonus: '1150000000000000000', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '10000',
  borrowCap: '10000',
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyBeefyToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '250000000000000000', //change
  liquidationThreshold: '450000000000000000',//change
  liquidationBonus: '1150000000000000000', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 4, //4 is enum for beefy
  supplyCap: '10000',
  borrowCap: '10000',
  borrowFactor: '1010000000000000000', //100% for now
  reserveFactor: '200000000000000000',
};

export const strategyBeethovenToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '650000000000000000',
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1150000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 6,
  supplyCap: '0',
  borrowCap: '0',
  borrowFactor: '1000000000000000000',
  reserveFactor: '200000000000000000',  // TODO
};
