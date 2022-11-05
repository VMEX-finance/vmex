"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTrancheBalances = exports.userAggregatedTrancheData = void 0;
const constants_1 = require("./constants");
require("@vmex/contracts/artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json");
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
//PROTOCOL ANALYTICS
// export async function totalValueLocked(params?: {
//     network: string;
//     test: boolean;
// }, callback?: () => Promise<UserReserveData>) {
//     let lendingPool = await getLendingPool();
//     //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed). 
// }
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
    const { abi } = require("@vmex/contracts/artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json");
    const balanceProvider = new ethers_1.ethers.Contract(_balanceProviderAddress, abi, params.signer);
    return await balanceProvider.getUserWalletBalances(provider, await params.signer.getAddress(), params.tranche);
}
exports.userTrancheBalances = userTrancheBalances;
/**
 * getUserReserveConfig
 * @params { signer: ethers.Signer, underlying: address, network?: string }
 */
// export async function totalTranches(params?: {
//     network: string;
//     test: boolean;
// }, callback?: () => Promise<BigNumber>) {
//     let configurator = await getLendingPoolConfiguratorProxy();
//     return configurator.totalTranches;
//     //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed). 
// }
// export async function totalMarkets(params?: {
//     network: string;
//     test: boolean;
// }, callback?: () => Promise<BigNumber>) {
//     let configurator = await getLendingPoolConfiguratorProxy();
//     return configurator.totalTranches;
//     //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed). 
// }
//tranche level
// //user level (querying by wallet address)
//  export async function userInfo(params: {
//     underlying: string;
//     trancheId: string;
//     signer: ethers.Signer; //assume signer is also address that you want
//     network?: string;
//     test?: boolean;
// }, callback?: () => Promise<UserReserveData>) {
//     let lendingPool = await getLendingPool();
//     let helpersContract = await getAaveProtocolDataProvider();
//     return getUserData(lendingPool, helpersContract, params.underlying, params.trancheId, await params.signer.getAddress() );
// }
//# sourceMappingURL=analytics.js.map