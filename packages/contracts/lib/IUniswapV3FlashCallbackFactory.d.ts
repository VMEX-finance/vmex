import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV3FlashCallback } from "./IUniswapV3FlashCallback";
export declare class IUniswapV3FlashCallbackFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3FlashCallback;
}
