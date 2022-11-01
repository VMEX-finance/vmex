"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategyCurveLPToken = exports.strategyOneinch = exports.strategyALCX = exports.strategyLDO = exports.strategyBADGER = exports.strategyCVX = exports.strategyCRV = exports.strategyBAL = exports.strategyFrax = exports.strategySTETH = exports.strategyXSUSHI = exports.strategyZRX = exports.strategyYFI = exports.strategyWBTC = exports.strategyUNI = exports.strategySNX = exports.strategyREN = exports.strategyMKR = exports.strategyMANA = exports.strategyLINK = exports.strategyKNC = exports.strategyWETH = exports.strategyENJ = exports.strategyBAT = exports.strategyAAVE = exports.strategyUSDT = exports.strategyUSDC = exports.strategyTUSD = exports.strategySUSD = exports.strategyDAI = exports.strategyBUSD = void 0;
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
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
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategySTETH = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategyFrax = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '0',
    liquidationThreshold: '0',
    liquidationBonus: '0',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategyBAL = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategyCRV = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: true,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: true,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategyCVX = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: true,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: true,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategyBADGER = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategyLDO = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategyALCX = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategyOneinch = {
    strategy: rateStrategies_1.rateStrategyVolatileFour,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '3500',
    assetType: 0,
    collateralCap: '1000000000000000000000000',
    hasStrategy: false,
    usingGovernanceSetInterestRate: false,
    governanceSetInterestRate: '0'
};
exports.strategyCurveLPToken = {
    strategy: rateStrategies_1.rateStrategyCurve,
    baseLTVAsCollateral: '2500',
    liquidationThreshold: '4500',
    liquidationBonus: '11500',
    borrowingEnabled: false,
    stableBorrowRateEnabled: false,
    reserveDecimals: '18',
    aTokenImpl: types_1.eContractid.AToken,
    reserveFactor: '0',
    assetType: 1,
    collateralCap: '1000000000000000000000000',
    hasStrategy: true,
    usingGovernanceSetInterestRate: true,
    governanceSetInterestRate: '10000000000000000000000000' //1% APY in ray is 0.01 RAY =
};
//# sourceMappingURL=reservesConfigs.js.map