import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { VariableDebtToken } from "./VariableDebtToken";
export declare class VariableDebtTokenFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<VariableDebtToken>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): VariableDebtToken;
    connect(signer: Signer): VariableDebtTokenFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): VariableDebtToken;
}
