import { AavePools, iMultiPoolsAssets, IReserveParams, PoolConfiguration, eNetwork, IBaseConfiguration } from "./types";
import { tEthereumAddress } from "./types";
export declare enum ConfigNames {
    Commons = "Commons",
    Aave = "Aave",
    Matic = "Matic",
    Amm = "Amm",
    Avalanche = "Avalanche"
}
export declare const loadCustomAavePoolConfig: (trancheId: string) => PoolConfiguration;
export declare const loadPoolConfig: (configName: ConfigNames) => PoolConfiguration;
export declare const getReservesConfigByPool: (pool: AavePools) => iMultiPoolsAssets<IReserveParams>;
export declare const getGenesisPoolAdmin: (config: IBaseConfiguration) => Promise<tEthereumAddress>;
export declare const getEmergencyAdmin: (config: IBaseConfiguration) => Promise<tEthereumAddress>;
export declare const getTreasuryAddress: (config: IBaseConfiguration) => Promise<tEthereumAddress>;
export declare const getGlobalVMEXReserveFactor: () => Promise<string>;
export declare const getATokenDomainSeparatorPerNetwork: (network: eNetwork, config: IBaseConfiguration) => tEthereumAddress;
export declare const getWethAddress: (config: IBaseConfiguration) => Promise<string>;
export declare const getWrappedNativeTokenAddress: (config: IBaseConfiguration) => Promise<string>;
export declare const getLendingRateOracles: (poolConfig: IBaseConfiguration) => {
    [key: string]: any;
};
export declare const getQuoteCurrency: (config: IBaseConfiguration) => Promise<string>;
export declare const isHardhatTestingStrategies = false;
