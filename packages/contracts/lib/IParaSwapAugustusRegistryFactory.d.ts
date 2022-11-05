import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IParaSwapAugustusRegistry } from "./IParaSwapAugustusRegistry";
export declare class IParaSwapAugustusRegistryFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IParaSwapAugustusRegistry;
}
