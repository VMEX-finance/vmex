import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { BaseStrategy } from "./BaseStrategy";
export declare class BaseStrategyFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): BaseStrategy;
}
