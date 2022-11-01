import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockStableDebtToken } from "./MockStableDebtToken";
export declare class MockStableDebtTokenFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<MockStableDebtToken>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): MockStableDebtToken;
    connect(signer: Signer): MockStableDebtTokenFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockStableDebtToken;
}
