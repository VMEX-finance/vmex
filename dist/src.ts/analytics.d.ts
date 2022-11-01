import "../artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json";
import { BigNumber, ethers } from "ethers";
import { UserReserveData } from "../test-suites/test-aave/helpers/utils/interfaces";
import { UserAccountData } from "../localhost_tests/interfaces";
export declare function totalValueLocked(params?: {
    network: string;
    test: boolean;
}, callback?: () => Promise<UserReserveData>): Promise<void>;
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
export declare function totalTranches(params?: {
    network: string;
    test: boolean;
}, callback?: () => Promise<BigNumber>): Promise<(overrides?: ethers.CallOverrides | undefined) => Promise<BigNumber>>;
export declare function totalMarkets(params?: {
    network: string;
    test: boolean;
}, callback?: () => Promise<BigNumber>): Promise<(overrides?: ethers.CallOverrides | undefined) => Promise<BigNumber>>;
export declare function userInfo(params: {
    underlying: string;
    trancheId: string;
    signer: ethers.Signer;
    network?: string;
    test?: boolean;
}, callback?: () => Promise<UserReserveData>): Promise<UserReserveData>;
export declare function userCollateralInfo(params: {
    trancheId: string;
    signer: ethers.Signer;
    network?: string;
    test?: boolean;
}, callback?: () => Promise<UserAccountData>): Promise<{
    totalCollateralETH: BigNumber;
    totalDebtETH: BigNumber;
    availableBorrowsETH: BigNumber;
    currentLiquidationThreshold: BigNumber;
    ltv: BigNumber;
    healthFactor: BigNumber;
    0: BigNumber;
    1: BigNumber;
    2: BigNumber;
    3: BigNumber;
    4: BigNumber;
    5: BigNumber;
}>;
