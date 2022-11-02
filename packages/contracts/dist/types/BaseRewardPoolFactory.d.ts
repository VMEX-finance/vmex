import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { BaseRewardPool } from "./BaseRewardPool";
export declare class BaseRewardPoolFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<BaseRewardPool>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): BaseRewardPool;
    connect(signer: Signer): BaseRewardPoolFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): BaseRewardPool;
}
