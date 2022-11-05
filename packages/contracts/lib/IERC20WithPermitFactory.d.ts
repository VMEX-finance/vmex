import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IERC20WithPermit } from "./IERC20WithPermit";
export declare class IERC20WithPermitFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IERC20WithPermit;
}
