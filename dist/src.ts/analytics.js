"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCollateralInfo = exports.userInfo = exports.totalMarkets = exports.totalTranches = exports.userTrancheBalances = exports.userAggregatedTrancheData = exports.totalValueLocked = void 0;
const constants_1 = require("./constants");
require("../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json");
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
const helpers_1 = require("../test-suites/test-aave/helpers/utils/helpers");
const contracts_getters_1 = require("../helpers/contracts-getters");
//PROTOCOL ANALYTICS
async function totalValueLocked(params, callback) {
    let lendingPool = await (0, contracts_getters_1.getLendingPool)();
    //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed). 
}
exports.totalValueLocked = totalValueLocked;
/**
 * userAggregatedTrancheData
 * @params { signer: ethers.Signer, tranche: number, network?: string }
 * @returns Promise {
 *  totalCollateralETH: BigNumber
 *  totalDebtETH: BigNumber
 *  availableBorrowsETH: BigNumber
 *  currentLiquidationThreshold: BigNumber
 *  ltv: BigNumber
 *  healthFactor: BigNumber
 * }
 */
async function userAggregatedTrancheData(params, callback) {
    const lendingPool = await (0, utils_1.getLendingPoolImpl)(params.signer, params.network || "mainnet");
    return await lendingPool.getUserAccountData(await params.signer.getAddress(), params.tranche);
}
exports.userAggregatedTrancheData = userAggregatedTrancheData;
/**
 * userTrancheBalances
 * @params { signer: ethers.Signer, tranche: number, network?: string }
 * @returns tuple(address, uint256);
 */
async function userTrancheBalances(params, callback) {
    const provider = constants_1.deployments.LendingPoolAddressesProvider[`${params.network || "localhost"}`].address;
    const _balanceProviderAddress = constants_1.deployments.WalletBalanceProvider[`${params.network || "localhost"}`].address;
    const { abi } = require("../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json");
    const balanceProvider = new ethers_1.ethers.Contract(_balanceProviderAddress, abi, params.signer);
    return await balanceProvider.getUserWalletBalances(provider, await params.signer.getAddress(), params.tranche);
}
exports.userTrancheBalances = userTrancheBalances;
/**
 * getUserReserveConfig
 * @params { signer: ethers.Signer, underlying: address, network?: string }
 */
async function totalTranches(params, callback) {
    let configurator = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)();
    return configurator.totalTranches;
    //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed). 
}
exports.totalTranches = totalTranches;
async function totalMarkets(params, callback) {
    let configurator = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)();
    return configurator.totalTranches;
    //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed). 
}
exports.totalMarkets = totalMarkets;
//tranche level
//user level (querying by wallet address)
async function userInfo(params, callback) {
    let lendingPool = await (0, contracts_getters_1.getLendingPool)();
    let helpersContract = await (0, contracts_getters_1.getAaveProtocolDataProvider)();
    return (0, helpers_1.getUserData)(lendingPool, helpersContract, params.underlying, params.trancheId, await params.signer.getAddress());
}
exports.userInfo = userInfo;
async function userCollateralInfo(params, callback) {
    let lendingPool = await (0, contracts_getters_1.getLendingPool)();
    return lendingPool.connect(params.signer).getUserAccountData(await params.signer.getAddress(), params.trancheId);
}
exports.userCollateralInfo = userCollateralInfo;
//# sourceMappingURL=analytics.js.map