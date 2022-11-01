import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { WETHGateway } from "./WETHGateway";
export declare class WETHGatewayFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(weth: string, overrides?: Overrides): Promise<WETHGateway>;
    getDeployTransaction(weth: string, overrides?: Overrides): TransactionRequest;
    attach(address: string): WETHGateway;
    connect(signer: Signer): WETHGatewayFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): WETHGateway;
}
