import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IParaSwapAugustus } from "./IParaSwapAugustus";
export declare class IParaSwapAugustusFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IParaSwapAugustus;
}
