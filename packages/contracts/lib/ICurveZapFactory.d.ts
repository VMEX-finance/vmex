import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveZap } from "./ICurveZap";
export declare class ICurveZapFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveZap;
}
