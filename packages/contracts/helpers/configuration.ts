import {
  AavePools,
  iMultiPoolsAssets,
  IReserveParams,
  PoolConfiguration,
  eNetwork,
  IBaseConfiguration,
  iParamsPerNetwork,
} from "./types";
import {
  getEthersSignersAddresses,
  getParamPerPool,
} from "./contracts-helpers";
import AaveConfig from "../markets/aave";
import OptimismConfig from "../markets/optimism";
import BaseConfig from "../markets/base"
import ArbitrumConfig from "../markets/arbitrum"

import { CommonsConfig } from "../markets/aave/commons";
import { DRE, filterMapBy } from "./misc-utils";
import { tEthereumAddress } from "./types";
import { getParamPerNetwork } from "./contracts-helpers";
import { deployWETHMocked } from "./contracts-deployments";
import BigNumber from "bignumber.js";

export enum ConfigNames {
  Commons = "Commons",
  Aave = "Aave",
  Matic = "Matic",
  Amm = "Amm",
  Avalanche = "Avalanche",
  Optimism = "Optimism",
  Base = "Base",
  Arbitrum = "Arbitrum",
}

export const loadPoolConfig = (configName: ConfigNames): PoolConfiguration => {
  switch (configName) {
    case ConfigNames.Aave:
      return AaveConfig;
    // case ConfigNames.Matic:
    //   return MaticConfig;
    // case ConfigNames.Amm:
    //   return AmmConfig;
    // case ConfigNames.Avalanche:
    //   return AvalancheConfig;
    case ConfigNames.Optimism:
      return OptimismConfig;
    case ConfigNames.Base:
      return BaseConfig;
    case ConfigNames.Arbitrum:
      return ArbitrumConfig;
    case ConfigNames.Commons:
      return CommonsConfig;
    default:
      throw new Error(
        `Unsupported pool configuration: ${configName} is not one of the supported configs ${Object.values(
          ConfigNames
        )}`
      );
  }
};

// ----------------
// PROTOCOL PARAMS PER POOL
// ----------------

export const getReservesConfigByPool = (
  pool: AavePools
): iMultiPoolsAssets<IReserveParams> =>
  getParamPerPool<iMultiPoolsAssets<IReserveParams>>(
    {
      [AavePools.proto]: {
        ...AaveConfig.ReservesConfig,
      },
      // [AavePools.amm]: {
      //   ...AmmConfig.ReservesConfig,
      // },
      // [AavePools.matic]: {
      //   ...MaticConfig.ReservesConfig,
      // },
      // [AavePools.avalanche]: {
      //   ...AvalancheConfig.ReservesConfig,
      // },
    },
    pool
  );

const getAddressFromConfig = async (
  target: iParamsPerNetwork<string | undefined>,
  targetIndex: number
): Promise<tEthereumAddress> => {
  const currentNetwork = process.env.FORK ? process.env.FORK : DRE.network.name;
  const targetAddress = getParamPerNetwork(
    target,
    <eNetwork>currentNetwork
  );
  if (targetAddress) {
    return targetAddress;
  }
  return getAddressFromConfigIndex(targetIndex);
}


const getAddressFromConfigIndex = async (
  targetIndex: number
): Promise<tEthereumAddress> => {
  const addressList = await getEthersSignersAddresses();
  return addressList[targetIndex];
}

export const getGlobalAdminMulitisig = async (
  config: IBaseConfiguration
): Promise<tEthereumAddress> => {
  return getAddressFromConfig(config.GlobalAdminMultisig, 0);
};


export const getGenesisPoolAdmin = async (
  config: IBaseConfiguration
): Promise<tEthereumAddress> => {
  return getAddressFromConfig(config.PoolAdmin, config.PoolAdminIndex);
};

export const getEmergencyAdmin = async (
  config: IBaseConfiguration
): Promise<tEthereumAddress> => {
  return getAddressFromConfig(config.EmergencyAdmin, config.EmergencyAdminIndex);
};

export const getGenesisPoolAdminIndex = async (
  config: IBaseConfiguration
): Promise<tEthereumAddress> => {
  return getAddressFromConfigIndex(config.PoolAdminIndex);
};

export const getEmergencyAdminIndex = async (
  config: IBaseConfiguration
): Promise<tEthereumAddress> => {
  return getAddressFromConfigIndex(config.EmergencyAdminIndex);
};

export const getVMEXTreasury = async (
  config: IBaseConfiguration
): Promise<tEthereumAddress> => {
  return getAddressFromConfig(config.VMEXTreasury, 0);
};

export const getATokenDomainSeparatorPerNetwork = (
  network: eNetwork,
  config: IBaseConfiguration
): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(config.ATokenDomainSeparator, network);

export const getWethAddress = async (config: IBaseConfiguration) => {
  const currentNetwork = process.env.FORK ? process.env.FORK : DRE.network.name;
  const wethAddress = getParamPerNetwork(config.WETH, <eNetwork>currentNetwork);
  if (wethAddress) {
    return wethAddress;
  }
  if (currentNetwork.includes("main")) {
    throw new Error("WETH not set at mainnet configuration.");
  }
  const weth = await deployWETHMocked();
  return weth.address;
};

export const getWrappedNativeTokenAddress = async (
  config: IBaseConfiguration
) => {
  const currentNetwork =
    process.env.MAINNET_FORK === "true" ? "main" : DRE.network.name;
  const wethAddress = getParamPerNetwork(
    config.WrappedNativeToken,
    <eNetwork>currentNetwork
  );
  if (wethAddress) {
    console.log("WETH address: ", wethAddress)
    return wethAddress;
  }
  if (currentNetwork.includes("main")) {
    throw new Error("WETH not set at mainnet configuration.");
  }
  const weth = await deployWETHMocked();
  return weth.address;
};

export const getQuoteCurrency = async (config: IBaseConfiguration) => {
  switch (config.OracleQuoteCurrency) {
    case "ETH":
    case "WETH":
      return getWethAddress(config);
    case "USD":
      return config.ProtocolGlobalParams.UsdAddress;
    default:
      throw `Quote ${config.OracleQuoteCurrency} currency not set. Add a new case to getQuoteCurrency switch`;
  }
};

// if testing strategies, make sure to have to comment out cvx, crv, underlying
// token allow all inside CrvLpStrategy.sol, otherwise setup fails for all tests
export const isHardhatTestingStrategies = false;
