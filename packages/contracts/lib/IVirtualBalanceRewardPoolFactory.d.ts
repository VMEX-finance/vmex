import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IVirtualBalanceRewardPool } from "./IVirtualBalanceRewardPool";
export declare class IVirtualBalanceRewardPoolFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IVirtualBalanceRewardPool;
}
