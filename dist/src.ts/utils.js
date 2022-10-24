"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReserveData = exports.getAssetData = exports.getLendingPoolReservesList = exports.getUserSingleReserveData = exports.lendingPoolPause = exports.approveUnderlying = exports.getLendingPoolImpl = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const ILendingPoolAddressesProvider_json_1 = __importDefault(require("../artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json"));
const ILendingPool_json_1 = __importDefault(require("../artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json"));
const types_1 = require("../types");
/**
 * network agnostic function for getting the correct LendingPool address
 * @param signer
 * @param network
 * @param test
 */
async function getLendingPoolImpl(signer, network, test) {
    let LPAddressProvider = new ethers_1.ethers.Contract(constants_1.deployments.LendingPoolAddressesProvider[`${network}`].address, ILendingPoolAddressesProvider_json_1.default.abi, signer);
    let address = await LPAddressProvider.getLendingPool();
    let { abi } = ILendingPool_json_1.default;
    return new ethers_1.ethers.Contract(address, abi, signer);
}
exports.getLendingPoolImpl = getLendingPoolImpl;
/**
 *
 */
async function approveUnderlying(signer, amount, underlying, spender) {
    let _underlying = new ethers_1.ethers.Contract(underlying, ["function approve(address spender, uint256 value) external returns (bool success)"], signer);
    return await _underlying.connect(signer).approve(spender, amount);
}
exports.approveUnderlying = approveUnderlying;
async function lendingPoolPause(approvedSigner, setPause, network, tranche) {
    let LPAddressProvider = new ethers_1.ethers.Contract(constants_1.deployments.LendingPoolAddressesProvider[`${network}`].address, ILendingPoolAddressesProvider_json_1.default.abi, approvedSigner);
    if (await approvedSigner.getAddress() !== await LPAddressProvider.getPoolAdmin(tranche))
        throw new Error("signer must be pool admin");
    let lendingPool = await getLendingPoolImpl(approvedSigner, network);
    try {
        let LendingPoolConfiguratorProxy = await types_1.LendingPoolConfiguratorFactory.connect(constants_1.deployments.LendingPoolConfigurator[`${network}`].address, approvedSigner);
        await LendingPoolConfiguratorProxy.setPoolPause(false, tranche);
        return await lendingPool.paused(tranche);
    }
    catch (error) {
        console.log(error);
        throw error;
        // throw new Error("Failed to set LendingPool Pause Status")
    }
}
exports.lendingPoolPause = lendingPoolPause;
async function getUserSingleReserveData(signer, network, asset, tranche) {
    let lendingPool = await getLendingPoolImpl(signer, network);
    return await lendingPool.getReserveData(asset, tranche);
}
exports.getUserSingleReserveData = getUserSingleReserveData;
async function getLendingPoolReservesList(signer, network, tranche) {
    let lendingPool = await getLendingPoolImpl(signer, network);
    return await lendingPool.getReservesList(tranche);
}
exports.getLendingPoolReservesList = getLendingPoolReservesList;
async function getAssetData(signer, network, asset, tranche) {
    let lendingPool = await getLendingPoolImpl(signer, network);
    return await lendingPool.getAssetData(asset, tranche);
}
exports.getAssetData = getAssetData;
async function getReserveData(signer, network, asset, tranche) {
    let lendingPool = await getLendingPoolImpl(signer, network);
    return await lendingPool.getReserveData(asset, tranche);
}
exports.getReserveData = getReserveData;
//# sourceMappingURL=utils.js.map