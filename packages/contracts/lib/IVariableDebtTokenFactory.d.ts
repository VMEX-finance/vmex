import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IVariableDebtToken } from "./IVariableDebtToken";
export declare class IVariableDebtTokenFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IVariableDebtToken;
}
