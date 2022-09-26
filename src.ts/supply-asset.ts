import { ethers } from "ethers";
import { LendingPoolConfiguratorFactory } from "../types";
import { deployments } from "./constants";
import ILendingPool from "../artifacts/contracts/interfaces/ILendingPool.sol/IlendingPool.json";
import ILendingPoolAddressesProvider from "../artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";

const abi = [
    "function approve(address spender, uint256 value) external returns (bool success)",
    "function balanceOf(address owner) external view returns (uint256 balance)"
]

export async function supply(params: {
    underlying: string,
    amount: number,
    tranche: number,
    signer: ethers.Signer
    isCollateral?: boolean,
    referer?: number;
}) {
    const LendingPool = new ethers.Contract(deployments.LendingPool.localhost.address, ILendingPool.abi, params.signer);
    if (LendingPool.paused()) throw new Error("LendingPool is paused, assets cannot be supplied");

    const UnderlyingAsset = new ethers.Contract(ethers.utils.getAddress(params.underlying), abi, params.signer);

    await UnderlyingAsset.approve(LendingPool.address, ethers.utils.formatEther(params.amount));
    await LendingPool.deposit(
        UnderlyingAsset.address, 
        params.tranche, 
        params.isCollateral || false, 
        ethers.utils.parseEther(String(params.amount)), 
        (await params.signer.getAddress()), 
        String(params.referer || 0)
    );
};

