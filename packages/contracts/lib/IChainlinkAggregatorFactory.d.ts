import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IChainlinkAggregator } from "./IChainlinkAggregator";
export declare class IChainlinkAggregatorFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IChainlinkAggregator;
}
