import { deployments } from "./constants";
import {BigNumber} from "ethers";
import {
  defaultTestProvider,
} from "./contract-getters";
import {
  AssetData,
  ProtocolData,
  TopAssetsData,
  TrancheData,
  UserSummaryData,
  UserTrancheData,
  AssetBalance,
} from "./interfaces";

import { decodeConstructorBytecode } from "./decode-bytecode";

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
    tvl: BigNumber.from(0),
    totalReserves: BigNumber.from(0),
    totalSupplied: BigNumber.from(0),
    totalBorrowed: BigNumber.from(0),
    numLenders: BigNumber.from(0),
    numBorrowers: BigNumber.from(0),
    numTranches: allTrancheData.length,
    topTranches: [],
    topSuppliedAssets: [],
    topBorrowedAssets: [],
  };
  allTrancheData.map((data: TrancheData) => {
    protocolData.tvl = protocolData.tvl.add(data.tvl);
    protocolData.totalReserves = protocolData.totalReserves.add(data.availableLiquidity);
    protocolData.totalSupplied = protocolData.totalSupplied.add(data.totalSupplied);
    protocolData.totalBorrowed = protocolData.totalBorrowed.add(data.totalBorrowed);
  });

  let topTranches = [...allTrancheData].sort((a, b) => {
    return a.totalSupplied.add(a.totalBorrowed)
      .gt(b.totalSupplied.add(b.totalBorrowed))
      ? -1
      : 1;
  });

  protocolData.topTranches = topTranches.slice(0,Math.min(5,topTranches.length));

  let topAssets = await getTopAssets(params);
  protocolData.topSuppliedAssets = topAssets.topSuppliedAssets;
  protocolData.topBorrowedAssets = topAssets.topBorrowedAssets;

  return protocolData;
}

export async function getTopAssets(
  params?: {
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<TopAssetsData>
): Promise<TopAssetsData> {
  const provider = params.test ? defaultTestProvider : null;
  const {
    abi,
    bytecode,
  } = require("@vmex/contracts/artifacts/contracts/analytics-utilities/GetAllAssetsData.sol/GetAllAssetsData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
  ]);

  let aggregatedSuppliedAssetData = {};
  let aggregatedBorrowedAssetData = {};

  data.map((assetData: AssetData) => {
    let asset = assetData.asset.toString();
    if (asset in aggregatedSuppliedAssetData) {
      aggregatedSuppliedAssetData[asset].totalSupplied += assetData.totalSupplied;
    } else {
      aggregatedSuppliedAssetData[asset] = {
        amount: assetData.totalSupplied,
        asset: asset
      };
    }

    if (asset in aggregatedBorrowedAssetData) {
      aggregatedBorrowedAssetData[asset].totalBorrowed.add(assetData.totalBorrowed);
    } else {
      aggregatedBorrowedAssetData[asset] = {
        amount: assetData.totalBorrowed,
        asset: asset
      };
    }
  });

  let supplied = Object.keys(aggregatedSuppliedAssetData)
    .map(function(key) {
      return aggregatedSuppliedAssetData[key];
    });
  let borrowed = Object.keys(aggregatedBorrowedAssetData)
    .map(function(key) {
      return aggregatedBorrowedAssetData[key];
    });

  supplied.sort(function(a: AssetBalance, b: AssetBalance) {
    return a.amount.gt(b.amount)
      ? -1
      : 1;
  });
  borrowed.sort(function(a: AssetBalance, b: AssetBalance) {
    return a.amount.gt(b.amount)
      ? -1
      : 1;
  });

  return {
    topSuppliedAssets: supplied,
    topBorrowedAssets: borrowed
  }
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
  ]);
  console.log("USER SUMMARY DATA IS", data)
  return data;
}

export async function getUserTrancheData(
  params: {
    tranche: string;
    user: string;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<UserTrancheData>
): Promise<UserTrancheData> {
  const provider = params.test ? defaultTestProvider : null;
  const {
    abi,
    bytecode,
  } = require("@vmex/contracts/artifacts/contracts/analytics-utilities/GetUserTrancheData.sol/GetUserTrancheData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.user,
    params.tranche,
  ]);

  console.log("USER TRANCHE DATA IS", data)
  return data;
}
