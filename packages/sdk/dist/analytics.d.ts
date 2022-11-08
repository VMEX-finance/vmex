import "@vmex/contracts/artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json";
import { ethers } from "ethers";
/**
 * calcProtocolTVL()
 * @params { network: string, test: bool }
 * @returns uint(aTokens, underlying)
 * returns a tuple containing the sum of all aTokens in all pools - reflects total supplied, and the sum of underlying amounts - reflecting total borrowed
 */
export declare function calcProtocolTVL(params?: {
    network?: string;
    test: boolean;
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
 * @returns tuple(address, uint256)[];
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
