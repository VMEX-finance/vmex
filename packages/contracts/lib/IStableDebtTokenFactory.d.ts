import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IStableDebtToken } from "./IStableDebtToken";
export declare class IStableDebtTokenFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IStableDebtToken;
}
