import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CurvePool } from "./CurvePool";
export declare class CurvePoolFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<CurvePool>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): CurvePool;
    connect(signer: Signer): CurvePoolFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): CurvePool;
}
