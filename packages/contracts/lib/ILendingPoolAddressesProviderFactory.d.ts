import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ILendingPoolAddressesProvider } from "./ILendingPoolAddressesProvider";
export declare class ILendingPoolAddressesProviderFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ILendingPoolAddressesProvider;
}
