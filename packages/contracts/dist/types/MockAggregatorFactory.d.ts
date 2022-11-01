import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockAggregator } from "./MockAggregator";
export declare class MockAggregatorFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_initialAnswer: BigNumberish, overrides?: Overrides): Promise<MockAggregator>;
    getDeployTransaction(_initialAnswer: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): MockAggregator;
    connect(signer: Signer): MockAggregatorFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockAggregator;
}
