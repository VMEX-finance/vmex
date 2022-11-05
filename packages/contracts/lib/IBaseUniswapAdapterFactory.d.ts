import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IBaseUniswapAdapter } from "./IBaseUniswapAdapter";
export declare class IBaseUniswapAdapterFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IBaseUniswapAdapter;
}
