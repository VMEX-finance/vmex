import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IExtendedPriceAggregator } from "./IExtendedPriceAggregator";
export declare class IExtendedPriceAggregatorFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IExtendedPriceAggregator;
}
