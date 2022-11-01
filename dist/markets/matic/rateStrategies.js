"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateStrategyVolatileFour = exports.rateStrategyVolatileThree = exports.rateStrategyVolatileTwo = exports.rateStrategyVolatileOne = exports.rateStrategyCurve = exports.rateStrategyAAVE = exports.rateStrategyWETH = exports.rateStrategyStableThree = exports.rateStrategyStableTwo = exports.rateStrategyStableOne = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const constants_1 = require("../../helpers/constants");
// BUSD SUSD
exports.rateStrategyStableOne = {
    name: "rateStrategyStableOne",
    optimalUtilizationRate: new bignumber_js_1.default(0.8).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.04).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(1).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope1: '0',
    stableRateSlope2: '0',
};
// DAI TUSD
exports.rateStrategyStableTwo = {
    name: "rateStrategyStableTwo",
    optimalUtilizationRate: new bignumber_js_1.default(0.8).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.04).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(0.75).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope1: new bignumber_js_1.default(0.02).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope2: new bignumber_js_1.default(0.75).multipliedBy(constants_1.oneRay).toFixed(),
};
// USDC USDT
exports.rateStrategyStableThree = {
    name: "rateStrategyStableThree",
    optimalUtilizationRate: new bignumber_js_1.default(0.9).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.04).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(0.60).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope1: new bignumber_js_1.default(0.02).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope2: new bignumber_js_1.default(0.60).multipliedBy(constants_1.oneRay).toFixed(),
};
// WETH
exports.rateStrategyWETH = {
    name: "rateStrategyWETH",
    optimalUtilizationRate: new bignumber_js_1.default(0.65).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.08).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(1).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope1: new bignumber_js_1.default(0.1).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope2: new bignumber_js_1.default(1).multipliedBy(constants_1.oneRay).toFixed(),
};
// AAVE
exports.rateStrategyAAVE = {
    name: "rateStrategyAAVE",
    optimalUtilizationRate: new bignumber_js_1.default(0.45).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: '0',
    variableRateSlope1: '0',
    variableRateSlope2: '0',
    stableRateSlope1: '0',
    stableRateSlope2: '0',
};
// AAVE
exports.rateStrategyCurve = {
    name: "rateStrategyCurve",
    optimalUtilizationRate: new bignumber_js_1.default(1).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: '0',
    variableRateSlope1: '0',
    variableRateSlope2: '0',
    stableRateSlope1: '0',
    stableRateSlope2: '0',
};
// BAT ENJ LINK MANA MKR REN YFI ZRX
exports.rateStrategyVolatileOne = {
    name: "rateStrategyVolatileOne",
    optimalUtilizationRate: new bignumber_js_1.default(0.45).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.07).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope1: new bignumber_js_1.default(0.1).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
};
// KNC WBTC
exports.rateStrategyVolatileTwo = {
    name: "rateStrategyVolatileTwo",
    optimalUtilizationRate: new bignumber_js_1.default(0.65).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.08).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope1: new bignumber_js_1.default(0.1).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
};
// SNX
exports.rateStrategyVolatileThree = {
    name: "rateStrategyVolatileThree",
    optimalUtilizationRate: new bignumber_js_1.default(0.65).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.08).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope1: new bignumber_js_1.default(0.1).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
};
exports.rateStrategyVolatileFour = {
    name: "rateStrategyVolatileFour",
    optimalUtilizationRate: new bignumber_js_1.default(0.45).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: '0',
    variableRateSlope1: new bignumber_js_1.default(0.07).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
    stableRateSlope1: '0',
    stableRateSlope2: '0',
};
//# sourceMappingURL=rateStrategies.js.map