import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CurvePoolMocked } from "./CurvePoolMocked";
export declare class CurvePoolMockedFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_virtual_price: BigNumberish, overrides?: Overrides): Promise<CurvePoolMocked>;
    getDeployTransaction(_virtual_price: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): CurvePoolMocked;
    connect(signer: Signer): CurvePoolMockedFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): CurvePoolMocked;
}
