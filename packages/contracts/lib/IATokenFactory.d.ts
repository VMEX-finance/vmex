import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAToken } from "./IAToken";
export declare class IATokenFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IAToken;
}
