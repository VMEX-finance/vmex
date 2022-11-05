import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveRegistry } from "./ICurveRegistry";
export declare class ICurveRegistryFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveRegistry;
}
