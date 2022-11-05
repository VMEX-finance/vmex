import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { FlashLoanReceiverBase } from "./FlashLoanReceiverBase";
export declare class FlashLoanReceiverBaseFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): FlashLoanReceiverBase;
}
