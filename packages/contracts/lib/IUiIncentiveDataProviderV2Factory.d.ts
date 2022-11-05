import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUiIncentiveDataProviderV2 } from "./IUiIncentiveDataProviderV2";
export declare class IUiIncentiveDataProviderV2Factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUiIncentiveDataProviderV2;
}
