import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IInitializableAToken } from "./IInitializableAToken";
export declare class IInitializableATokenFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IInitializableAToken;
}
