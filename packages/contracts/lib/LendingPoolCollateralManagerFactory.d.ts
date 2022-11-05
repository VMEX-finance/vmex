import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { LendingPoolCollateralManager } from "./LendingPoolCollateralManager";
export declare class LendingPoolCollateralManagerFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<LendingPoolCollateralManager>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): LendingPoolCollateralManager;
    connect(signer: Signer): LendingPoolCollateralManagerFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): LendingPoolCollateralManager;
}
