import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { InitializableUpgradeabilityProxy } from "./InitializableUpgradeabilityProxy";
export declare class InitializableUpgradeabilityProxyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<InitializableUpgradeabilityProxy>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): InitializableUpgradeabilityProxy;
    connect(signer: Signer): InitializableUpgradeabilityProxyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): InitializableUpgradeabilityProxy;
}
