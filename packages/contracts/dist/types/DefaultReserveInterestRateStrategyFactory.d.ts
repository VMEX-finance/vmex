import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { DefaultReserveInterestRateStrategy } from "./DefaultReserveInterestRateStrategy";
export declare class DefaultReserveInterestRateStrategyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(provider: string, optimalUtilizationRate: BigNumberish, baseVariableBorrowRate: BigNumberish, variableRateSlope1: BigNumberish, variableRateSlope2: BigNumberish, stableRateSlope1: BigNumberish, stableRateSlope2: BigNumberish, overrides?: Overrides): Promise<DefaultReserveInterestRateStrategy>;
    getDeployTransaction(provider: string, optimalUtilizationRate: BigNumberish, baseVariableBorrowRate: BigNumberish, variableRateSlope1: BigNumberish, variableRateSlope2: BigNumberish, stableRateSlope1: BigNumberish, stableRateSlope2: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): DefaultReserveInterestRateStrategy;
    connect(signer: Signer): DefaultReserveInterestRateStrategyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): DefaultReserveInterestRateStrategy;
}
