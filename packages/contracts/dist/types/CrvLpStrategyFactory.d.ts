import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CrvLpStrategy } from "./CrvLpStrategy";
export declare class CrvLpStrategyFactory extends ContractFactory {
    constructor(linkLibraryAddresses: CrvLpStrategyLibraryAddresses, signer?: Signer);
    static linkBytecode(linkLibraryAddresses: CrvLpStrategyLibraryAddresses): string;
    deploy(overrides?: Overrides): Promise<CrvLpStrategy>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): CrvLpStrategy;
    connect(signer: Signer): CrvLpStrategyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): CrvLpStrategy;
}
export interface CrvLpStrategyLibraryAddresses {
    ["__$7512de7f1b86abca670bc1676b640da4fd$__"]: string;
}
