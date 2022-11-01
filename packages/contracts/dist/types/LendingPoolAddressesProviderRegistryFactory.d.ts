import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { LendingPoolAddressesProviderRegistry } from "./LendingPoolAddressesProviderRegistry";
export declare class LendingPoolAddressesProviderRegistryFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<LendingPoolAddressesProviderRegistry>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): LendingPoolAddressesProviderRegistry;
    connect(signer: Signer): LendingPoolAddressesProviderRegistryFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): LendingPoolAddressesProviderRegistry;
}
