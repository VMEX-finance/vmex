import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { BaseOracle } from "./BaseOracle";
export declare class BaseOracleFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_pool: string, _token_to_price: BigNumberish, decimals: BigNumberish, overrides?: Overrides): Promise<BaseOracle>;
    getDeployTransaction(_pool: string, _token_to_price: BigNumberish, decimals: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): BaseOracle;
    connect(signer: Signer): BaseOracleFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): BaseOracle;
}
