"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategyXSUSHI = exports.strategyZRX = exports.strategyYFI = exports.strategyWBTC = exports.strategyUNI = exports.strategySNX = exports.strategyREN = exports.strategyMKR = exports.strategyMANA = exports.strategyLINK = exports.strategyKNC = exports.strategyWETH = exports.strategyENJ = exports.strategyBAT = exports.strategyAAVE = exports.strategyUSDT = exports.strategyUSDC = exports.strategyTUSD = exports.strategySUSD = exports.strategyDAI = exports.strategyBUSD = void 0;
const types_1 = require("../../helpers/types");
const rateStrategies_1 = require("./rateStrategies");
exports.strategyBUSD = {
    strategy: rateStrategies_1.rateStrategyStableOne,
    baseLTVAsCollateral: '0',
    liquidationThreshold: '0',
    liquidationBonus: '0',
    borrowingEnabled: true,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '1000',
    risk: 0,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyDAI = {
    strategy: rateStrategies_1.rateStrategyStableTwo,
    baseLTVAsCollateral: '7500',
    liquidationThreshold: '8000',
    liquidationBonus: '10500',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '1000',
    risk: 0,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategySUSD = {
    strategy: rateStrategies_1.rateStrategyStableOne,
    baseLTVAsCollateral: '0',
    liquidationThreshold: '0',
    liquidationBonus: '0',
    borrowingEnabled: true,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 0,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyTUSD = {
    strategy: rateStrategies_1.rateStrategyStableTwo,
    baseLTVAsCollateral: '7500',
    liquidationThreshold: '8000',
    liquidationBonus: '10500',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '1000',
    risk: 0,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyUSDC = {
    strategy: rateStrategies_1.rateStrategyStableThree,
    baseLTVAsCollateral: '8000',
    liquidationThreshold: '8500',
    liquidationBonus: '10500',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '6',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '1000',
    risk: 0,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyUSDT = {
    strategy: rateStrategies_1.rateStrategyStableThree,
    baseLTVAsCollateral: '0',
    liquidationThreshold: '0',
    liquidationBonus: '0',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '6',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '1000',
    risk: 0,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyAAVE = {
    strategy: rateStrategies_1.rateStrategyAAVE,
    baseLTVAsCollateral: '5000',
    liquidationThreshold: '6500',
    liquidationBonus: '11000',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '0',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyBAT = {
    strategy: rateStrategies_1.rateStrategyVolatileOne,
    baseLTVAsCollateral: '7000',
    liquidationThreshold: '7500',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyENJ = {
    strategy: rateStrategies_1.rateStrategyVolatileOne,
    baseLTVAsCollateral: '5500',
    liquidationThreshold: '6000',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyWETH = {
    strategy: rateStrategies_1.rateStrategyWETH,
    baseLTVAsCollateral: '8000',
    liquidationThreshold: '8250',
    liquidationBonus: '10500',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '1000',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyKNC = {
    strategy: rateStrategies_1.rateStrategyVolatileTwo,
    baseLTVAsCollateral: '6000',
    liquidationThreshold: '6500',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyLINK = {
    strategy: rateStrategies_1.rateStrategyVolatileOne,
    baseLTVAsCollateral: '7000',
    liquidationThreshold: '7500',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyMANA = {
    strategy: rateStrategies_1.rateStrategyVolatileOne,
    baseLTVAsCollateral: '6000',
    liquidationThreshold: '6500',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyMKR = {
    strategy: rateStrategies_1.rateStrategyVolatileOne,
    baseLTVAsCollateral: '6000',
    liquidationThreshold: '6500',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyREN = {
    strategy: rateStrategies_1.rateStrategyVolatileOne,
    baseLTVAsCollateral: '5500',
    liquidationThreshold: '6000',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategySNX = {
    strategy: rateStrategies_1.rateStrategyVolatileThree,
    baseLTVAsCollateral: '1500',
    liquidationThreshold: '4000',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
// Invalid borrow rates in params currently, replaced with snx params
exports.strategyUNI = {
    strategy: rateStrategies_1.rateStrategyVolatileThree,
    baseLTVAsCollateral: '6000',
    liquidationThreshold: '6500',
    liquidationBonus: '11000',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.DelegationAwareAToken,
    reserveFactor: '2000',
    risk: 1,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyWBTC = {
    strategy: rateStrategies_1.rateStrategyVolatileTwo,
    baseLTVAsCollateral: '7000',
    liquidationThreshold: '7500',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '8',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 0,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyYFI = {
    strategy: rateStrategies_1.rateStrategyVolatileOne,
    baseLTVAsCollateral: '4000',
    liquidationThreshold: '5500',
    liquidationBonus: '11500',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 2,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyZRX = {
    strategy: rateStrategies_1.rateStrategyVolatileOne,
    baseLTVAsCollateral: '6000',
    liquidationThreshold: '6500',
    liquidationBonus: '11000',
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '2000',
    risk: 2,
    isLendable: true,
    allowedHigherTranche: true
};
exports.strategyXSUSHI = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: true,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    risk: 2,
    isLendable: true,
    allowedHigherTranche: true
};
