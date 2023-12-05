import { eContractid, IReserveCollateralParams, IReserveParams } from '../../helpers/types';

import {
  rateStrategyStableOne,
  rateStrategyStableTwo,
  rateStrategyStableThree,
  rateStrategyWETH,
  rateStrategyVolatileOne,
  rateStrategyVolatileTwo,
  rateStrategyVolatileFour,
  rateStrategyUnborrowable,
} from './rateStrategies';

export const strategyWETH: IReserveParams = {
  strategy: rateStrategyWETH,
  baseLTV: '800000000000000000',
  liquidationThreshold: '825000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '1800000', 
  borrowCap: '1400000', 
  borrowFactor: '120000000000000000', //120% for now
  reserveFactor: '100000000000000000',
};

export const strategystETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: '720000000000000000',
  liquidationThreshold: '825000000000000000',
  liquidationBonus: '1070000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '100000', 
  borrowCap: '72000', 
  borrowFactor: '1280000000000000000', 
  reserveFactor: '150000000000000000',
};

export const strategywstETH: IReserveParams = {
  strategy: rateStrategyVolatileTwo,
  baseLTV: '800000000000000000',
  liquidationThreshold: '825000000000000000',
  liquidationBonus: '1060000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '100000', 
  borrowCap: '24000', 
  borrowFactor: '1200000000000000000', 
  reserveFactor: '150000000000000000',
};

export const strategyrETH: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTV: '750000000000000000',
  liquidationThreshold: '780000000000000000',
  liquidationBonus: '1075000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '60000', 
  borrowCap: '19200', 
  borrowFactor: '1250000000000000000', 
  reserveFactor: '150000000000000000',
};

export const strategystETHCRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: '650000000000000000',
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 1, // CURVE
  supplyCap: '10000', 
  borrowCap: '0', 
  borrowFactor: '1000000000000000000', 
  reserveFactor: '150000000000000000',
};

export const strategystETHv2CRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: '650000000000000000',
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 1, // CURVE
  supplyCap: '4000', 
  borrowCap: '0', 
  borrowFactor: '1000000000000000000', 
  reserveFactor: '150000000000000000',
};


export const strategyrETHCRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: '500000000000000000',
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 2, // CURVE2
  supplyCap: '600', 
  borrowCap: '0', 
  borrowFactor: '1000000000000000000', 
  reserveFactor: '150000000000000000',
};

export const strategywstETHBPT: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: '650000000000000000',
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 6, // BALANCER
  supplyCap: '800', 
  borrowCap: '0', 
  borrowFactor: '1000000000000000000', 
  reserveFactor: '150000000000000000',
};

export const strategyrETHBPT: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: '500000000000000000',
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 6, // BALANCER
  supplyCap: '3000', 
  borrowCap: '0', 
  borrowFactor: '1000000000000000000', 
  reserveFactor: '150000000000000000',
};


export const LSDBaseConfig: IReserveCollateralParams = {
  baseLTV: '900000000000000000',
  liquidationThreshold: '930000000000000000',
  liquidationBonus: '1010000000000000000',
  borrowFactor: '100000000000000000', //120% for now
};

export const LSDLPConfig: IReserveCollateralParams = {
  baseLTV: '800000000000000000',
  liquidationThreshold: '850000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowFactor: '100000000000000000', //120% for now
};