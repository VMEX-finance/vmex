import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { LendingRateOracle } from "./LendingRateOracle";
export declare class LendingRateOracleFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<LendingRateOracle>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): LendingRateOracle;
    connect(signer: Signer): LendingRateOracleFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): LendingRateOracle;
}
