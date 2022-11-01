import { Signer, BytesLike } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { ContractFactory, PayableOverrides } from "@ethersproject/contracts";
import type { UpgradeabilityProxy } from "./UpgradeabilityProxy";
export declare class UpgradeabilityProxyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_logic: string, _data: BytesLike, overrides?: PayableOverrides): Promise<UpgradeabilityProxy>;
    getDeployTransaction(_logic: string, _data: BytesLike, overrides?: PayableOverrides): TransactionRequest;
    attach(address: string): UpgradeabilityProxy;
    connect(signer: Signer): UpgradeabilityProxyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): UpgradeabilityProxy;
}
