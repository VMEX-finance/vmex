import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ILendingPoolCollateralManager } from "./ILendingPoolCollateralManager";
export declare class ILendingPoolCollateralManagerFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ILendingPoolCollateralManager;
}
