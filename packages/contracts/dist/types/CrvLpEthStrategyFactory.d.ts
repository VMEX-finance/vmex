import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CrvLpEthStrategy } from "./CrvLpEthStrategy";
export declare class CrvLpEthStrategyFactory extends ContractFactory {
    constructor(linkLibraryAddresses: CrvLpEthStrategyLibraryAddresses, signer?: Signer);
    static linkBytecode(linkLibraryAddresses: CrvLpEthStrategyLibraryAddresses): string;
    deploy(overrides?: Overrides): Promise<CrvLpEthStrategy>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): CrvLpEthStrategy;
    connect(signer: Signer): CrvLpEthStrategyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): CrvLpEthStrategy;
}
export interface CrvLpEthStrategyLibraryAddresses {
    ["__$7512de7f1b86abca670bc1676b640da4fd$__"]: string;
}
