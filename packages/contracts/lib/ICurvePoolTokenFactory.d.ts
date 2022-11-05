import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurvePoolToken } from "./ICurvePoolToken";
export declare class ICurvePoolTokenFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurvePoolToken;
}
