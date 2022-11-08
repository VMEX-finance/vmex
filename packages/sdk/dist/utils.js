"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReserveData = exports.getAssetData = exports.getLendingPoolReservesList = exports.getUserSingleReserveData = exports.lendingPoolPause = exports.getTrancheNames = exports.approveUnderlying = exports.getUnsignedLP = exports.getLendingPoolImpl = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const ILendingPoolAddressesProvider_json_1 = __importDefault(require("@vmex/contracts/artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json"));
const ILendingPool_json_1 = __importDefault(require("@vmex/contracts/artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json"));
const LendingPoolConfigurator_json_1 = __importDefault(require("@vmex/contracts/artifacts/contracts/protocol/lendingPool/LendingPoolConfigurator.sol/LendingPoolConfigurator.json"));
// import { LendingPoolConfiguratorFactory } from "@vmex/contracts/dist";
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
 * unsignedLendingPool
 * a modified lendingPoolImpl fn doesnt require a signer or network
 */
async function getUnsignedLP(params) {
    let LPAddressProvider = new ethers_1.ethers.Contract(constants_1.deployments.LendingPoolAddressesProvider[`${params.network || 'mainnet'}`].address, ILendingPoolAddressesProvider_json_1.default.abi);
    if (params.signer)
        LPAddressProvider.connect(await params.signer);
    let { abi } = ILendingPool_json_1.default;
    const _lp = new ethers_1.ethers.Contract(await LPAddressProvider.getLendingPool(), abi);
    if (params.signer)
        _lp.connect(params.signer);
    return _lp;
}
exports.getUnsignedLP = getUnsignedLP;
/**
 *
 */
async function approveUnderlying(signer, amount, underlying, spender) {
    let _underlying = new ethers_1.ethers.Contract(underlying, ["function approve(address spender, uint256 value) external returns (bool success)"], signer);
    return await _underlying.connect(signer).approve(spender, amount);
}
exports.approveUnderlying = approveUnderlying;
//temp function
function getNetworkProvider(network) {
    return new ethers_1.ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); //TODO implement
}
/**
 * utility function to query number of tranches present in lending pool
 * @param network
 * @returns BigNumber
 */
async function getTrancheNames(network) {
    let provider = network == 'localhost' ? new ethers_1.ethers.providers.JsonRpcProvider("http://127.0.0.1:8545") : getNetworkProvider(network);
    let signer = new ethers_1.ethers.VoidSigner(ethers_1.ethers.constants.AddressZero, provider);
    const _lpConfiguratorProxy = new ethers_1.ethers.Contract(constants_1.deployments.LendingPoolConfigurator[`${network || "mainnet"}`].address, LendingPoolConfigurator_json_1.default.abi, signer);
    let trancheIds = (await _lpConfiguratorProxy.totalTranches()).toNumber();
    let x = [...Array(trancheIds).keys()];
    return Promise.all(x.map(async (x) => await _lpConfiguratorProxy.trancheNames(x)));
}
exports.getTrancheNames = getTrancheNames;
async function lendingPoolPause(approvedSigner, setPause, network, tranche) {
    let LPAddressProvider = new ethers_1.ethers.Contract(constants_1.deployments.LendingPoolAddressesProvider[`${network}`].address, ILendingPoolAddressesProvider_json_1.default.abi, approvedSigner);
    if (await approvedSigner.getAddress() !== await LPAddressProvider.getPoolAdmin(tranche))
        throw new Error("signer must be pool admin");
    let lendingPool = await getLendingPoolImpl(approvedSigner, network);
    try {
        let _LendingPoolConfiguratorProxy = new ethers_1.ethers.Contract(constants_1.deployments.LendingPoolConfigurator[`${network}`].address, LendingPoolConfigurator_json_1.default.abi, approvedSigner);
        // let LendingPoolConfiguratorProxy = await LendingPoolConfiguratorFactory.connect(deployments.LendingPoolConfigurator[`${network}`].address, approvedSigner);
        await _LendingPoolConfiguratorProxy.setPoolPause(false, tranche);
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