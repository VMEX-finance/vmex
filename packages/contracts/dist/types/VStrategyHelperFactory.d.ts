import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { VStrategyHelper } from "./VStrategyHelper";
export declare class VStrategyHelperFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<VStrategyHelper>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): VStrategyHelper;
    connect(signer: Signer): VStrategyHelperFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): VStrategyHelper;
}
