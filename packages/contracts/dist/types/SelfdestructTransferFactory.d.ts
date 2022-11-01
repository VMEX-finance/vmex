import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { SelfdestructTransfer } from "./SelfdestructTransfer";
export declare class SelfdestructTransferFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<SelfdestructTransfer>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): SelfdestructTransfer;
    connect(signer: Signer): SelfdestructTransferFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): SelfdestructTransfer;
}
