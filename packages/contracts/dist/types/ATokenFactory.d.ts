import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { AToken } from "./AToken";
export declare class ATokenFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<AToken>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): AToken;
    connect(signer: Signer): ATokenFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): AToken;
}
