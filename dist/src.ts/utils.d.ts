import { ethers } from "ethers";
/**
 * network agnostic function for getting the correct LendingPool address
 * @param signer
 * @param network
 * @param test
 */
export declare function getLendingPoolImpl(signer: ethers.Signer, network: string, test?: boolean): Promise<ethers.Contract>;
