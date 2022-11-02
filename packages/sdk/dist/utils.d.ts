import { ethers } from "ethers";
/**
 * network agnostic function for getting the correct LendingPool address
 * @param signer
 * @param network
 * @param test
 */
export declare function getLendingPoolImpl(signer: ethers.Signer, network: string, test?: boolean): Promise<ethers.Contract>;
/**
 *
 */
export declare function approveUnderlying(signer: ethers.Signer, amount: any, underlying: string, spender: string): Promise<any>;
export declare function lendingPoolPause(approvedSigner: ethers.Signer, setPause: boolean, network: string, tranche: number): Promise<any>;
export declare function getUserSingleReserveData(signer: ethers.Signer, network: string, asset: string, tranche: number): Promise<any>;
export declare function getLendingPoolReservesList(signer: ethers.Signer, network: string, tranche: number): Promise<any>;
export declare function getAssetData(signer: ethers.Signer, network: string, asset: string, tranche: number): Promise<any>;
export declare function getReserveData(signer: ethers.Signer, network: string, asset: string, tranche: number): Promise<any>;
