import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { BaseParaSwapSellAdapter } from "./BaseParaSwapSellAdapter";
export declare class BaseParaSwapSellAdapterFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): BaseParaSwapSellAdapter;
}
