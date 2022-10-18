import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { BaseUpgradeabilityProxy } from "./BaseUpgradeabilityProxy";
export declare class BaseUpgradeabilityProxyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<BaseUpgradeabilityProxy>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): BaseUpgradeabilityProxy;
    connect(signer: Signer): BaseUpgradeabilityProxyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): BaseUpgradeabilityProxy;
}
