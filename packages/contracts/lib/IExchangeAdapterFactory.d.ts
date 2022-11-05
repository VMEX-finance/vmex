import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IExchangeAdapter } from "./IExchangeAdapter";
export declare class IExchangeAdapterFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IExchangeAdapter;
}
