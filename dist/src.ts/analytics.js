"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTrancheBalances = exports.userAggregatedTrancheData = exports.userAmountSupplied = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
require("../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json");
//PROTOCOL ANALYTICS
// USER ANALYTICS
/**
 * userAmountSupplied
 * @params { signer: ethers.Signer, underlying: address, network?: string }
 */
async function userAmountSupplied(params, callback) {
}
exports.userAmountSupplied = userAmountSupplied;
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
/**
 * getUserAvailableAssets
 * @parmas { signer: ethers.Signer, network?: string }
 */
/**
 * getUserCollateralAssets
 * @params { signer: ethers.Signer, network?: string }
 */
//# sourceMappingURL=analytics.js.map