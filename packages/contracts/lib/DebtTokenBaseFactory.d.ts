import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { DebtTokenBase } from "./DebtTokenBase";
export declare class DebtTokenBaseFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): DebtTokenBase;
}
