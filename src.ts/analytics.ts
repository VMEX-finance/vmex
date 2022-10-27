import { ethers } from "ethers";
import { getLendingPoolImpl, approveUnderlying } from "./utils";
import {getUserData} from "../test-suites/test-aave/helpers/utils/helpers"
import { ReserveData, UserReserveData } from "../test-suites/test-aave/helpers/utils/interfaces";
import { getAaveProtocolDataProvider, getLendingPool } from "../helpers/contracts-getters";
import { Address } from "defender-relay-client/lib/relayer";
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



//user level (querying by wallet address)
 export async function userInfo(params: {
    underlying: string;
    trancheId: string;
    signer: ethers.Signer; //assume signer is also address that you want
    network: string;
    test?: boolean;
}, callback?: () => Promise<UserReserveData>) {
    let lendingPool = await getLendingPool();
    let helpersContract = await getAaveProtocolDataProvider();
    
    return getUserData(lendingPool, helpersContract, params.underlying, params.trancheId, await params.signer.getAddress() );
}