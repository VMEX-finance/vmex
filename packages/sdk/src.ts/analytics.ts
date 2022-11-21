import { deployments } from "./constants";
import BigNumber from "bignumber.js";
import {
  defaultTestProvider,
} from "./contract-getters";
import {
  AssetData,
  ProtocolData,
  TrancheData,
  UserSummaryData,
} from "./interfaces";

import { decodeConstructorBytecode } from "./decode-bytecode";
import { generateFinalUserSummary } from "./utils";

/**
 * PROTOCOL LEVEL ANALYTICS
 */
export async function getProtocolData(
  params?: {
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<ProtocolData>
): Promise<ProtocolData> {

  let allTrancheData = await getAllTrancheData(params);

  let protocolData : ProtocolData = {
    tvl: new BigNumber(0),
    totalReserves: new BigNumber(0),
    totalSupplied: new BigNumber(0),
    totalBorrowed: new BigNumber(0),
    numLenders: new BigNumber(0),
    numBorrowers: new BigNumber(0),
    numTranches: allTrancheData.length,
    topTranches: [],
    topSuppliedAssets: [],
    topBorrowedAssets: [],
  };
  allTrancheData.map((data) => {
    protocolData.tvl.plus(data.tvl);
    protocolData.totalReserves.plus(data.availableLiquidity);
    protocolData.totalSupplied.plus(data.totalSupplied);
    protocolData.totalBorrowed.plus(data.totalBorrowed);
  });

  let topTranches = [...allTrancheData].sort((a, b) => {
    return a.totalSupplied.plus(a.totalBorrowed)
      .gt(b.totalSupplied.plus(b.totalBorrowed))
      ? -1
      : 1;
  });

  protocolData.topTranches = topTranches.slice(0,Math.min(5,topTranches.length));

  return protocolData;
}

/**
 * TRANCHE LEVEL ANALYTICS
 */

export async function getAllTrancheData(
  params: {
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<TrancheData[]>
): Promise<TrancheData[]> {
  const provider = params.test ? defaultTestProvider : null;
  const {
    abi,
    bytecode,
  } = require("@vmex/contracts/artifacts/contracts/analytics-utilities/GetAllTrancheData.sol/GetAllTrancheData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
  ]);

  return data;
}

export async function getTrancheData(
  params: {
    tranche: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<TrancheData>
): Promise<TrancheData> {
  const provider = params.test ? defaultTestProvider : null;
  const {
    abi,
    bytecode,
  } = require("@vmex/contracts/artifacts/contracts/analytics-utilities/GetTrancheData.sol/GetTrancheData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.tranche,
  ]);

  return data;
}

/**
 * ASSET LEVEL ANALYTICS
 */

export async function getTrancheAssetData(
  params: {
    asset: string;
    tranche: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
): Promise<AssetData> {
  const provider = params.test ? defaultTestProvider : null;
  const {
    abi,
    bytecode,
  } = require("@vmex/contracts/artifacts/contracts/analytics-utilities/GetTrancheAssetData.sol/GetTrancheAssetData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.asset,
    params.tranche,
  ]);

  return data;
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
