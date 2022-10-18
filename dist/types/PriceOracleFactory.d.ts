import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { PriceOracle } from "./PriceOracle";
export declare class PriceOracleFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<PriceOracle>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): PriceOracle;
    connect(signer: Signer): PriceOracleFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): PriceOracle;
}
