import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, Overrides } from "@ethersproject/contracts";
import type { Booster } from "./Booster";
export declare class BoosterFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides): Promise<Booster>;
    getDeployTransaction(overrides?: Overrides): TransactionRequest;
    attach(address: string): Booster;
    connect(signer: Signer): BoosterFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): Booster;
}
