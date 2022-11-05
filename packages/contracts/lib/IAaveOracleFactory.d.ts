import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAaveOracle } from "./IAaveOracle";
export declare class IAaveOracleFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IAaveOracle;
}
