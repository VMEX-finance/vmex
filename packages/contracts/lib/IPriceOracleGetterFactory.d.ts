import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IPriceOracleGetter } from "./IPriceOracleGetter";
export declare class IPriceOracleGetterFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceOracleGetter;
}
