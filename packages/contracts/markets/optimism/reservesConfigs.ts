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
  baseLTVAsCollateral: '7500',
  liquidationThreshold: '8000',
  liquidationBonus: '10500',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '0', 
  borrowCap: '0', 
  borrowFactor: '10500', //105%
  reserveFactor: '1000',
};

export const strategySUSD: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '5000',
  liquidationThreshold: '7500',
  liquidationBonus: '10500',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '20000000', //20 mil
  borrowCap: '0', 
  borrowFactor: '14000', //140%
  reserveFactor: '1000',
};

export const strategyUSDC: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '7500',
  liquidationThreshold: '8000',
  liquidationBonus: '10500',
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '0', //this means there is no cap
  borrowCap: '0', 
  borrowFactor: '10500', //105% for now
  reserveFactor: '1000',
};

export const strategyUSDT: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTVAsCollateral: '7500',
  liquidationThreshold: '8000',
  liquidationBonus: '10500',
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '0', 
  borrowCap: '0', 
  borrowFactor: '10500', //105% for now
  reserveFactor: '1000',
};

export const strategyWETH: IReserveParams = {
  strategy: rateStrategyWETH,
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8500',
  liquidationBonus: '10500',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '40000', //40,000
  borrowCap: '20000', //20,000
  borrowFactor: '11000', //110% for now
  reserveFactor: '1000',
};

export const strategySNX: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '5000',
  liquidationThreshold: '6000',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '500000', 
  borrowCap: '250000', 
  borrowFactor: '14000', //140% for now
  reserveFactor: '1500',
};

export const strategyWBTC: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '7000',
  liquidationThreshold: '8000',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  reserveDecimals: '8',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '1000', 
  borrowCap: '600', 
  borrowFactor: '11000', //100% for now
  reserveFactor: '1500',
};

export const strategywstETH: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '7000',
  liquidationThreshold: '8000',
  liquidationBonus: '11000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for STETH
  supplyCap: '6000', 
  borrowCap: '1000', 
  borrowFactor: '11000', //100% for now
  reserveFactor: '1500',
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
  borrowFactor: '14000', //100% for now
  reserveFactor: '2000',
};

export const strategyOP: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '5000', //0 means cannot be collateral
  liquidationThreshold: '6000',
  liquidationBonus: '11000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for OP
  supplyCap: '1000000', 
  borrowCap: '500000', 
  borrowFactor: '14000', //140% for now
  reserveFactor: '1500',
};

export const strategyCurveV1LPToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '2500', //change
  liquidationThreshold: '4500',//change
  liquidationBonus: '11500', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 1, //1 is enum for Curve
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '10050', //100% for now
  reserveFactor: '2000',
};


export const strategyCurveV2LPToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '2500', //change
  liquidationThreshold: '4500',//change
  liquidationBonus: '11500', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 2, //1 is enum for Curve
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '10100', //100% for now
  reserveFactor: '2000',
};

export const strategyYearnToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '2500', //change
  liquidationThreshold: '4500',//change
  liquidationBonus: '11500', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 3, //3 is enum for yearn
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '10100', //100% for now
  reserveFactor: '2000',
};

export const strategyBeefyToken: IReserveParams = {
  strategy: rateStrategyCurve,
  baseLTVAsCollateral: '2500', //change
  liquidationThreshold: '4500',//change
  liquidationBonus: '11500', //change
  borrowingEnabled: false,
  reserveDecimals: '18', //this is the important information
  aTokenImpl: eContractid.AToken,
  assetType: 4, //4 is enum for beefy
  supplyCap: '10000', 
  borrowCap: '10000', 
  borrowFactor: '10100', //100% for now
  reserveFactor: '2000',
};