import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { CrvDepositor } from "./CrvDepositor";
export declare class CrvDepositorFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): CrvDepositor;
}
