import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICvxRewardsPool } from "./ICvxRewardsPool";
export declare class ICvxRewardsPoolFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICvxRewardsPool;
}
