import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { LendingPool } from "./LendingPool";
export declare class LendingPoolFactory extends ContractFactory {
    constructor(linkLibraryAddresses: LendingPoolLibraryAddresses, signer?: Signer);
    static linkBytecode(linkLibraryAddresses: LendingPoolLibraryAddresses): string;
    deploy(overrides?: Overrides): Promise<LendingPool>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): LendingPool;
    connect(signer: Signer): LendingPoolFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): LendingPool;
}
export interface LendingPoolLibraryAddresses {
    ["__$de8c0cf1a7d7c36c802af9a64fb9d86036$__"]: string;
    ["__$f1f6c0540507d7a73571ad55dbacf4a67d$__"]: string;
    ["__$22cd43a9dda9ce44e9b92ba393b88fb9ac$__"]: string;
}
