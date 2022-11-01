import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { Errors } from "./Errors";
export declare class ErrorsFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<Errors>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): Errors;
    connect(signer: Signer): ErrorsFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): Errors;
}
