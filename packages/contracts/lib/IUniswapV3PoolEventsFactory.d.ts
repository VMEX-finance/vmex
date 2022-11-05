import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV3PoolEvents } from "./IUniswapV3PoolEvents";
export declare class IUniswapV3PoolEventsFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3PoolEvents;
}
