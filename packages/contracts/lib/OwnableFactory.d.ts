import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { Ownable } from "./Ownable";
export declare class OwnableFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<Ownable>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): Ownable;
    connect(signer: Signer): OwnableFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): Ownable;
}
