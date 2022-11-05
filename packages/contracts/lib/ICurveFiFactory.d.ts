import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveFi } from "./ICurveFi";
export declare class ICurveFiFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveFi;
}
