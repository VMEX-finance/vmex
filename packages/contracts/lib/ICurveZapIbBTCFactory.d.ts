import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveZapIbBTC } from "./ICurveZapIbBTC";
export declare class ICurveZapIbBTCFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveZapIbBTC;
}
