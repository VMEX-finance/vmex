import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { UniswapRepayAdapter } from "./UniswapRepayAdapter";
export declare class UniswapRepayAdapterFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressesProvider: string, uniswapRouter: string, wethAddress: string, overrides?: Overrides): Promise<UniswapRepayAdapter>;
    getDeployTransaction(addressesProvider: string, uniswapRouter: string, wethAddress: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): UniswapRepayAdapter;
    connect(signer: Signer): UniswapRepayAdapterFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): UniswapRepayAdapter;
}
