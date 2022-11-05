import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV3SwapCallback } from "./IUniswapV3SwapCallback";
export declare class IUniswapV3SwapCallbackFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3SwapCallback;
}
