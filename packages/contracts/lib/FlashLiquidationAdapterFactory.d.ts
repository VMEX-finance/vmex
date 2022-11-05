import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { FlashLiquidationAdapter } from "./FlashLiquidationAdapter";
export declare class FlashLiquidationAdapterFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressesProvider: string, uniswapRouter: string, wethAddress: string, overrides?: Overrides): Promise<FlashLiquidationAdapter>;
    getDeployTransaction(addressesProvider: string, uniswapRouter: string, wethAddress: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): FlashLiquidationAdapter;
    connect(signer: Signer): FlashLiquidationAdapterFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): FlashLiquidationAdapter;
}
