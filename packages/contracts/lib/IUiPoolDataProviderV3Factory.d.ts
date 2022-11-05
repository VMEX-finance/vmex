import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUiPoolDataProviderV3 } from "./IUiPoolDataProviderV3";
export declare class IUiPoolDataProviderV3Factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUiPoolDataProviderV3;
}
