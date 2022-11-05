import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ILendingPoolAddressesProviderRegistry } from "./ILendingPoolAddressesProviderRegistry";
export declare class ILendingPoolAddressesProviderRegistryFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ILendingPoolAddressesProviderRegistry;
}
