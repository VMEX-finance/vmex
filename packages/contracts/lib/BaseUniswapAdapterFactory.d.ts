import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { BaseUniswapAdapter } from "./BaseUniswapAdapter";
export declare class BaseUniswapAdapterFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): BaseUniswapAdapter;
}
