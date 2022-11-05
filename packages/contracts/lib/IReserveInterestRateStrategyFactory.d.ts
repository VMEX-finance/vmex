import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IReserveInterestRateStrategy } from "./IReserveInterestRateStrategy";
export declare class IReserveInterestRateStrategyFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IReserveInterestRateStrategy;
}
