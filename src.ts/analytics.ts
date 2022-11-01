import { ethers } from "ethers";
import { deployments } from "./constants";
import { getLendingPoolImpl, approveUnderlying } from "./utils";
import "../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json";
//PROTOCOL ANALYTICS

// USER ANALYTICS
/**
 * userAmountSupplied
 * @params { signer: ethers.Signer, underlying: address, network?: string }
 */

export async function userAmountSupplied(params: {
    underlying: string;
    trancheId: number;
    signer: ethers.Signer;
    network?: string;
    test?: boolean;
}, callback?: () => Promise<any>) {
    
}

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
export async function userAggregatedTrancheData( params: { 
    signer: ethers.Signer;
    tranche: number;
    network?: string;
    test?: boolean;
}, callback?: () => Promise<any>) {
    const lendingPool = await getLendingPoolImpl(params.signer, params.network || "mainnet");
    return await lendingPool.getUserAccountData(await params.signer.getAddress(), params.tranche);
}

/**
 * userTrancheBalances
 * @params { signer: ethers.Signer, tranche: number, network?: string }
 * @returns tuple(address, uint256);
 */
export async function userTrancheBalances( params: {
    signer: ethers.Signer,
    tranche: number,
    network?: string
}, callback?: () => Promise<any> ) {
    const provider = deployments.LendingPoolAddressesProvider[`${params.network || "localhost"}`].address;
    const _balanceProviderAddress = deployments.WalletBalanceProvider[`${params.network || "localhost"}`].address;
    const { abi } = require("../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json");

    const balanceProvider = new ethers.Contract(_balanceProviderAddress, abi, params.signer);
    return await balanceProvider.getUserWalletBalances(provider, await params.signer.getAddress(), params.tranche);
}


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



