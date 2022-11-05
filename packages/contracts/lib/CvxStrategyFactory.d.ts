import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CvxStrategy } from "./CvxStrategy";
export declare class CvxStrategyFactory extends ContractFactory {
    constructor(linkLibraryAddresses: CvxStrategyLibraryAddresses, signer?: Signer);
    static linkBytecode(linkLibraryAddresses: CvxStrategyLibraryAddresses): string;
    deploy(overrides?: Overrides): Promise<CvxStrategy>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): CvxStrategy;
    connect(signer: Signer): CvxStrategyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): CvxStrategy;
}
export interface CvxStrategyLibraryAddresses {
    ["__$7512de7f1b86abca670bc1676b640da4fd$__"]: string;
}
