import { ethers } from "ethers";
import { getLendingPoolImpl, approveUnderlying } from "./utils";

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



