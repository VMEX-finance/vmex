import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { AaveProtocolDataProvider } from "./AaveProtocolDataProvider";
export declare class AaveProtocolDataProviderFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressesProvider: string, overrides?: Overrides): Promise<AaveProtocolDataProvider>;
    getDeployTransaction(addressesProvider: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): AaveProtocolDataProvider;
    connect(signer: Signer): AaveProtocolDataProviderFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): AaveProtocolDataProvider;
}
