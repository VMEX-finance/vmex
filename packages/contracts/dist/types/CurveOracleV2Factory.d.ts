import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CurveOracleV2 } from "./CurveOracleV2";
export declare class CurveOracleV2Factory extends ContractFactory {
    constructor(linkLibraryAddresses: CurveOracleV2LibraryAddresses, signer?: Signer);
    static linkBytecode(linkLibraryAddresses: CurveOracleV2LibraryAddresses): string;
    deploy(overrides?: Overrides): Promise<CurveOracleV2>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): CurveOracleV2;
    connect(signer: Signer): CurveOracleV2Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): CurveOracleV2;
}
export interface CurveOracleV2LibraryAddresses {
    ["__$fc961522ee25e21dc45bf9241cf35e1d80$__"]: string;
}
