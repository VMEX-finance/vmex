import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAaveIncentivesController } from "./IAaveIncentivesController";
export declare class IAaveIncentivesControllerFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IAaveIncentivesController;
}
