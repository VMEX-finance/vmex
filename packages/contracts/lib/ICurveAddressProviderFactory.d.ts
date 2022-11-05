import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveAddressProvider } from "./ICurveAddressProvider";
export declare class ICurveAddressProviderFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveAddressProvider;
}
