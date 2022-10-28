import { ethers } from "ethers";
import { getLendingPoolImpl, approveUnderlying } from "./utils";
import {getUserData} from "../test-suites/test-aave/helpers/utils/helpers"
import { ReserveData, UserReserveData } from "../test-suites/test-aave/helpers/utils/interfaces";
import { getAaveProtocolDataProvider, getLendingPool } from "../helpers/contracts-getters";
import { Address } from "defender-relay-client/lib/relayer";
import {UserAccountData} from "../localhost_tests/interfaces"
//PROTOCOL ANALYTICS
export async function totalValueLocked(params?: {
    network: string;
    test: boolean;
}, callback?: () => Promise<UserReserveData>) {
    let lendingPool = await getLendingPool();
    //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed). 
}

export async function totalTranches(params?: {
    network: string;
    test: boolean;
}, callback?: () => Promise<UserReserveData>) {
    let lendingPool = await getLendingPool();
    //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed). 
}


//tranche level


//user level (querying by wallet address)
 export async function userInfo(params: {
    underlying: string;
    trancheId: string;
    signer: ethers.Signer; //assume signer is also address that you want
    network?: string;
    test?: boolean;
}, callback?: () => Promise<UserReserveData>) {
    let lendingPool = await getLendingPool();
    let helpersContract = await getAaveProtocolDataProvider();
    
    return getUserData(lendingPool, helpersContract, params.underlying, params.trancheId, await params.signer.getAddress() );
}

export async function userCollateralInfo(params: {
    trancheId: string;
    signer: ethers.Signer;
    network?: string;
    test?: boolean;
}, callback?: () => Promise<UserAccountData>) {
    let lendingPool = await getLendingPool();
    return lendingPool.connect(params.signer).getUserAccountData(await params.signer.getAddress(), params.trancheId);
}