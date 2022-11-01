import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { GenericLogic } from "./GenericLogic";
export declare class GenericLogicFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<GenericLogic>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): GenericLogic;
    connect(signer: Signer): GenericLogicFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): GenericLogic;
}
