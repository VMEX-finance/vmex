import { ethers } from "ethers";
import "../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json";
/**
 * userAmountSupplied
 * @params { signer: ethers.Signer, underlying: address, network?: string }
 */
export declare function userAmountSupplied(params: {
    underlying: string;
    trancheId: number;
    signer: ethers.Signer;
    network?: string;
    test?: boolean;
}, callback?: () => Promise<any>): Promise<void>;
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
export declare function userAggregatedTrancheData(params: {
    signer: ethers.Signer;
    tranche: number;
    network?: string;
    test?: boolean;
}, callback?: () => Promise<any>): Promise<any>;
/**
 * userTrancheBalances
 * @params { signer: ethers.Signer, tranche: number, network?: string }
 * @returns tuple(address, uint256);
 */
export declare function userTrancheBalances(params: {
    signer: ethers.Signer;
    tranche: number;
    network?: string;
}, callback?: () => Promise<any>): Promise<any>;
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
