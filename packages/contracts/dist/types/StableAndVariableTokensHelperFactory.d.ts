import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { StableAndVariableTokensHelper } from "./StableAndVariableTokensHelper";
export declare class StableAndVariableTokensHelperFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_pool: string, _addressesProvider: string, overrides?: Overrides): Promise<StableAndVariableTokensHelper>;
    getDeployTransaction(_pool: string, _addressesProvider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): StableAndVariableTokensHelper;
    connect(signer: Signer): StableAndVariableTokensHelperFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): StableAndVariableTokensHelper;
}
