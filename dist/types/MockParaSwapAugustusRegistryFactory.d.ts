import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockParaSwapAugustusRegistry } from "./MockParaSwapAugustusRegistry";
export declare class MockParaSwapAugustusRegistryFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(augustus: string, overrides?: Overrides): Promise<MockParaSwapAugustusRegistry>;
    getDeployTransaction(augustus: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): MockParaSwapAugustusRegistry;
    connect(signer: Signer): MockParaSwapAugustusRegistryFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockParaSwapAugustusRegistry;
}
