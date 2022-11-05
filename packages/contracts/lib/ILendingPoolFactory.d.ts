import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ILendingPool } from "./ILendingPool";
export declare class ILendingPoolFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ILendingPool;
}
