import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { UniswapLiquiditySwapAdapter } from "./UniswapLiquiditySwapAdapter";
export declare class UniswapLiquiditySwapAdapterFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressesProvider: string, uniswapRouter: string, wethAddress: string, overrides?: Overrides): Promise<UniswapLiquiditySwapAdapter>;
    getDeployTransaction(addressesProvider: string, uniswapRouter: string, wethAddress: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): UniswapLiquiditySwapAdapter;
    connect(signer: Signer): UniswapLiquiditySwapAdapterFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): UniswapLiquiditySwapAdapter;
}
