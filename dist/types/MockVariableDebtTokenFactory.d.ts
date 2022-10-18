import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockVariableDebtToken } from "./MockVariableDebtToken";
export declare class MockVariableDebtTokenFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<MockVariableDebtToken>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): MockVariableDebtToken;
    connect(signer: Signer): MockVariableDebtTokenFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockVariableDebtToken;
}
