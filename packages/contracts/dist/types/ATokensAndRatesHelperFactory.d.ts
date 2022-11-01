import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { ATokensAndRatesHelper } from "./ATokensAndRatesHelper";
export declare class ATokensAndRatesHelperFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_pool: string, _addressesProvider: string, _poolConfigurator: string, _DefaultVMEXReserveFactor: BigNumberish, overrides?: Overrides): Promise<ATokensAndRatesHelper>;
    getDeployTransaction(_pool: string, _addressesProvider: string, _poolConfigurator: string, _DefaultVMEXReserveFactor: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): ATokensAndRatesHelper;
    connect(signer: Signer): ATokensAndRatesHelperFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): ATokensAndRatesHelper;
}
