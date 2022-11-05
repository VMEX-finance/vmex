import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveOracle } from "./ICurveOracle";
export declare class ICurveOracleFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveOracle;
}
