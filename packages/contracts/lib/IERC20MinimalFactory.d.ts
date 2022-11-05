import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IERC20Minimal } from "./IERC20Minimal";
export declare class IERC20MinimalFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IERC20Minimal;
}
