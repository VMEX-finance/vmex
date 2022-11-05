import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { BaseImmutableAdminUpgradeabilityProxy } from "./BaseImmutableAdminUpgradeabilityProxy";
export declare class BaseImmutableAdminUpgradeabilityProxyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(admin: string, overrides?: Overrides): Promise<BaseImmutableAdminUpgradeabilityProxy>;
    getDeployTransaction(admin: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): BaseImmutableAdminUpgradeabilityProxy;
    connect(signer: Signer): BaseImmutableAdminUpgradeabilityProxyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): BaseImmutableAdminUpgradeabilityProxy;
}
