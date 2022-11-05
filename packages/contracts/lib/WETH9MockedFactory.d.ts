import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { WETH9Mocked } from "./WETH9Mocked";
export declare class WETH9MockedFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<WETH9Mocked>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): WETH9Mocked;
    connect(signer: Signer): WETH9MockedFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): WETH9Mocked;
}
