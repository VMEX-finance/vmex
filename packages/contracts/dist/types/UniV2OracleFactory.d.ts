import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { UniV2Oracle } from "./UniV2Oracle";
export declare class UniV2OracleFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<UniV2Oracle>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): UniV2Oracle;
    connect(signer: Signer): UniV2OracleFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): UniV2Oracle;
}
