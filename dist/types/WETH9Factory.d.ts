import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { WETH9 } from "./WETH9";
export declare class WETH9Factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<WETH9>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): WETH9;
    connect(signer: Signer): WETH9Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): WETH9;
}
