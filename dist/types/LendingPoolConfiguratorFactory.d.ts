import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { LendingPoolConfigurator } from "./LendingPoolConfigurator";
export declare class LendingPoolConfiguratorFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<LendingPoolConfigurator>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): LendingPoolConfigurator;
    connect(signer: Signer): LendingPoolConfiguratorFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): LendingPoolConfigurator;
}
