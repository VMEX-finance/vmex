import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { WalletBalanceProvider } from "./WalletBalanceProvider";
export declare class WalletBalanceProviderFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<WalletBalanceProvider>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): WalletBalanceProvider;
    connect(signer: Signer): WalletBalanceProviderFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): WalletBalanceProvider;
}
