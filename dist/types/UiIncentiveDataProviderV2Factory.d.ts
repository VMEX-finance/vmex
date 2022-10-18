import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { UiIncentiveDataProviderV2 } from "./UiIncentiveDataProviderV2";
export declare class UiIncentiveDataProviderV2Factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<UiIncentiveDataProviderV2>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): UiIncentiveDataProviderV2;
    connect(signer: Signer): UiIncentiveDataProviderV2Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): UiIncentiveDataProviderV2;
}
