import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MintableDelegationERC20 } from "./MintableDelegationERC20";
export declare class MintableDelegationERC20Factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(name: string, symbol: string, decimals: BigNumberish, overrides?: Overrides): Promise<MintableDelegationERC20>;
    getDeployTransaction(name: string, symbol: string, decimals: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): MintableDelegationERC20;
    connect(signer: Signer): MintableDelegationERC20Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): MintableDelegationERC20;
}
