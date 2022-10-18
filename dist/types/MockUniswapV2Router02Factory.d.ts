import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MockUniswapV2Router02 } from "./MockUniswapV2Router02";
export declare class MockUniswapV2Router02Factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<MockUniswapV2Router02>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): MockUniswapV2Router02;
    connect(signer: Signer): MockUniswapV2Router02Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): MockUniswapV2Router02;
}
