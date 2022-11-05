import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUiPoolDataProviderV2 } from "./IUiPoolDataProviderV2";
export declare class IUiPoolDataProviderV2Factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUiPoolDataProviderV2;
}
