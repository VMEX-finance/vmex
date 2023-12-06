import { ethers } from 'ethers';
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
  baseLTV: ethers.utils.parseUnits('0.8',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.825',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '1800000', 
  borrowCap: '1400000', 
  borrowFactor: ethers.utils.parseUnits('1.2',18).toString(), //120% for now
  reserveFactor: ethers.utils.parseUnits('0.1',18).toString(),
};

export const strategystETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.72',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.825',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.07',18).toString(),
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '100000', 
  borrowCap: '72000', 
  borrowFactor: ethers.utils.parseUnits('1.28',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};

export const strategywstETH: IReserveParams = {
  strategy: rateStrategyVolatileTwo,
  baseLTV: ethers.utils.parseUnits('0.8',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.825',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.06',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '100000', 
  borrowCap: '24000', 
  borrowFactor: ethers.utils.parseUnits('1.2',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};

export const strategyrETH: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTV: ethers.utils.parseUnits('0.75',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.78',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.075',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '60000', 
  borrowCap: '19200', 
  borrowFactor: ethers.utils.parseUnits('1.25',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};

export const strategystETHCRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.65',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(),
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 1, // CURVE
  supplyCap: '10000', 
  borrowCap: '0', 
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};

export const strategystETHv2CRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.65',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(),
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 1, // CURVE
  supplyCap: '4000', 
  borrowCap: '0', 
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyrETHCRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.5',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.55',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(),
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 2, // CURVE2
  supplyCap: '600', 
  borrowCap: '0', 
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};

export const strategywstETHBPT: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.65',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(),
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 6, // BALANCER
  supplyCap: '800', 
  borrowCap: '0', 
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};

export const strategyrETHBPT: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.5',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.55',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(),
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 6, // BALANCER
  supplyCap: '3000', 
  borrowCap: '0', 
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const LSDBaseConfig: IReserveCollateralParams = {
  baseLTV: ethers.utils.parseUnits('0.9',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.93',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.01',18).toString(),
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), //120% for now
};

export const LSDLPConfig: IReserveCollateralParams = {
  baseLTV: ethers.utils.parseUnits('0.8',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.85',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), //120% for now
};