import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { MintableERC20 } from "./MintableERC20";
export declare class MintableERC20Factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(name: string, symbol: string, decimals: BigNumberish, overrides?: Overrides): Promise<MintableERC20>;
    getDeployTransaction(name: string, symbol: string, decimals: BigNumberish, overrides?: Overrides): TransactionRequest;
    attach(address: string): MintableERC20;
    connect(signer: Signer): MintableERC20Factory;
    static connect(address: string, signerOrProvider: Signer | Provider): MintableERC20;
}
