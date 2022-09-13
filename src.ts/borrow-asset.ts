import { ethers } from "ethers";
import { deployments } from "./constants";
import ILendingPool from "../artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json";

const abi = [
    "function approve(address spender, uint256 value) external returns (bool success)",
    "function balanceOf(address owner) external view returns (uint256 balance)"
]

export async function borrow(params: {
    underlying: string;
    collateral: string;
    amount: ethers.BigNumber | number;
    signer: ethers.Signer;
    referer?: number;
}) {
    const LendingPool = new ethers.Contract(deployments.LendingPool.localhost.address, ILendingPool.abi);
    if (LendingPool.paused()) throw new Error("Lending Poll is paused, assets cannot be borrowed");

    // TODO: finish logic for borrowing asset
}