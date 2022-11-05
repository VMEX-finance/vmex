import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { Proxy } from "./Proxy";
export declare class ProxyFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): Proxy;
}
