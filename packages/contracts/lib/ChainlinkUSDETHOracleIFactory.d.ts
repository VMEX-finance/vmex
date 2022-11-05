import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ChainlinkUSDETHOracleI } from "./ChainlinkUSDETHOracleI";
export declare class ChainlinkUSDETHOracleIFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): ChainlinkUSDETHOracleI;
}
