import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IUniswapV3PoolDeployer } from "./IUniswapV3PoolDeployer";
export declare class IUniswapV3PoolDeployerFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IUniswapV3PoolDeployer;
}
