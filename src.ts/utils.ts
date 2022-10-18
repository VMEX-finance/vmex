import { ethers } from "ethers";
import { deployments } from "./constants";
import ILendingPoolAddressesProvider from "../artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";
import ILendingPool from "../artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json"
import { LendingPoolConfiguratorFactory } from "../types";
/**
 * network agnostic function for getting the correct LendingPool address
 * @param signer 
 * @param network 
 * @param test 
 */
export async function getLendingPoolImpl(signer: ethers.Signer, network: string, test?: boolean) {
    let LPAddressProvider = new ethers.Contract(deployments.LendingPoolAddressesProvider[`${network}`].address, ILendingPoolAddressesProvider.abi, signer);
    let address = await LPAddressProvider.getLendingPool();
    let { abi } = ILendingPool;
    return new ethers.Contract(address, abi, signer);
}

/**
 * 
 */
export async function approveUnderlying(signer: ethers.Signer, amount: any, underlying: string, spender: string) {
    let _underlying = new ethers.Contract(underlying, ["function approve(address spender, uint256 value) external returns (bool success)"], signer);
    return await _underlying.approve(await spender, amount);
}

export async function lendingPoolPause(approvedSigner: ethers.Signer, setPause: boolean, network: string, tranche: number) {
    let LPAddressProvider = new ethers.Contract(deployments.LendingPoolAddressesProvider[`${network}`].address, ILendingPoolAddressesProvider.abi, approvedSigner);
    if (await approvedSigner.getAddress() !== await LPAddressProvider.getPoolAdmin(tranche)) throw new Error("signer must be pool admin");
    let lendingPool = await getLendingPoolImpl(approvedSigner, network);
    try {
        let LendingPoolConfiguratorProxy = await LendingPoolConfiguratorFactory.connect(deployments.LendingPoolConfigurator[`${network}`].address, approvedSigner);
        await LendingPoolConfiguratorProxy.setPoolPause(false, tranche);
        return await lendingPool.paused(tranche)
    } catch (error) {
        console.log(error)
        throw error
        // throw new Error("Failed to set LendingPool Pause Status")
    }
}

export async function getUserSingleReserveData(signer: ethers.Signer, network: string, asset: string, tranche: number) {
    let lendingPool = await getLendingPoolImpl(signer, network);
    return await lendingPool.getReserveData(asset, tranche);
}