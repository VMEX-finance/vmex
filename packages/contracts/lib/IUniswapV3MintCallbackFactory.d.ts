import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV3MintCallback } from "./IUniswapV3MintCallback";
export declare class IUniswapV3MintCallbackFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3MintCallback;
}
