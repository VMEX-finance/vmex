import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { LendingPoolConfigurator } from "./LendingPoolConfigurator";
export declare class LendingPoolConfiguratorFactory extends ContractFactory {
    constructor(linkLibraryAddresses: LendingPoolConfiguratorLibraryAddresses, signer?: Signer);
    static linkBytecode(linkLibraryAddresses: LendingPoolConfiguratorLibraryAddresses): string;
    deploy(overrides?: Overrides): Promise<LendingPoolConfigurator>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): LendingPoolConfigurator;
    connect(signer: Signer): LendingPoolConfiguratorFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): LendingPoolConfigurator;
}
export interface LendingPoolConfiguratorLibraryAddresses {
    ["__$1a4ab84be2d7625b6f21850c42bc00346a$__"]: string;
}
