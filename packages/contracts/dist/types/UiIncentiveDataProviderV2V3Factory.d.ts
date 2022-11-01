import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { UiIncentiveDataProviderV2V3 } from "./UiIncentiveDataProviderV2V3";
export declare class UiIncentiveDataProviderV2V3Factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<UiIncentiveDataProviderV2V3>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): UiIncentiveDataProviderV2V3;
    connect(signer: Signer): UiIncentiveDataProviderV2V3Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): UiIncentiveDataProviderV2V3;
}
