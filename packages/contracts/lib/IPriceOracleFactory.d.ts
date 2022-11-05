import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IPriceOracle } from "./IPriceOracle";
export declare class IPriceOracleFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceOracle;
}
