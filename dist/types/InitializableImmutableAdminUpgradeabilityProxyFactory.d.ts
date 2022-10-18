import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { InitializableImmutableAdminUpgradeabilityProxy } from "./InitializableImmutableAdminUpgradeabilityProxy";
export declare class InitializableImmutableAdminUpgradeabilityProxyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(admin: string, overrides?: Overrides): Promise<InitializableImmutableAdminUpgradeabilityProxy>;
    getDeployTransaction(admin: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): InitializableImmutableAdminUpgradeabilityProxy;
    connect(signer: Signer): InitializableImmutableAdminUpgradeabilityProxyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): InitializableImmutableAdminUpgradeabilityProxy;
}
