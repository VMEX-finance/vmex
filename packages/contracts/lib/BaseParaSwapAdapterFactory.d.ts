import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { BaseParaSwapAdapter } from "./BaseParaSwapAdapter";
export declare class BaseParaSwapAdapterFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): BaseParaSwapAdapter;
}
