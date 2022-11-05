import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUiPoolDataProvider } from "./IUiPoolDataProvider";
export declare class IUiPoolDataProviderFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUiPoolDataProvider;
}
