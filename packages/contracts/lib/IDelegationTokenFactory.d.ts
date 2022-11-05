import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IDelegationToken } from "./IDelegationToken";
export declare class IDelegationTokenFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IDelegationToken;
}
