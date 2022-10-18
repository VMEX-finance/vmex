"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supply = exports.swapBorrowRateMode = exports.repay = exports.withdraw = exports.markReserveAsCollateral = exports.borrow = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
async function borrow(params, callback) {
    let client = await params.signer.getAddress();
    let lendingPool = await (0, utils_1.getLendingPoolImpl)(params.signer, params.network);
    await lendingPool.borrow(params.underlying, params.trancheId, params.amount, params.interestRateMode, params.referrer || 0, client);
    if (callback) {
        await callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error); });
    }
}
exports.borrow = borrow;
async function markReserveAsCollateral(params, callback) {
    const client = await params.signer.getAddress();
    const lendingPool = await (0, utils_1.getLendingPoolImpl)(params.signer, params.network);
    await lendingPool.setUserUseReserveAsCollateral(params.asset, params.trancheId, params.useAsCollateral);
    if (callback) {
        await callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error); });
    }
}
exports.markReserveAsCollateral = markReserveAsCollateral;
async function withdraw(params, callback) {
    let client = await params.signer.getAddress();
    let to = params.to || client;
    let lendingPool = await (0, utils_1.getLendingPoolImpl)(params.signer, params.network);
    await lendingPool.withdraw(params.asset, params.trancheId, params.amount, params.interestRateMode, params.referralCode || 0, client);
    if (callback) {
        await callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error); });
    }
}
exports.withdraw = withdraw;
async function repay(params, callback) {
    let client = await params.signer.getAddress();
    let lendingPool = await (0, utils_1.getLendingPoolImpl)(params.signer, params.network);
    await lendingPool.repay(params.asset, params.trancheId, params.amount, params.rateMode, client);
    if (callback) {
        callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error); });
    }
}
exports.repay = repay;
async function swapBorrowRateMode(params, callback) {
    let lendingPool = await (0, utils_1.getLendingPoolImpl)(params.signer, params.network);
    await lendingPool.swapBorrowRateMode(params.asset, params.trancheId, params.rateMode);
    if (callback) {
        callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error); });
    }
}
exports.swapBorrowRateMode = swapBorrowRateMode;
async function supply(params, callback) {
    let client = await params.signer.getAddress();
    let amount = ethers_1.ethers.utils.parseEther(params.amount);
    let lendingPool = await (0, utils_1.getLendingPoolImpl)(params.signer, params.network);
    try {
        await (0, utils_1.approveUnderlying)(params.signer, amount, params.underlying, lendingPool.address);
    }
    catch (error) {
        throw (new Error("failed to approve spend for underlying asset"));
    }
    try {
        if (!params.test) {
            await lendingPool.deposit(params.underlying, params.trancheId, amount, client, params.referrer || 0);
        }
        await lendingPool.deposit(params.underlying, params.trancheId, amount, client, params.referrer || 0, {
            gasLimit: "8000000"
        });
    }
    catch (error) {
        throw error;
    }
    if (params.collateral) {
        await lendingPool.setUserUseReserveAsCollateral(params.underlying, params.trancheId, params.collateral);
    }
    if (callback) {
        return await callback();
    }
}
exports.supply = supply;
//# sourceMappingURL=protocol.js.map