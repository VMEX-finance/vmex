"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurvePrice = void 0;
const ethers_1 = require("ethers");
const getCurvePrice = (vPrice, prices) => {
    var N = prices.length;
    console.log(prices);
    var prod = 1;
    for (var i = 0; i < N; i++) {
        prod = parseFloat(ethers_1.utils.formatEther(prices[i])) * (prod);
    }
    return prod ** (1 / N);
};
exports.getCurvePrice = getCurvePrice;
//# sourceMappingURL=curve-calculation.js.map