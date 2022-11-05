import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICreditDelegationToken } from "./ICreditDelegationToken";
export declare class ICreditDelegationTokenFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICreditDelegationToken;
}
