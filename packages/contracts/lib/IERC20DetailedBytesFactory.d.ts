import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IERC20DetailedBytes } from "./IERC20DetailedBytes";
export declare class IERC20DetailedBytesFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IERC20DetailedBytes;
}
