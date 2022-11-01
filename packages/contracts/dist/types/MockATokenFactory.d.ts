import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockAToken } from "./MockAToken";
export declare class MockATokenFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<MockAToken>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): MockAToken;
    connect(signer: Signer): MockATokenFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockAToken;
}
