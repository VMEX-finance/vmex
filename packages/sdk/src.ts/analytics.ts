import { deployments } from "./constants";
import { BigNumber, ethers } from "ethers";
import {
  getAaveProtocolDataProvider,
  getAToken,
  getIErc20,
  getLendingPoolConfiguratorProxy,
  getLendingPool,
  defaultTestProvider,
} from "./contract-getters";
import {
  ReserveData,
  UserReserveData,
  UserSummaryData
} from "./interfaces";

import { decodeConstructorBytecode } from "./decode-bytecode";
import { generateFinalUserSummary } from "./utils";

/**
 * PROTOCOL LEVEL ANALYTICS
 */

export async function getTotalTranches(
  params?: {
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<BigNumber>
) {
  let configurator = await getLendingPoolConfiguratorProxy({
    network: params.network,
  });
  return configurator.totalTranches();
}

export async function getTotalMarkets(
  params?: {
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<BigNumber>
) {
  return getTotalTranches(params);
}

/**
 * getTVL()
 * @params { network?: string, test?: bool }
 * @returns uint(aTokens, underlying)
 * returns a tuple containing the sum of the balances of all aTokens in all pools
 */
export async function getTVL(
  params?: {
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  const provider = params.test
    ? new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    : null;
  const {
    abi,
    bytecode,
  } = require("@vmex/contracts/artifacts/contracts/analytics-utilities/QueryLendingPoolTVL.sol/QueryTrancheTVL.json");
  let _aaveProvider =
    deployments.AaveProtocolDataProvider[params.network || "mainnet"].address;
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    _aaveProvider,
  ]);
  return data;
}

export async function getAllTrancheNames(
  params: {
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  const configurator = await getLendingPoolConfiguratorProxy({
    network: params.network,
  });

  let trancheIds = (await configurator.totalTranches()).toNumber();
  let x = [...Array(trancheIds).keys()];
  return Promise.all(x.map(async (x) => await configurator.trancheNames(x)));
}

/**
 * getWalletBalanceAcrossTranches
 *
 */
export async function getWalletBalanceAcrossTranches(
  params: {
    signer: ethers.Signer;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  const {
    abi,
    bytecode,
  } = require("@vmex/contracts/artifacts/contracts/analytics-utilities/userBalanceAcrossTranches.sol/UserBalanceAcrossTranches.json");
  let user_address = await params.signer.getAddress();
  let provider = params.test
    ? new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    : null;
  let add_provider_address =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let wallet_data_address =
    deployments.WalletBalanceProvider[params.network || "mainnet"].address;
  return decodeConstructorBytecode(abi, bytecode, provider, [
    user_address,
    add_provider_address,
    wallet_data_address,
  ]);
}
/**
 * TRANCHE LEVEL ANALYTICS
 */

export async function getTrancheName(
  params: {
    tranche: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  const configurator = await getLendingPoolConfiguratorProxy({
    network: params.network,
  });

  return configurator.trancheNames(params.tranche);
}

export async function getAssetsForTranche(
  params: {
    tranche: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  const lendingPool = await getLendingPool({ network: params.network });

  return await lendingPool.getReservesList(params.tranche);
}

export async function getTrancheTVL(
  params: {
    tranche: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  // get all vTokens associated with the given tranche
  const [allvTokens, reserveAddresses] = await getTrancheTokens({
    tranche: params.tranche,
    network: params.network,
    test: params.test,
  });

  var tvl = BigNumber.from(0);
  for (let i = 0; i < allvTokens.length; i++) {
    const underlying = await getIErc20({
      address: reserveAddresses[i],
    });
    const bal = await underlying.balanceOf(allvTokens[i]);
    tvl = tvl.add(bal);
  }

  return tvl;
}

export async function getTrancheTokens(
  params: {
    tranche: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  const helperContract = await getAaveProtocolDataProvider({
    network: params.network,
  });

  const allvTokens = await helperContract.getAllATokens(params.tranche);

  let vTokenAddresses = [];
  allvTokens.map((vTokenData) => {
    vTokenAddresses.push(vTokenData.tokenAddress);
  });

  let underlyingAddresses = [];
  for (const vTokenAddress of vTokenAddresses) {
    const vToken = await getAToken({
      address: vTokenAddress,
    });
    const underlying = await vToken.UNDERLYING_ASSET_ADDRESS();
    underlyingAddresses.push(underlying);
  }

  return [vTokenAddresses, underlyingAddresses];
}

/**
 * ASSET LEVEL ANALYTICS
 */

export async function getReserveData(
  params: {
    underlying: string;
    tranche: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
): Promise<ReserveData> {
  const helperContract = await getAaveProtocolDataProvider({
    network: params.network,
  });

  return await helperContract.getReserveData(params.underlying, params.tranche);
}

export async function getReserveDataBase(
  params: {
    underlying: string;
    tranche: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
): Promise<ReserveData> {
  const lendingPool = await getLendingPool({ network: params.network });

  return await lendingPool.getReserveData(params.underlying, params.tranche);
}

/**
 * USER LEVEL ANALYTICS
 */

export async function getUserSummaryData(
  params: {
    user: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<UserSummaryData>
): Promise<UserSummaryData> {
  const provider = params.test ? defaultTestProvider : null;
  const {
    abi,
    bytecode,
  } = require("@vmex/contracts/artifacts/contracts/analytics-utilities/GetUserSummaryData.sol/GetUserSummaryData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let _dataProvider =
    deployments.AaveProtocolDataProvider[params.network || "mainnet"].address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    _dataProvider,
    params.user,
    true,
    0,
  ]);
  return generateFinalUserSummary(data);
}

export async function getUserTrancheData(
  params: {
    tranche: string;
    user: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<UserSummaryData>
): Promise<UserSummaryData> {
  const provider = params.test ? defaultTestProvider : null;
  const {
    abi,
    bytecode,
  } = require("@vmex/contracts/artifacts/contracts/analytics-utilities/GetUserSummaryData.sol/GetUserSummaryData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let _dataProvider =
    deployments.AaveProtocolDataProvider[params.network || "mainnet"].address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    _dataProvider,
    params.user,
    false,
    params.tranche,
  ]);

  return generateFinalUserSummary(data);
}
