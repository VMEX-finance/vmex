import { ethers } from "ethers";
export declare function borrow(params: {
    underlying: string;
    trancheId: number;
    amount: ethers.BigNumber | number | string;
    interestRateMode: number;
    referrer?: number;
    signer: ethers.Signer;
    network: string;
    test?: boolean;
}, callback?: () => Promise<any>): Promise<void>;
export declare function markReserveAsCollateral(params: {
    signer: ethers.Signer;
    network: string;
    asset: string;
    trancheId: number;
    useAsCollateral: boolean;
}, callback?: () => Promise<any>): Promise<any>;
export declare function withdraw(params: {
    asset: string;
    to?: string;
    trancheId: number;
    signer: ethers.Signer;
    interestRateMode: number;
    referralCode: number;
    network: string;
    amount: number | ethers.BigNumberish;
}, callback?: () => Promise<any>): Promise<void>;
export declare function repay(params: {
    asset: string;
    trancheId: number;
    signer: ethers.Signer;
    rateMode: number;
    amount: number | ethers.BigNumberish;
    network: string;
}, callback?: () => Promise<any>): Promise<void>;
export declare function swapBorrowRateMode(params: {
    asset: string;
    trancheId: number;
    rateMode: number;
    signer: ethers.Signer;
    network: string;
}, callback?: () => Promise<any>): Promise<void>;
export declare function supply(params: {
    underlying: string;
    trancheId: number;
    amount: string;
    signer: ethers.Signer;
    network: string;
    referrer?: number;
    collateral?: boolean;
    test?: boolean;
}, callback?: () => Promise<any>): Promise<any>;
