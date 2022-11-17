import { ethers } from "ethers";
import { deployments } from "./constants";
import { getLendingPoolImpl, approveUnderlying, getLendingPoolConfigurationImpl } from "./utils";


export async function borrow(params: {
    underlying: string;
    trancheId: number;
    amount: ethers.BigNumber | number | string;
    interestRateMode: number;
    referrer?: number;
    signer: ethers.Signer;
    network: string,
    test?: boolean
}, callback?: () => Promise<any>) {
    let client = await params.signer.getAddress()
    let lendingPool = await getLendingPoolImpl(params.signer, params.network);
    if (params.test) {
        await lendingPool.borrow(
            params.underlying, 
            params.trancheId, 
            params.amount, 
            params.interestRateMode, 
            params.referrer || 0, 
            client,
            {
                gasLimit: "8000000"
            }
        );
    } else {
        await lendingPool.borrow(
            params.underlying, 
            params.trancheId, 
            params.amount, 
            params.interestRateMode, 
            params.referrer || 0, 
            client,
        );
    }

    if (callback) {
        await callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error)});
    }
}

export async function markReserveAsCollateral(params: {
    signer: ethers.Signer;
    network: string;
    asset: string;
    trancheId: number;
    useAsCollateral: boolean;    
}, callback?: () => Promise<any>){
    const client = await params.signer.getAddress();
    const lendingPool = await getLendingPoolImpl(params.signer, params.network);
    await lendingPool.setUserUseReserveAsCollateral(
        params.asset,
        params.trancheId,
        params.useAsCollateral
    );

    if (callback) {
        return await callback()
    }
}


export async function withdraw(params: {
    asset: string;
    to?: string;
    trancheId: number;
    signer: ethers.Signer;
    interestRateMode: number;
    referralCode: number;
    network: string;
    amount: number | ethers.BigNumberish;
}, callback?: () => Promise<any>) {
    let client = await params.signer.getAddress();
    let to = params.to || client
    let lendingPool = await getLendingPoolImpl(params.signer, params.network);
    await lendingPool.withdraw(
        params.asset,
        params.trancheId,
        params.amount,
        params.interestRateMode,
        params.referralCode || 0,
        client
    );

    if (callback) {
        await callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error)})
    }
}

export async function repay(params: {
    asset: string;
    trancheId: number;
    signer: ethers.Signer;
    rateMode: number;
    amount: number | ethers.BigNumberish;
    network: string;
}, callback?: () => Promise<any>) {
    let client = await params.signer.getAddress();
    let lendingPool = await getLendingPoolImpl(params.signer, params.network);
    await lendingPool.repay(
        params.asset,
        params.trancheId,
        params.amount,
        params.rateMode,
        client
    );

    if (callback) {
        callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error)})
    }
}

export async function swapBorrowRateMode(params: {
    asset: string;
    trancheId: number;
    rateMode: number;
    signer: ethers.Signer;
    network: string;
}, callback?: () => Promise<any>) {
    let lendingPool = await getLendingPoolImpl(params.signer, params.network);
    await lendingPool.swapBorrowRateMode(
        params.asset,
        params.trancheId,
        params.rateMode
    );

    if (callback) {
        callback().catch((error) => { console.error("CALLBACK_ERROR: \n", error)});
    }
}

export async function supply(params: {
    underlying: string;
    trancheId: number;
    amount: string;
    signer: ethers.Signer;
    network: string;
    referrer?: number;
    collateral?: boolean;
    test?: boolean;
}, callback?: () => Promise<any>) {
    let client = await params.signer.getAddress();
    let amount = ethers.utils.parseEther(params.amount);
    let lendingPool = await getLendingPoolImpl(params.signer, params.network);

    try {
        await approveUnderlying(params.signer, amount, params.underlying, lendingPool.address);
    } catch (error) {
        throw(new Error("failed to approve spend for underlying asset"));
    }

    try {
        if (!params.test) {
            await lendingPool.deposit(
                params.underlying,
                params.trancheId,
                amount,
                client,
                params.referrer || 0
            );
        }

        await lendingPool.deposit(
            params.underlying,
            params.trancheId,
            amount,
            client,
            params.referrer || 0,
            {
                gasLimit: "8000000"
            }
        );

    } catch (error) {
        throw new Error("Lending Pool Failed with " + error);
    }

    if (params.collateral) {
        await lendingPool.setUserUseReserveAsCollateral(
            params.underlying, 
            params.trancheId, 
            params.collateral
        );
    }

    if (callback) {
        return await callback()
    }
}

export async function claimTrancheId(params: {
    name: string;
    admin: ethers.Signer;
    network: string;
}, callback?: () => Promise<any>) {
    let configurator = await getLendingPoolConfigurationImpl(params.network);

    try {
        await configurator.connect(params.admin).claimTrancheId(
            params.name,
            await params.admin.getAddress(),
            {
                gasLimit: "8000000"
            }
        );

    } catch (error) {
        throw new Error("Configurator Failed with " + error);
    }

    if (callback) {
        return await callback()
    }
}

export async function initTranche(params: {
    assetAddresses: string[],
    reserveFactors: string[],
    forceDisabledBorrow: boolean[],
    forceDisabledCollateral: boolean[],
    admin: ethers.Signer,
    treasuryAddress: string,
    incentivesController: string,
    trancheId: string,
    network: string
}, callback?: () => Promise<any>) {
    let initInputParams: {
        underlyingAsset: string;
        treasury: string;
        incentivesController: string;
        interestRateChoice: string; //1,000,000
        reserveFactor: string;
        forceDisabledBorrow: boolean;
        forceDisabledCollateral: boolean;
    }[] = [];
    for (let i=0;i<params.assetAddresses.length; i++) {
        initInputParams.push({
        underlyingAsset: params.assetAddresses[i],
        treasury: params.treasuryAddress,
        incentivesController: params.incentivesController,
        interestRateChoice: "0",
        reserveFactor: params.reserveFactors[i],
        forceDisabledBorrow: params.forceDisabledBorrow[i],
        forceDisabledCollateral: params.forceDisabledCollateral[i]
        });
    }

    const configurator = await getLendingPoolConfigurationImpl(params.network);

    try {
        // Deploy init reserves per tranche
        // tranche CONFIGURATION
        console.log(
            `- Reserves initialization in ${initInputParams.length} txs`
        );
            const tx3 = await configurator
                .connect(params.admin)
                .batchInitReserve(
                    initInputParams, 
                    params.trancheId,
                    {
                        gasLimit: "80000000"
                    }
                );

            console.log(
            `  - Reserve ready for: ${params.assetAddresses.join(", ")}`
            );
            console.log("    * gasUsed", (await tx3.wait(1)).gasUsed.toString());

    } catch (error) {
        throw new Error("Configurator Failed with " + error);
    }

    if (callback) {
        return await callback()
    }
}

