import { ethers } from 'ethers';
import { eContractid, IReserveParams } from '../../helpers/types';

import {
  rateStrategyStableThree,
  rateStrategyWETH,
  rateStrategyUnborrowable,
  rateStrategyCbETH,
} from './rateStrategies';

export const strategyUSDbC: IReserveParams = {
  strategy: rateStrategyStableThree,
  baseLTVAsCollateral: ethers.utils.parseUnits('0.77',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.8',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '8000000', //8 mil
  borrowCap: '6500000',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), //100% for now
  reserveFactor: ethers.utils.parseUnits('0.1',18).toString(),
};


export const strategyWETH: IReserveParams = {
  strategy: rateStrategyWETH,
  baseLTVAsCollateral: ethers.utils.parseUnits('0.8',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.825',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '5000', //5,000
  borrowCap: '4000', //4,000
  borrowFactor: ethers.utils.parseUnits('1.2',18).toString(), //120% for now
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyCbETH: IReserveParams = {
  strategy: rateStrategyCbETH,
  baseLTVAsCollateral: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.75',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.075',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 8, //CL price adapter type
  supplyCap: '1000', //1,000
  borrowCap: '100', //100
  borrowFactor: ethers.utils.parseUnits('1.3',18).toString(), //130% for now
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyVeloWETHUSDbC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: ethers.utils.parseUnits('0.6',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.65',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '0.05',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), //100% for now
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};

export const strategyVeloCbETHWETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: ethers.utils.parseUnits('0.65',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '700',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), //100% for now
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};

export const strategyBIB01: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: ethers.utils.parseUnits('0',18).toString(), // 0.8 in custom tranche
  liquidationThreshold: ethers.utils.parseUnits('0.825',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 10, //using backed chainlink
  supplyCap: '1000000',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), //100% for now
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyBIBTA: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: ethers.utils.parseUnits('0',18).toString(), // 0.8 in custom tranche
  liquidationThreshold: ethers.utils.parseUnits('0.825',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 10, //backed chainlink
  supplyCap: '1000000',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), //100% for now
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};
