import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { DelegationAwareAToken } from "./DelegationAwareAToken";
export declare class DelegationAwareATokenFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<DelegationAwareAToken>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): DelegationAwareAToken;
    connect(signer: Signer): DelegationAwareATokenFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): DelegationAwareAToken;
}
