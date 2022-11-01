import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ConvexOracleV2 } from "./ConvexOracleV2";
export declare class ConvexOracleV2Factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_curve_oracle: string, overrides?: Overrides): Promise<ConvexOracleV2>;
    getDeployTransaction(_curve_oracle: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): ConvexOracleV2;
    connect(signer: Signer): ConvexOracleV2Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): ConvexOracleV2;
}
