import { ethers } from "ethers";
import { deployments } from "./constants";
import { getLendingPoolImpl } from "./utils";

export async function borrow(params: {
    underlying: string;
    trancheId: number;
    amount: ethers.BigNumber | number | string;
    interestRateMode: number;
    referrer?: number;
    signer: ethers.Signer;
    network: string
}, callback?: () => Promise<any>) {
    let client = await params.signer.getAddress()
    let lendingPool = await getLendingPoolImpl(params.signer, params.network);
    await lendingPool.borrow(
        params.underlying, 
        params.trancheId, 
        params.amount, 
        params.interestRateMode, 
        params.referrer || 0, 
        client
    );

    if (callback) {
        await callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error)});
    }
}

export async function supply(params: {
    underlying: string;
    trancheId: number;
    amount: ethers.BigNumber | number | string;
    signer: ethers.Signer;
    network: string;
    referrer?: number;
    collateral?: boolean;
}, callback?: () => Promise<any>) {
    let client = await params.signer.getAddress();
    let lendingPool = await getLendingPoolImpl(params.signer, params.network);
    await lendingPool.deposit(
        params.underlying,
        params.trancheId,
        params.amount,
        client,
        params.referrer || 0
    );

    if (params.collateral) {
        await lendingPool.setUserUseReserveAsCollateral(
            params.underlying, 
            params.trancheId, 
            params.collateral
        );
    }

    if (callback) {
        await callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error)});
    }
}
