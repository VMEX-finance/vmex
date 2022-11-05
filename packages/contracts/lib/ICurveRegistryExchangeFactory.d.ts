import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveRegistryExchange } from "./ICurveRegistryExchange";
export declare class ICurveRegistryExchangeFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveRegistryExchange;
}
