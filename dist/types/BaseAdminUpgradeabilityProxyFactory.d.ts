import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { BaseAdminUpgradeabilityProxy } from "./BaseAdminUpgradeabilityProxy";
export declare class BaseAdminUpgradeabilityProxyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<BaseAdminUpgradeabilityProxy>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): BaseAdminUpgradeabilityProxy;
    connect(signer: Signer): BaseAdminUpgradeabilityProxyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): BaseAdminUpgradeabilityProxy;
}
