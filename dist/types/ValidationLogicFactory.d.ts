import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ValidationLogic } from "./ValidationLogic";
export declare class ValidationLogicFactory extends ContractFactory {
    constructor(linkLibraryAddresses: ValidationLogicLibraryAddresses, signer?: Signer);
    static linkBytecode(linkLibraryAddresses: ValidationLogicLibraryAddresses): string;
    deploy(overrides?: Overrides): Promise<ValidationLogic>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): ValidationLogic;
    connect(signer: Signer): ValidationLogicFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): ValidationLogic;
}
export interface ValidationLogicLibraryAddresses {
    ["__$52a8a86ab43135662ff256bbc95497e8e3$__"]: string;
}
