"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateStrategyVolatileFour = exports.rateStrategyVolatileThree = exports.rateStrategyVolatileTwo = exports.rateStrategyVolatileOne = exports.rateStrategyUnborrowable = exports.rateStrategyLUSD = exports.rateStrategyWETH = exports.rateStrategyStableThree = exports.rateStrategyStableTwo = exports.rateStrategyStableOne = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const constants_1 = require("../../constants");
// BUSD SUSD
exports.rateStrategyStableOne = {
    name: "rateStrategyStableOne",
    optimalUtilizationRate: new bignumber_js_1.default(0.8).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.04).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(1).multipliedBy(constants_1.oneRay).toFixed(),
};
// DAI TUSD
exports.rateStrategyStableTwo = {
    name: "rateStrategyStableTwo",
    optimalUtilizationRate: new bignumber_js_1.default(0.8).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.04).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(0.75).multipliedBy(constants_1.oneRay).toFixed(),
};
// USDC USDT
exports.rateStrategyStableThree = {
    name: "rateStrategyStableThree",
    optimalUtilizationRate: new bignumber_js_1.default(0.9).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.035).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(0.60).multipliedBy(constants_1.oneRay).toFixed(),
};
// WETH
exports.rateStrategyWETH = {
    name: "rateStrategyWETH",
    optimalUtilizationRate: new bignumber_js_1.default(0.8).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.038).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(0.8).multipliedBy(constants_1.oneRay).toFixed(),
};
exports.rateStrategyLUSD = {
    name: "rateStrategyLUSD",
    optimalUtilizationRate: new bignumber_js_1.default(0.8).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.04).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(0.87).multipliedBy(constants_1.oneRay).toFixed(),
};
// Any unborrowable token
exports.rateStrategyUnborrowable = {
    name: "rateStrategyUnborrowable",
    optimalUtilizationRate: new bignumber_js_1.default(0.45).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: '0',
    variableRateSlope1: '0',
    variableRateSlope2: '0',
};
// WBTC
exports.rateStrategyVolatileOne = {
    name: "rateStrategyVolatileOne",
    optimalUtilizationRate: new bignumber_js_1.default(0.45).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.04).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
};
// WSteth
exports.rateStrategyVolatileTwo = {
    name: "rateStrategyVolatileTwo",
    optimalUtilizationRate: new bignumber_js_1.default(0.45).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.045).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(0.8).multipliedBy(constants_1.oneRay).toFixed(),
};
// SNX OP
exports.rateStrategyVolatileThree = {
    name: "rateStrategyVolatileThree",
    optimalUtilizationRate: new bignumber_js_1.default(0.45).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: new bignumber_js_1.default(0).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope1: new bignumber_js_1.default(0.14).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
};
exports.rateStrategyVolatileFour = {
    name: "rateStrategyVolatileFour",
    optimalUtilizationRate: new bignumber_js_1.default(0.45).multipliedBy(constants_1.oneRay).toFixed(),
    baseVariableBorrowRate: '0',
    variableRateSlope1: new bignumber_js_1.default(0.07).multipliedBy(constants_1.oneRay).toFixed(),
    variableRateSlope2: new bignumber_js_1.default(3).multipliedBy(constants_1.oneRay).toFixed(),
};
//# sourceMappingURL=rateStrategies.js.map