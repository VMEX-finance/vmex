import { ethers } from "ethers";
import { deployments } from "./constants";
import _ from "lodash";
import AaveProtocolDataProvider from "@vmexfinance/contracts/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json";
import IERC20 from "@vmexfinance/contracts/artifacts/contracts/dependencies/openzeppelin/contracts/IERC20.sol/IERC20.json";
import IAToken from "@vmexfinance/contracts/artifacts/contracts/interfaces/IAToken.sol/IAToken.json";
import ILendingPool from "@vmexfinance/contracts/artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json";
import ILendingPoolConfigurator from "@vmexfinance/contracts/artifacts/contracts/protocol/lendingpool/LendingPoolConfigurator.sol/LendingPoolConfigurator.json";
import ILendingPoolAddressesProvider from "@vmexfinance/contracts/artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";
import IERC20Detailed from "@vmexfinance/contracts/artifacts/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol/IERC20Detailed.json";

const defaultTestProvider = ethers.getDefaultProvider(
  "http://0.0.0.0:8545"
);

export function getProvider(providerRpc?: string, test?: boolean) {
  return providerRpc
  ? ethers.getDefaultProvider(providerRpc)
  : test || test===undefined
    ? defaultTestProvider : null;
}

export const getIErc20Detailed = async (address: string, providerRpc: string, test: boolean) =>
  new ethers.Contract(address, IERC20Detailed.abi, getProvider(providerRpc, test))

/**
 * getLendingPool
 * Gets the lending pool contract, connect a signer if given one
 */
export async function getLendingPool(params?: {
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
  providerRpc?: string;
}) {
  let lendingPool = new ethers.Contract(
    deployments.LendingPool[
      `${params && params.network ? params.network : "mainnet"}`
    ].address,
    ILendingPool.abi,
    getProvider(params.providerRpc, params.test)
  );

  if (params.signer) return lendingPool.connect(params.signer);

  return lendingPool;
}

export async function getAaveProtocolDataProvider(params?: {
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
  providerRpc?: string;
}) {
  let helperContract = new ethers.Contract(
    deployments.AaveProtocolDataProvider[
      `${params.network || "mainnet"}`
    ].address,
    AaveProtocolDataProvider.abi,
    getProvider(params.providerRpc, params.test)
  );
  if (params.signer) return helperContract.connect(params.signer);
  return helperContract;
}

export async function getAToken(params?: {
  address: string;
  signer?: ethers.Signer;
  test?: boolean;
  providerRpc?: string;
}) {
  let aToken = new ethers.Contract(
    params.address,
    IAToken.abi,
    getProvider(params.providerRpc, params.test)
  );
  if (params.signer) return aToken.connect(params.signer);
  return aToken;
}

export async function getIErc20(params?: {
  address: string;
  signer?: ethers.Signer;
  test?: boolean;
  providerRpc?: string;
}) {
  let ercToken = new ethers.Contract(
    params.address,
    IERC20.abi,
    getProvider(params.providerRpc, params.test)
  );
  if (params.signer) return ercToken.connect(params.signer);
  return ercToken;
}

export async function getLendingPoolConfiguratorProxy(params?: {
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
  providerRpc?: string;
}) {
  let configurator = new ethers.Contract(
    deployments.LendingPoolConfigurator[
      `${params && params.network ? params.network : "mainnet"}`
    ].address,
    ILendingPoolConfigurator.abi,
    getProvider(params.providerRpc, params.test)
  );
  if (params.signer) return configurator.connect(params.signer);
  return configurator;
}

export async function getLendingPoolAddressesProvider(params?: {
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
  providerRpc?: string;
}) {
  let addressProvider = new ethers.Contract(
    deployments.LendingPoolAddressesProvider[
      `${params.network || "mainnet"}`
    ].address,
    ILendingPoolAddressesProvider.abi,
    getProvider(params.providerRpc, params.test)
  );
  if (params.signer) return addressProvider.connect(params.signer);
  return addressProvider;
}
