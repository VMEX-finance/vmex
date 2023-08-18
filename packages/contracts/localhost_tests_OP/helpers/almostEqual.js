"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.almostEqualOrEqual = void 0;
const chai = require("chai");
const { expect } = chai;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const almostEqualOrEqual = function (expected, actual) {
    const keys = Object.keys(actual);
    keys.forEach((key) => {
        //   if (
        //     key === "lastUpdateTimestamp" ||
        //     key === "marketStableRate" ||
        //     key === "symbol" ||
        //     key === "aTokenAddress" ||
        //     key === "decimals" ||
        //     key === "totalStableDebtLastUpdated"
        //   ) {
        //     // skipping consistency check on accessory data
        //     return;
        //   }
        this.assert(actual[key] != undefined, `Property ${key} is undefined in the actual data`);
        expect(expected[key] != undefined, `Property ${key} is undefined in the expected data`);
        if (expected[key] == null || actual[key] == null) {
            console.log("Found a undefined value for Key ", key, " value ", expected[key], actual[key]);
        }
        if (actual[key] instanceof bignumber_js_1.default) {
            const actualValue = actual[key].decimalPlaces(0, bignumber_js_1.default.ROUND_DOWN);
            const expectedValue = expected[key].decimalPlaces(0, bignumber_js_1.default.ROUND_DOWN);
            this.assert(actualValue.eq(expectedValue) ||
                actualValue.plus(1).eq(expectedValue) ||
                actualValue.eq(expectedValue.plus(1)) ||
                actualValue.plus(2).eq(expectedValue) ||
                actualValue.eq(expectedValue.plus(2)) ||
                actualValue.plus(3).eq(expectedValue) ||
                actualValue.eq(expectedValue.plus(3)), `expected #{act} to be almost equal or equal #{exp} for property ${key}`, `expected #{act} to be almost equal or equal #{exp} for property ${key}`, expectedValue.toFixed(0), actualValue.toFixed(0));
        }
        else {
            this.assert(actual[key] !== null &&
                expected[key] !== null &&
                actual[key].toString() === expected[key].toString(), `expected #{act} to be equal #{exp} for property ${key}`, `expected #{act} to be equal #{exp} for property ${key}`, expected[key], actual[key]);
        }
    });
};
exports.almostEqualOrEqual = almostEqualOrEqual;
//# sourceMappingURL=almostEqual.js.map