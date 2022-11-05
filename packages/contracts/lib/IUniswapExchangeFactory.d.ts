import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapExchange } from "./IUniswapExchange";
export declare class IUniswapExchangeFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapExchange;
}
