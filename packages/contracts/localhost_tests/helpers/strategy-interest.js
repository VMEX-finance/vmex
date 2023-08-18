"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAdminInterest = exports.calculateExpectedInterest = exports.calculateUserStake = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../../helpers/constants");
const calculateUserStake = (userReserveDataSignerBefore, totalATokens) => {
    return userReserveDataSignerBefore
        .mul(ethers_1.ethers.utils.parseEther("1"))
        .div(totalATokens); //18 decimals
};
exports.calculateUserStake = calculateUserStake;
const calculateExpectedInterest = (strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor, //% with two decimals, like 1000 for 10%
userStake //%stake of profit, with 18 decimals
) => {
    var userAmt = ethers_1.BigNumber.from(constants_1.PERCENTAGE_FACTOR).sub(reserveFactor);
    var interestRaw = strategyBoostedBalance.sub(strategyStartBoostedBalance);
    var usrInterest = interestRaw.mul(userAmt).div(constants_1.PERCENTAGE_FACTOR);
    return usrInterest.mul(userStake).div(ethers_1.ethers.utils.parseEther("1"));
};
exports.calculateExpectedInterest = calculateExpectedInterest;
const calculateAdminInterest = (strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor) => {
    var interestRaw = strategyBoostedBalance.sub(strategyStartBoostedBalance);
    return interestRaw.mul(reserveFactor).div(constants_1.PERCENTAGE_FACTOR);
};
exports.calculateAdminInterest = calculateAdminInterest;
//# sourceMappingURL=strategy-interest.js.map