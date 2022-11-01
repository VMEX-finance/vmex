import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { InitializableAdminUpgradeabilityProxy } from "./InitializableAdminUpgradeabilityProxy";
export declare class InitializableAdminUpgradeabilityProxyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<InitializableAdminUpgradeabilityProxy>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): InitializableAdminUpgradeabilityProxy;
    connect(signer: Signer): InitializableAdminUpgradeabilityProxyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): InitializableAdminUpgradeabilityProxy;
}
