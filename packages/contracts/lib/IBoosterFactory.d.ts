import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IBooster } from "./IBooster";
export declare class IBoosterFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IBooster;
}
