import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveRegistryAddressProvider } from "./ICurveRegistryAddressProvider";
export declare class ICurveRegistryAddressProviderFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveRegistryAddressProvider;
}
