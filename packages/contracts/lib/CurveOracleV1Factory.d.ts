import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CurveOracleV1 } from "./CurveOracleV1";
export declare class CurveOracleV1Factory extends ContractFactory {
    constructor(linkLibraryAddresses: CurveOracleV1LibraryAddresses, signer?: Signer);
    static linkBytecode(linkLibraryAddresses: CurveOracleV1LibraryAddresses): string;
    deploy(overrides?: Overrides): Promise<CurveOracleV1>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): CurveOracleV1;
    connect(signer: Signer): CurveOracleV1Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): CurveOracleV1;
}
export interface CurveOracleV1LibraryAddresses {
    ["__$fc961522ee25e21dc45bf9241cf35e1d80$__"]: string;
}
