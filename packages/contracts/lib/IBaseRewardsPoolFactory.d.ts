import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IBaseRewardsPool } from "./IBaseRewardsPool";
export declare class IBaseRewardsPoolFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IBaseRewardsPool;
}
