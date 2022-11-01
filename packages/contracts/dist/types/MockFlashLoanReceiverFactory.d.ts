import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockFlashLoanReceiver } from "./MockFlashLoanReceiver";
export declare class MockFlashLoanReceiverFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(provider: string, overrides?: Overrides): Promise<MockFlashLoanReceiver>;
    getDeployTransaction(provider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): MockFlashLoanReceiver;
    connect(signer: Signer): MockFlashLoanReceiverFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockFlashLoanReceiver;
}
