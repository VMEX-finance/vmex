import { ethers } from "ethers";
import { deployments } from "./constants";
import ILendingPoolAddressesProvider from "../artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";

/**
 * network agnostic function for getting the correct LendingPool address
 * @param signer 
 * @param network 
 * @param test 
 */
export async function getLendingPoolImpl(signer: ethers.Signer, network: string, test?: boolean) {
    let LPAddressProvider = new ethers.Contract(deployments.LendingPoolAddressesProvider[`${network}`].address, ILendingPoolAddressesProvider.abi, signer);
    let address = await LPAddressProvider.getLendingPool();
    let { abi } = require("../artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json");
    return new ethers.Contract(address, abi, signer);
}
