import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveMintr } from "./ICurveMintr";
export declare class ICurveMintrFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveMintr;
}
