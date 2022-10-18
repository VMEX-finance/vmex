import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { VMath } from "./VMath";
export declare class VMathFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<VMath>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): VMath;
    connect(signer: Signer): VMathFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): VMath;
}
