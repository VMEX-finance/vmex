import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { UiPoolDataProviderV2V3 } from "./UiPoolDataProviderV2V3";
export declare class UiPoolDataProviderV2V3Factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_networkBaseTokenPriceInUsdProxyAggregator: string, _marketReferenceCurrencyPriceInUsdProxyAggregator: string, overrides?: Overrides): Promise<UiPoolDataProviderV2V3>;
    getDeployTransaction(_networkBaseTokenPriceInUsdProxyAggregator: string, _marketReferenceCurrencyPriceInUsdProxyAggregator: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): UiPoolDataProviderV2V3;
    connect(signer: Signer): UiPoolDataProviderV2V3Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): UiPoolDataProviderV2V3;
}
