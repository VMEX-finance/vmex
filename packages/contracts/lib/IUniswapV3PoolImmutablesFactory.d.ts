import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV3PoolImmutables } from "./IUniswapV3PoolImmutables";
export declare class IUniswapV3PoolImmutablesFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3PoolImmutables;
}
