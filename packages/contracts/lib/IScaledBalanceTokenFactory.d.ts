import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IScaledBalanceToken } from "./IScaledBalanceToken";
export declare class IScaledBalanceTokenFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IScaledBalanceToken;
}
