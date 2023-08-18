import { deployments } from "./constants";
import { BigNumber } from "ethers";
import { getLendingPoolConfiguratorProxy, getProvider } from "./contract-getters";
import {
  MarketData,
  ProtocolData,
  TopAssetsData,
  TrancheData,
  UserSummaryData,
  UserTrancheData,
  AssetBalance,
  UserWalletData,
  SuppliedAssetData,
  BorrowedAssetData,
} from "./interfaces";
import { decodeConstructorBytecode } from "./decode-bytecode";
import { cache, convertAddressToSymbol } from "./utils";

/**
 * PROTOCOL LEVEL ANALYTICS
 */

export async function getTotalTranches(
  params?: {
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<number>
) {
  let configurator = await getLendingPoolConfiguratorProxy(params);
  const totalTranches = (await configurator.totalTranches()).toNumber();
  return totalTranches;
}

export async function getTotalMarkets(
  params?: {
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<number>
) {
  const cacheKey = "total-markets";
  const cachedTotalMarkets = await cache.getItem<number>(cacheKey);
  if (cachedTotalMarkets) {
    return cachedTotalMarkets;
  }
  await getAllMarketsData(params);
  return await cache.getItem<number>(cacheKey);
}

export async function getAllMarketsData(
  params: {
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<MarketData[]>
): Promise<MarketData[]> {

  const numTranches = await getTotalTranches(params);
  const allMarketsData: MarketData[] = [];
  for (let i = 0; i < numTranches; i++) {
    allMarketsData.push(
      ...(await getTrancheMarketsData({
        tranche: i,
        network: params.network,
        test: params.test,
      }))
    );
  }

  // await cache.setItem("total-markets", allMarketsData.length, { ttl: 60 });

  return allMarketsData;
}

export async function getProtocolData(
  params?: {
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<ProtocolData>
): Promise<ProtocolData> {
  let allTrancheData = await getAllTrancheData(params);

  let protocolData: ProtocolData = {
    tvl: BigNumber.from(0),
    totalReserves: BigNumber.from(0),
    totalSupplied: BigNumber.from(0),
    totalBorrowed: BigNumber.from(0),
    numLenders: 0,
    numBorrowers: 0,
    numTranches: allTrancheData.length,
    numMarkets: 0,
    topTranches: [],
    topSuppliedAssets: [],
    topBorrowedAssets: [],
  };

  allTrancheData.map((data: TrancheData) => {
    protocolData.tvl = protocolData.tvl.add(data.tvl);
    protocolData.totalReserves = protocolData.totalReserves.add(
      data.availableLiquidity
    );
    protocolData.totalSupplied = protocolData.totalSupplied.add(
      data.totalSupplied
    );
    protocolData.totalBorrowed = protocolData.totalBorrowed.add(
      data.totalBorrowed
    );
    protocolData.numMarkets += data.assets.length;
  });

  let topTranches = [...allTrancheData].sort((a, b) => {
    return a.totalSupplied
      .add(a.totalBorrowed)
      .gt(b.totalSupplied.add(b.totalBorrowed))
      ? -1
      : 1;
  });

  protocolData.topTranches = topTranches.slice(
    0,
    Math.min(5, topTranches.length)
  );

  try {
    let topAssets = await getTopAssets(params);
    protocolData.topSuppliedAssets = topAssets.topSuppliedAssets;
    protocolData.topBorrowedAssets = topAssets.topBorrowedAssets;
  } catch (e) {
    console.log("UNABLE TO GET TOP SUPPLIED AND BORROWED DATA", e);
  }

  return protocolData;
}

export async function getTopAssets(
  params?: {
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<TopAssetsData>
): Promise<TopAssetsData> {
  let data = await getAllMarketsData(params);
  console.log("done withe get all markets");

  let aggregatedSuppliedAssetData = {};
  let aggregatedBorrowedAssetData = {};

  data.map((assetData: MarketData) => {
    let asset = assetData.asset.toString();
    if (asset in aggregatedSuppliedAssetData) {
      aggregatedSuppliedAssetData[asset].totalSupplied +=
        assetData.totalSupplied;
    } else {
      aggregatedSuppliedAssetData[asset] = {
        amount: assetData.totalSupplied,
        asset: asset,
      };
    }

    if (asset in aggregatedBorrowedAssetData) {
      aggregatedBorrowedAssetData[asset].amount = aggregatedBorrowedAssetData[
        asset
      ].amount.add(assetData.totalBorrowed);
    } else {
      aggregatedBorrowedAssetData[asset] = {
        amount: assetData.totalBorrowed,
        asset: asset,
      };
    }
  });

  let supplied = Object.keys(aggregatedSuppliedAssetData).map(function (key) {
    return aggregatedSuppliedAssetData[key];
  });
  let borrowed = Object.keys(aggregatedBorrowedAssetData).map(function (key) {
    return aggregatedBorrowedAssetData[key];
  });

  supplied.sort(function (a: AssetBalance, b: AssetBalance) {
    return a.amount.gt(b.amount) ? -1 : 1;
  });
  borrowed.sort(function (a: AssetBalance, b: AssetBalance) {
    return a.amount.gt(b.amount) ? -1 : 1;
  });

  return {
    topSuppliedAssets: supplied,
    topBorrowedAssets: borrowed,
  };
}

/**
 * TRANCHE LEVEL ANALYTICS
 */

export async function getTrancheMarketsData(
  params: {
    tranche: number;
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<MarketData[]>
): Promise<MarketData[]> {
  const cacheKey = "markets-" + params.tranche;
  const cachedMarketsData = await cache.getItem<MarketData[]>(cacheKey);
  if (cachedMarketsData) {
    // found in cache!
    console.log("CACHE HIT! for tranche", params.tranche);
    return cachedMarketsData;
  }

  // not in cache (expired)
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("./artifacts/contracts/analytics-utilities/asset/GetAllTrancheAssetsData.sol/GetAllTrancheAssetsData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.tranche,
  ]);

  // ttl of 60 seconds
  console.log("NO CACHE HIT, SETTING CACHE for tranche", params.tranche);
  await cache.setItem(cacheKey, data, { ttl: 60 });
  return data;
}

export async function getAllTrancheData(
  params: {
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<TrancheData[]>
): Promise<TrancheData[]> {
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("./artifacts/contracts/analytics-utilities/tranche/GetAllTrancheData.sol/GetAllTrancheData.json");
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
    providerRpc?: string;
  },
  callback?: () => Promise<TrancheData>
): Promise<TrancheData> {
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("./artifacts/contracts/analytics-utilities/tranche/GetTrancheData.sol/GetTrancheData.json");
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
    providerRpc?: string;
  },
  callback?: () => Promise<any>
): Promise<MarketData> {
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("./artifacts/contracts/analytics-utilities/asset/GetTrancheAssetData.sol/GetTrancheAssetData.json");
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
    providerRpc?: string;
  },
  callback?: () => Promise<UserSummaryData>
): Promise<UserSummaryData> {
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("./artifacts/contracts/analytics-utilities/user/GetUserSummaryData.sol/GetUserSummaryData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.user,
  ]);
  return data;
}

export async function getUserTrancheData(
  params: {
    tranche: string;
    user: string;
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<UserTrancheData>
): Promise<UserTrancheData> {
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("./artifacts/contracts/analytics-utilities/user/GetUserTrancheData.sol/GetUserTrancheData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.user,
    params.tranche,
  ]);

  return data;
}

export async function getUserWalletData(
  params: {
    user: string;
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<UserWalletData[]>
): Promise<UserWalletData[]> {
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("../contracts/artifacts/contracts/analytics-utilities/user/GetUserWalletData.sol/GetUserWalletData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.user,
  ]);

  return data;
}