import { eContractid, IReserveParams } from '../../helpers/types';

import {
  rateStrategyStableTwo,
  rateStrategyStableThree,
  rateStrategyWETH,
  rateStrategyLUSD,
  rateStrategyVolatileOne,
  rateStrategyVolatileTwo,
  rateStrategyVolatileThree,
  rateStrategyVolatileFour,
  rateStrategyUnborrowable,
} from './rateStrategies';

export const strategyDAI: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '780000000000000000',
  liquidationThreshold: '830000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '25000000', //don't need to include decimals here, we will convert the decimals before setting
  borrowCap: '16000000',
  borrowFactor: '1000000000000000000', //100%
  reserveFactor: '100000000000000000',
};

export const strategyLUSD: IReserveParams = {
  strategy: rateStrategyLUSD,
  baseLTVAsCollateral: '600000000000000000',
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '3000000',
  borrowCap: '1000000',
  borrowFactor: '1000000000000000000', //100%
  reserveFactor: '100000000000000000',
};

export const strategySUSD: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '600000000000000000',
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1054000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '20000000', //20 mil
  borrowCap: '13000000',
  borrowFactor: '1000000000000000000', //100%
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
  supplyCap: '150000000', //150 mil
  borrowCap: '100000000',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '100000000000000000',
};

export const strategyUSDT: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '800000000000000000',
  liquidationThreshold: '850000000000000000',
  liquidationBonus: '1050000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '6',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '25000000',
  borrowCap: '16000000',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '100000000000000000',
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
  supplyCap: '35000', //35,000
  borrowCap: '19000', //19,000
  borrowFactor: '1200000000000000000', //120% for now
  reserveFactor: '100000000000000000',
};

export const strategySNX: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '300000000000000000',
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1100000000000000000', //10%
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '200000', //200,000
  borrowCap: '50000',
  borrowFactor: '1700000000000000000', //170% for now
  reserveFactor: '150000000000000000', //15%
};

export const strategyWBTC: IReserveParams = {
  strategy: rateStrategyVolatileOne,
  baseLTVAsCollateral: '800000000000000000',
  liquidationThreshold: '825000000000000000',
  liquidationBonus: '1080000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '8',
  aTokenImpl: eContractid.AToken,
  assetType: 0,
  supplyCap: '1200',
  borrowCap: '250',
  borrowFactor: '1200000000000000000', //120% for now
  reserveFactor: '150000000000000000',
};

export const strategywstETH: IReserveParams = {
  strategy: rateStrategyVolatileTwo,
  baseLTVAsCollateral: '800000000000000000',
  liquidationThreshold: '825000000000000000',
  liquidationBonus: '1070000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for STETH
  supplyCap: '25000',
  borrowCap: '1000',
  borrowFactor: '1200000000000000000', //120% for now
  reserveFactor: '150000000000000000',
};

export const strategyRETH: IReserveParams = {
  strategy: rateStrategyVolatileFour,
  baseLTVAsCollateral: '670000000000000000',
  liquidationThreshold: '740000000000000000',
  liquidationBonus: '1075000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 7, 
  supplyCap: '6000',
  borrowCap: '720',
  borrowFactor: '1330000000000000000', //133% for now
  reserveFactor: '150000000000000000',
};

export const strategyFRAX: IReserveParams = {
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '600000000000000000',
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1060000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for FRAX
  supplyCap: '15000000', // 15 mil
  borrowCap: '12000000',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '100000000000000000',
};

export const strategyOP: IReserveParams = {
  strategy: rateStrategyVolatileThree,
  baseLTVAsCollateral: '300000000000000000', //0 means cannot be collateral
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: true,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 0, //this is since there is a chainlink aggregator for OP
  supplyCap: '10000000',
  borrowCap: '500000',
  borrowFactor: '1700000000000000000', //170% for now
  reserveFactor: '150000000000000000',
};

export const strategy3Curve: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '650000000000000000', 
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 1, //1 is enum for Curve
  supplyCap: '500000',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategysUSD3Curve: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 1, //1 is enum for Curve
  supplyCap: '1000000',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategywstETHCRV: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '650000000000000000', 
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 1, //1 is enum for Curve
  supplyCap: '300',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyYearnWETHToken: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '600000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 3, //3 is enum for yearn
  supplyCap: '100',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyStableYearn: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '600000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 3, //3 is enum for yearn
  supplyCap: '1000000',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};


export const strategyVelorETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '650000000000000000', 
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '50',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVelowstETHWETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '650000000000000000', 
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '100',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloUSDCsUSD: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '1',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloETHUSDC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '600000000000000000', 
  liquidationThreshold: '650000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '0.02',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloOPETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '300000000000000000', 
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1150000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '10000',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloOPUSDC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '300000000000000000', 
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1150000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '0.5',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloDAIUSDC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '650000000000000000', 
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '0.3',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloUSDTUSDC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '650000000000000000', 
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '0.00000005', //5e-8
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloLUSDWETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '3000', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloLUSDUSDC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '0.25', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};


export const strategyBeefywstETHCRVToken: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '600000000000000000',
  liquidationBonus: '1120000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 4, //4 is enum for beefy
  supplyCap: '300',
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyBeethovenwstETHETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '650000000000000000',
  liquidationThreshold: '700000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 6, // beethoven
  supplyCap: '100',
  borrowCap: '0',
  borrowFactor: '1000000000000000000',
  reserveFactor: '150000000000000000',  
};


export const strategyBeethovenrETHETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000',
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1100000000000000000',
  borrowingEnabled: false,
  reserveDecimals: '18',
  aTokenImpl: eContractid.AToken,
  assetType: 6, // beethoven
  supplyCap: '600',
  borrowCap: '0',
  borrowFactor: '1000000000000000000',
  reserveFactor: '150000000000000000',  
};

export const strategyVelowstETHOP: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '300000000000000000', 
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '2000', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloWETHOP: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '300000000000000000', 
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '3000', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyVeloUSDCOP: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '300000000000000000', 
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1100000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 5, //5 is enum for velo
  supplyCap: '0.1', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyyvVeloUSDCsUSD: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1120000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 3, // 3 is the enum for yearn
  supplyCap: '0', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyyvVeloWETHUSDC: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1120000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 3, // 3 is the enum for yearn
  supplyCap: '0', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyyvVelowstETHWETH: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '500000000000000000', 
  liquidationThreshold: '550000000000000000',
  liquidationBonus: '1120000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 3, // 3 is the enum for yearn
  supplyCap: '0', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};


export const strategyyvVelowstETHOP: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '300000000000000000', 
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1120000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 3, // 3 is the enum for yearn
  supplyCap: '0', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyyvVeloWETHOP: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '300000000000000000', 
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1120000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 3,
  supplyCap: '0', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};

export const strategyyvVeloUSDCOP: IReserveParams = {
  strategy: rateStrategyUnborrowable,
  baseLTVAsCollateral: '300000000000000000', 
  liquidationThreshold: '400000000000000000',
  liquidationBonus: '1120000000000000000', 
  borrowingEnabled: false,
  reserveDecimals: '18', 
  aTokenImpl: eContractid.AToken,
  assetType: 3,
  supplyCap: '0', 
  borrowCap: '0',
  borrowFactor: '1000000000000000000', //100% for now
  reserveFactor: '150000000000000000',
};
