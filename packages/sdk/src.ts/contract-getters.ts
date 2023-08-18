import { ethers } from "ethers";
import { deployments } from "./constants";
import _ from "lodash";
import AaveProtocolDataProvider from "@vmexfinance/contracts/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json";
import IERC20 from "@vmexfinance/contracts/artifacts/contracts/dependencies/openzeppelin/contracts/IERC20.sol/IERC20.json";
import IAToken from "@vmexfinance/contracts/artifacts/contracts/interfaces/IAToken.sol/IAToken.json";
import ILendingPool from "@vmexfinance/contracts/artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json";
import ILendingPoolConfigurator from "@vmexfinance/contracts/artifacts/contracts/protocol/lendingpool/LendingPoolConfigurator.sol/LendingPoolConfigurator.json";
import ILendingPoolAddressesProvider from "@vmexfinance/contracts/artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";
import WETHGateway from "@vmexfinance/contracts/artifacts/contracts/misc/WETHGateway.sol/WETHGateway.json";
import IncentivesController from "@vmexfinance/contracts/artifacts/contracts/protocol/incentives/IncentivesController.sol/IncentivesController.json";
import IERC20Detailed from "@vmexfinance/contracts/artifacts/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol/IERC20Detailed.json";
import MintableERC20 from "@vmexfinance/contracts/artifacts/contracts/mocks/tokens/MintableERC20.sol/MintableERC20.json";
import VariableDebtToken from "@vmexfinance/contracts/artifacts/contracts/protocol/tokenization/VariableDebtToken.sol/VariableDebtToken.json";

export function getProvider(providerRpc?: string, test?: boolean) {
  return providerRpc
  ? ethers.getDefaultProvider(providerRpc)
  : test || test===undefined
    ? ethers.getDefaultProvider(
      "http://0.0.0.0:8545"
    ) : null;
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

export async function getMintableERC20(params?: {
  tokenSymbol: string;
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
  providerRpc?: string;
}) {
  let token = new ethers.Contract(
    deployments[params.tokenSymbol.toUpperCase()][
      `${params && params.network ? params.network : "mainnet"}`
    ].address,
    MintableERC20.abi,
    getProvider(params.providerRpc, params.test)
  );

  if (params.signer) return token.connect(params.signer);

  return token;
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

export async function getIncentivesController(params?: {
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
  providerRpc?: string;
}) {
  let incentivesController = new ethers.Contract(
    deployments.IncentivesControllerProxy[
      `${params.network || "mainnet"}`
    ].address,
    IncentivesController.abi,
    getProvider(params.providerRpc, params.test)
  );
  if (params.signer) return incentivesController.connect(params.signer);
  return incentivesController;
}


/**
 * getWETHGateway
 * Gets the weth gateway contract, connect a signer if given one
 */
export async function getWETHGateway(params?: {
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
  providerRpc?: string;
}) {
  let gateway = new ethers.Contract(
    deployments.WETHGateway[
      `${params && params.network ? params.network : "mainnet"}`
    ].address,
    WETHGateway.abi,
    getProvider(params.providerRpc, params.test)
  );

  if (params.signer) return gateway.connect(params.signer);

  return gateway;
}


export async function getVariableDebtToken(params?: {
  address?: string;
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
  providerRpc?: string;
}) {
  let token = new ethers.Contract(
    params.address || deployments.VariableDebtToken[
      `${params && params.network ? params.network : "mainnet"}`
    ].address,
    VariableDebtToken.abi,
    getProvider(params.providerRpc, params.test)
  );

  if (params.signer) return token.connect(params.signer);

  return token;
}
