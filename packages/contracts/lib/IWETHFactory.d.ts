import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IWETH } from "./IWETH";
export declare class IWETHFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IWETH;
}
