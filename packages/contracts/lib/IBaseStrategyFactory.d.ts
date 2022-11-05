import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IBaseStrategy } from "./IBaseStrategy";
export declare class IBaseStrategyFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IBaseStrategy;
}
