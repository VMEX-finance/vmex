import { ethers } from "ethers";
import { deployments } from "./constants";
import _ from "lodash";
import AaveProtocolDataProvider from "@vmex/contracts/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json";
import IERC20 from "@vmex/contracts/artifacts/contracts/dependencies/openzeppelin/contracts/IERC20.sol/IERC20.json";
import IAToken from "@vmex/contracts/artifacts/contracts/interfaces/IAToken.sol/IAToken.json";
import ILendingPool from "@vmex/contracts/artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json";
import ILendingPoolConfigurator from "@vmex/contracts/artifacts/contracts/protocol/lendingpool/LendingPoolConfigurator.sol/LendingPoolConfigurator.json";
import ILendingPoolAddressesProvider from "@vmex/contracts/artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";
import WalletBalanceProvider from "@vmex/contracts/artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json";
import IERC20Detailed from "@vmex/contracts/artifacts/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol/IERC20Detailed.json";

export const defaultTestProvider = ethers.getDefaultProvider(
  "http://localhost:8545", "any"
);

// The "any" network will allow spontaneous network changes
// const defaultTestProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
// defaultTestProvider.on("network", (newNetwork, oldNetwork) => {
//     // When a Provider makes its initial connection, it emits a "network"
//     // event with a null oldNetwork along with the newNetwork. So, if the
//     // oldNetwork exists, it represents a changing network
//     if (oldNetwork) {
//         window.location.reload();
//     }
// });

console.log("defaultTestProvider: ",defaultTestProvider);

export const getIErc20Detailed = async (address: string) =>
  new ethers.Contract(address, IERC20Detailed.abi, defaultTestProvider)

/**
 * getLendingPool
 * Gets the lending pool contract, connect a signer if given one
 */
export async function getLendingPool(params?: {
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
}) {
  let lendingPool = new ethers.Contract(
    deployments.LendingPool[
      `${params && params.network ? params.network : "mainnet"}`
    ].address,
    ILendingPool.abi,
    defaultTestProvider
  );

  if (params.signer) return lendingPool.connect(params.signer);

  return lendingPool;
}

export async function getAaveProtocolDataProvider(params?: {
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
}) {
  let helperContract = new ethers.Contract(
    deployments.AaveProtocolDataProvider[
      `${params.network || "mainnet"}`
    ].address,
    AaveProtocolDataProvider.abi,
    defaultTestProvider
  );
  if (params.signer) return helperContract.connect(params.signer);
  return helperContract;
}

export async function getAToken(params?: {
  address: string;
  signer?: ethers.Signer;
}) {
  let aToken = new ethers.Contract(
    params.address,
    IAToken.abi,
    defaultTestProvider
  );
  if (params.signer) return aToken.connect(params.signer);
  return aToken;
}

export async function getIErc20(params?: {
  address: string;
  signer?: ethers.Signer;
}) {
  let ercToken = new ethers.Contract(
    params.address,
    IERC20.abi,
    defaultTestProvider
  );
  if (params.signer) return ercToken.connect(params.signer);
  return ercToken;
}

export async function getLendingPoolConfiguratorProxy(params?: {
  signer?: ethers.Signer;
  network?: string;
}) {
  let configurator = new ethers.Contract(
    deployments.LendingPoolConfigurator[
      `${params.network || "mainnet"}`
    ].address,
    ILendingPoolConfigurator.abi,
    defaultTestProvider
  );
  if (params.signer) return configurator.connect(params.signer);
  return configurator;
}

export async function getLendingPoolAddressesProvider(params?: {
  signer?: ethers.Signer;
  network?: string;
}) {
  let addressProvider = new ethers.Contract(
    deployments.LendingPoolAddressesProvider[
      `${params.network || "mainnet"}`
    ].address,
    ILendingPoolAddressesProvider.abi,
    defaultTestProvider
  );
  if (params.signer) return addressProvider.connect(params.signer);
  return addressProvider;
}

export async function getWalletBalanceProvider(params?: {
  signer?: ethers.Signer;
  network?: string;
}) {
  let balanceProvider = new ethers.Contract(
    deployments.WalletBalanceProvider[
      `${params.network || "mainnet"}`
    ].address,
    WalletBalanceProvider.abi,
    defaultTestProvider
  );
  if (params.signer) return balanceProvider.connect(params.signer);
  return balanceProvider;
}


