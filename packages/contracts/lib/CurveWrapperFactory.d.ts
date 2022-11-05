import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { CurveWrapper } from "./CurveWrapper";
export declare class CurveWrapperFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(addressProvider: string, fallbackOracle: string, baseCurrency: string, baseCurrencyUnit: BigNumberish, overrides?: Overrides): Promise<CurveWrapper>;
    getDeployTransaction(addressProvider: string, fallbackOracle: string, baseCurrency: string, baseCurrencyUnit: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): CurveWrapper;
    connect(signer: Signer): CurveWrapperFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): CurveWrapper;
}
