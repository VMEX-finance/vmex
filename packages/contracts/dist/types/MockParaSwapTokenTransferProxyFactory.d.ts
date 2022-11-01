import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockParaSwapTokenTransferProxy } from "./MockParaSwapTokenTransferProxy";
export declare class MockParaSwapTokenTransferProxyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<MockParaSwapTokenTransferProxy>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): MockParaSwapTokenTransferProxy;
    connect(signer: Signer): MockParaSwapTokenTransferProxyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockParaSwapTokenTransferProxy;
}
