import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { DepositWithdrawLogic } from "./DepositWithdrawLogic";
export declare class DepositWithdrawLogicFactory extends ContractFactory {
    constructor(linkLibraryAddresses: DepositWithdrawLogicLibraryAddresses, signer?: Signer);
    static linkBytecode(linkLibraryAddresses: DepositWithdrawLogicLibraryAddresses): string;
    deploy(overrides?: Overrides): Promise<DepositWithdrawLogic>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): DepositWithdrawLogic;
    connect(signer: Signer): DepositWithdrawLogicFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): DepositWithdrawLogic;
}
export interface DepositWithdrawLogicLibraryAddresses {
    ["__$de8c0cf1a7d7c36c802af9a64fb9d86036$__"]: string;
}
