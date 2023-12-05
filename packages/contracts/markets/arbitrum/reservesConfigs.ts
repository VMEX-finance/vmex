import { ethers } from 'ethers';
import { eContractid, IReserveParams } from '../../helpers/types';

import {
  rateStrategyStableOne,
  rateStrategyStableTwo,
  rateStrategyStableThree,
  rateStrategyVolatileOne,
  rateStrategyVolatileTwo,
  rateStrategyWETH,
  rateStrategyUnborrowable,
  rateStrategywstETH,
} from './rateStrategies';

export const strategyUSDCe: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTV: ethers.utils.parseUnits('0.81',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.86',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '150000000', //150 mil
  borrowCap: '100000000', //100 mil
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), //100% for now
  reserveFactor: ethers.utils.parseUnits('0.1',18).toString(),
};


export const strategyWETH: IReserveParams = {
  strategy: rateStrategyWETH,
  baseLTV: ethers.utils.parseUnits('0.825',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.85',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '70000', 
  borrowCap: '40000', 
  borrowFactor: ethers.utils.parseUnits('1.18',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategywstETH: IReserveParams = {
  strategy: rateStrategywstETH,
  baseLTV: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.79',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.075',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 8, //CL price adapter type
  supplyCap: '45000', 
  borrowCap: '1600', 
  borrowFactor: ethers.utils.parseUnits('1.3',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyWBTC: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTV: ethers.utils.parseUnits('0.73',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.78',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.07',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '8',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '4200', 
  borrowCap: '1115', 
  borrowFactor: ethers.utils.parseUnits('1.27',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.20',18).toString(),
};


export const strategyUSDT: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTV: ethers.utils.parseUnits('0.75',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.8',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '50000000', //50 mil
  borrowCap: '35000000', //35 mil
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.1',18).toString(),
};

export const strategyUSDC: IReserveParams = {
  strategy: rateStrategyStableOne,
  baseLTV: ethers.utils.parseUnits('0.81',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.86',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '40000000', //40 mil
  borrowCap: '40000000', //40 mil
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), //100% for now
  reserveFactor: ethers.utils.parseUnits('0.1',18).toString(),
};


export const strategyDAI: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTV: ethers.utils.parseUnits('0.77',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.82',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '50000000', //50 mil
  borrowCap: '30000000', //30 mil
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.1',18).toString(),
};


export const strategyARB: IReserveParams = {
  strategy: rateStrategyVolatileTwo,
  baseLTV: ethers.utils.parseUnits('0.50',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.60',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '20000000', //20 mil
  borrowCap: '16000000', //16 mil
  borrowFactor: ethers.utils.parseUnits('1.5',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.2',18).toString(),
};


export const strategyrETH: IReserveParams = {
  strategy: rateStrategyVolatileTwo,
  baseLTV: ethers.utils.parseUnits('0.67',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.74',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.075',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 8, //CL price adapter type
  supplyCap: '1700', 
  borrowCap: '340', 
  borrowFactor: ethers.utils.parseUnits('1.33',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyLUSD: IReserveParams = {
  strategy: rateStrategyStableThree,
  baseLTV: ethers.utils.parseUnits('0.6',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.05',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '1800000', //1.8 mil
  borrowCap: '900000', //0.9 mil
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.1',18).toString(),
};


export const strategyFRAX: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTV: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationThreshold: ethers.utils.parseUnits('0.75',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.06',18).toString(),
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '7000000', //7 mil
  borrowCap: '5500000', //5.5 mil
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.1',18).toString(),
};


export const strategyChronosWETHUSDC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.6',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.65',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '0.00004',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyChronosWETHUSDT: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.55',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.6',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '0.000002',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyWstETHBPT: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.65',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 6, //6 for beethoven
  supplyCap: '300',
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
  assetType: 6, //6 for beethoven
  supplyCap: '200',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategy2CRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.65',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 1, //1 for curve v1 stable
  supplyCap: '800000',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategywstETHCRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.65',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 1, //1 for curve v1 stable
  supplyCap: '200',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyFRAXCRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.6',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.65',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 1, //1 for curve v1 stable
  supplyCap: '130000',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyCMLTARB: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.4',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.5',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.15',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 9, //9 for camelot
  supplyCap: '4000',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyCMLTETHUSDC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.6',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.65',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 9, //9 for camelot
  supplyCap: '0.0015',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyCMLTUSDTUSDC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.65',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 9, //9 for camelot
  supplyCap: ethers.utils.formatUnits("51189921590", 18),
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyCMLTwstETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.65',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.7',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 9, //9 for camelot
  supplyCap: '20',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};


export const strategyCMLTLUSD: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTV: ethers.utils.parseUnits('0.5',18).toString(), 
  liquidationThreshold: ethers.utils.parseUnits('0.55',18).toString(),
  liquidationBonus: ethers.utils.parseUnits('1.1',18).toString(), 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 9, //9 for camelot
  supplyCap: '0.03',
  borrowCap: '0',
  borrowFactor: ethers.utils.parseUnits('1',18).toString(), 
  reserveFactor: ethers.utils.parseUnits('0.15',18).toString(),
};