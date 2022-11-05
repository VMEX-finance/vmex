import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ICurveVotingEscrow } from "./ICurveVotingEscrow";
export declare class ICurveVotingEscrowFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveVotingEscrow;
}
