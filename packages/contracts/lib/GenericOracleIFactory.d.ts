import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { GenericOracleI } from "./GenericOracleI";
export declare class GenericOracleIFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): GenericOracleI;
}
