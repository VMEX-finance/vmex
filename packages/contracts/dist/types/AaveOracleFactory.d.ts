import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { AaveOracle } from "./AaveOracle";
export declare class AaveOracleFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(assets: string[], sources: string[], fallbackOracle: string, baseCurrency: string, baseCurrencyUnit: BigNumberish, overrides?: Overrides): Promise<AaveOracle>;
    getDeployTransaction(assets: string[], sources: string[], fallbackOracle: string, baseCurrency: string, baseCurrencyUnit: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): AaveOracle;
    connect(signer: Signer): AaveOracleFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): AaveOracle;
}
