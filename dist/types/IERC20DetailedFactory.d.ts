import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IERC20Detailed } from "./IERC20Detailed";
export declare class IERC20DetailedFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IERC20Detailed;
}
