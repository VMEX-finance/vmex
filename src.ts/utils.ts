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

/**
 * 
 */
export async function approveUnderlying(signer: ethers.Signer, amount: any, underlying: string) {
    let _underlying = new ethers.Contract(underlying, ["function approve(address spender, uint256 value) external returns (bool success)"], signer);
    return await _underlying.approve(await signer.getAddress(), amount);
}
