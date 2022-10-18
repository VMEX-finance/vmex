import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ConvexOracle } from "./ConvexOracle";
export declare class ConvexOracleFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<ConvexOracle>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): ConvexOracle;
    connect(signer: Signer): ConvexOracleFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): ConvexOracle;
}
