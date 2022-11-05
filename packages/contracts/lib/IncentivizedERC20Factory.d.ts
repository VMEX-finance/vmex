import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IncentivizedERC20 } from "./IncentivizedERC20";
export declare class IncentivizedERC20Factory {
    static connect(address: string, signerOrProvider: Signer | Provider): IncentivizedERC20;
}
