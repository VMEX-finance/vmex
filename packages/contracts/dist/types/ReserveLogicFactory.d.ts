import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ReserveLogic } from "./ReserveLogic";
export declare class ReserveLogicFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<ReserveLogic>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): ReserveLogic;
    connect(signer: Signer): ReserveLogicFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): ReserveLogic;
}
