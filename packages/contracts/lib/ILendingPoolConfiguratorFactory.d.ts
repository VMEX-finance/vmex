import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ILendingPoolConfigurator } from "./ILendingPoolConfigurator";
export declare class ILendingPoolConfiguratorFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ILendingPoolConfigurator;
}
