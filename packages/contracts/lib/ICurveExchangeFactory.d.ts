import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveExchange } from "./ICurveExchange";
export declare class ICurveExchangeFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveExchange;
}
