import { ethers } from "ethers";
import { deployments } from "./constants";
import _ from "lodash";
import ILendingPoolAddressesProvider from "@vmex/contracts/artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";
import ILendingPool from "@vmex/contracts/artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json";
import ILendingPoolConfigurator from "@vmex/contracts/artifacts/contracts/protocol/lendingPool/LendingPoolConfigurator.sol/LendingPoolConfigurator.json";
// import { LendingPoolConfiguratorFactory } from "@vmex/contracts/dist";
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
 * unsignedLendingPool
 * a modified lendingPoolImpl fn doesnt require a signer or network
 */
export async function getUnsignedLP(params?: { signer?: ethers.Signer, network?: string, test?: boolean }) {
    let LPAddressProvider = new ethers.Contract(deployments.LendingPoolAddressesProvider[`${params.network || 'mainnet'}`].address, ILendingPoolAddressesProvider.abi);
    if (params.signer) LPAddressProvider.connect(await params.signer);
    let { abi } = ILendingPool;
    const _lp = new ethers.Contract(await LPAddressProvider.getLendingPool(), abi);
    if (params.signer) _lp.connect(params.signer);
    return _lp
}

/**
 * 
 */
export async function approveUnderlying(signer: ethers.Signer, amount: any, underlying: string, spender: string) {
    let _underlying = new ethers.Contract(underlying, ["function approve(address spender, uint256 value) external returns (bool success)"], signer);
    return await _underlying.connect(signer).approve(spender, amount);
}

//temp function
function getNetworkProvider(network) {
    return new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545") //TODO implement
}

/**
 * utility function to query number of tranches present in lending pool
 * @param network 
 * @returns BigNumber
 */
export async function getTrancheNames(network?: string) {
    let provider = network == 'localhost' ? new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545") : getNetworkProvider(network);
    let signer = new ethers.VoidSigner(ethers.constants.AddressZero, provider);
    const _lpConfiguratorProxy = new ethers.Contract(deployments.LendingPoolConfigurator[`${network || "mainnet"}`].address, ILendingPoolConfigurator.abi, signer);
    let trancheIds = (await _lpConfiguratorProxy.totalTranches()).toNumber()
    let x = [...Array(trancheIds).keys()]
    return Promise.all(x.map(async (x) => await _lpConfiguratorProxy.trancheNames(x)
    ));

    
}

export async function lendingPoolPause(approvedSigner: ethers.Signer, setPause: boolean, network: string, tranche: number) {
    let LPAddressProvider = new ethers.Contract(deployments.LendingPoolAddressesProvider[`${network}`].address, ILendingPoolAddressesProvider.abi, approvedSigner);
    if (await approvedSigner.getAddress() !== await LPAddressProvider.getPoolAdmin(tranche)) throw new Error("signer must be pool admin");
    let lendingPool = await getLendingPoolImpl(approvedSigner, network);
    try {
        let _LendingPoolConfiguratorProxy = new ethers.Contract(deployments.LendingPoolConfigurator[`${network}`].address, ILendingPoolConfigurator.abi, approvedSigner);
        // let LendingPoolConfiguratorProxy = await LendingPoolConfiguratorFactory.connect(deployments.LendingPoolConfigurator[`${network}`].address, approvedSigner);
        await _LendingPoolConfiguratorProxy.setPoolPause(false, tranche);
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

export async function getLendingPoolReservesList(signer: ethers.Signer, network: string, tranche: number) {
    let lendingPool = await getLendingPoolImpl(signer, network);
    return await lendingPool.getReservesList(tranche);
}

export async function getAssetData(signer: ethers.Signer, network: string, asset: string, tranche: number) {
    let lendingPool = await getLendingPoolImpl(signer, network);
    return await lendingPool.getAssetData(asset, tranche);
}

export async function getReserveData(signer: ethers.Signer, network: string, asset: string, tranche: number) {
    let lendingPool = await getLendingPoolImpl(signer, network);
    return await lendingPool.getReserveData(asset, tranche)
}

