import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { UiPoolDataProvider } from "./UiPoolDataProvider";
export declare class UiPoolDataProviderFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_incentivesController: string, _oracle: string, overrides?: Overrides): Promise<UiPoolDataProvider>;
    getDeployTransaction(_incentivesController: string, _oracle: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): UiPoolDataProvider;
    connect(signer: Signer): UiPoolDataProviderFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): UiPoolDataProvider;
}
