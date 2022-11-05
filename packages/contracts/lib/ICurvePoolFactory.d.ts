import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurvePool } from "./ICurvePool";
export declare class ICurvePoolFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurvePool;
}
