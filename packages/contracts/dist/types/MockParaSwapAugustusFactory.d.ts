import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockParaSwapAugustus } from "./MockParaSwapAugustus";
export declare class MockParaSwapAugustusFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<MockParaSwapAugustus>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): MockParaSwapAugustus;
    connect(signer: Signer): MockParaSwapAugustusFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockParaSwapAugustus;
}
