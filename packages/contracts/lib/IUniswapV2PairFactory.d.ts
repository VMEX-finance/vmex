import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV2Pair } from "./IUniswapV2Pair";
export declare class IUniswapV2PairFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV2Pair;
}
