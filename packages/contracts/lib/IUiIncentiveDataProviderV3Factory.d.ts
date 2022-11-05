import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUiIncentiveDataProviderV3 } from "./IUiIncentiveDataProviderV3";
export declare class IUiIncentiveDataProviderV3Factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUiIncentiveDataProviderV3;
}
