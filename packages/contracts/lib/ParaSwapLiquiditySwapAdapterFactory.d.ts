import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ParaSwapLiquiditySwapAdapter } from "./ParaSwapLiquiditySwapAdapter";
export declare class ParaSwapLiquiditySwapAdapterFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressesProvider: string, augustusRegistry: string, overrides?: Overrides): Promise<ParaSwapLiquiditySwapAdapter>;
    getDeployTransaction(addressesProvider: string, augustusRegistry: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): ParaSwapLiquiditySwapAdapter;
    connect(signer: Signer): ParaSwapLiquiditySwapAdapterFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): ParaSwapLiquiditySwapAdapter;
}
