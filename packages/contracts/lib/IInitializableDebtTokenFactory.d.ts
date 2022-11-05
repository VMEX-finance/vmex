import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IInitializableDebtToken } from "./IInitializableDebtToken";
export declare class IInitializableDebtTokenFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IInitializableDebtToken;
}
