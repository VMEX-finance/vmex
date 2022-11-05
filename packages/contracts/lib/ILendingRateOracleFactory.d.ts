import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ILendingRateOracle } from "./ILendingRateOracle";
export declare class ILendingRateOracleFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ILendingRateOracle;
}
