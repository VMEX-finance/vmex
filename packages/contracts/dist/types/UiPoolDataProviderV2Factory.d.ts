import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { UiPoolDataProviderV2 } from "./UiPoolDataProviderV2";
export declare class UiPoolDataProviderV2Factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_networkBaseTokenPriceInUsdProxyAggregator: string, _marketReferenceCurrencyPriceInUsdProxyAggregator: string, overrides?: Overrides): Promise<UiPoolDataProviderV2>;
    getDeployTransaction(_networkBaseTokenPriceInUsdProxyAggregator: string, _marketReferenceCurrencyPriceInUsdProxyAggregator: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): UiPoolDataProviderV2;
    connect(signer: Signer): UiPoolDataProviderV2Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): UiPoolDataProviderV2;
}
