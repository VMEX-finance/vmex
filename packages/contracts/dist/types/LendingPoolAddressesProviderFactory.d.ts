import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { LendingPoolAddressesProvider } from "./LendingPoolAddressesProvider";
export declare class LendingPoolAddressesProviderFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(marketId: string, overrides?: Overrides): Promise<LendingPoolAddressesProvider>;
    getDeployTransaction(marketId: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): LendingPoolAddressesProvider;
    connect(signer: Signer): LendingPoolAddressesProviderFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): LendingPoolAddressesProvider;
}
