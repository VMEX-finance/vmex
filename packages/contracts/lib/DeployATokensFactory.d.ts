import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { DeployATokens } from "./DeployATokens";
export declare class DeployATokensFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<DeployATokens>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): DeployATokens;
    connect(signer: Signer): DeployATokensFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): DeployATokens;
}
