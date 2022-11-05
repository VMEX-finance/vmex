import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IFlashLoanReceiver } from "./IFlashLoanReceiver";
export declare class IFlashLoanReceiverFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IFlashLoanReceiver;
}
