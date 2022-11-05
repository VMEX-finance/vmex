import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV3Factory } from "./IUniswapV3Factory";
export declare class IUniswapV3FactoryFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3Factory;
}
