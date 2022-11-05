import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV3PoolActions } from "./IUniswapV3PoolActions";
export declare class IUniswapV3PoolActionsFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3PoolActions;
}
