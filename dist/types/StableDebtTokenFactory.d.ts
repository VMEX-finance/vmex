import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { StableDebtToken } from "./StableDebtToken";
export declare class StableDebtTokenFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<StableDebtToken>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): StableDebtToken;
    connect(signer: Signer): StableDebtTokenFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): StableDebtToken;
}
