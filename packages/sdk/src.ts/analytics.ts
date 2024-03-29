import { deployments, ZERO_ADDRESS } from "./constants";
import { BigNumber } from "ethers";
import {
  getLendingPoolConfiguratorProxy,
  getProvider,
} from "./contract-getters";
import {
  ReserveSummary,
  UserSummaryData,
  UserTrancheData,
  UserWalletData,
} from "./interfaces";
import { decodeConstructorBytecode } from "./decode-bytecode";
import { cache, getDecimalBase } from "./utils";

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

// export async function getTotalMarkets(
//   params?: {
//     network?: string;
//     test?: boolean;
//     providerRpc?: string;
//   },
//   callback?: () => Promise<number>
// ) {
//   const cacheKey = "total-markets";
//   const cachedTotalMarkets = await cache.getItem<number>(cacheKey);
//   if (cachedTotalMarkets) {
//     return cachedTotalMarkets;
//   }
//   await getAllMarketsData(params);
//   return await cache.getItem<number>(cacheKey);
// }

export async function getAllMarketsData(
  params: {
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<ReserveSummary[]>
): Promise<ReserveSummary[]> {
  const numTranches = await getTotalTranches(params);
  const allMarketsData: ReserveSummary[] = [];
  for (let i = 0; i < numTranches; i++) {
    allMarketsData.push(
      ...(await getTrancheAllMarketsData({
        tranche: i,
        network: params.network,
        test: params.test,
        providerRpc: params.providerRpc,
      }))
    );
  }

  // await cache.setItem("total-markets", allMarketsData.length, { ttl: 60 });

  return allMarketsData;
}

// export async function getProtocolData(
//   params?: {
//     network?: string;
//     test?: boolean;
//     providerRpc?: string;
//   },
//   callback?: () => Promise<ProtocolData>
// ): Promise<ProtocolData> {
//   let allTrancheData = await getAllTrancheData(params);

//   let protocolData: ProtocolData = {
//     tvl: BigNumber.from(0),
//     totalReserves: BigNumber.from(0),
//     totalSupplied: BigNumber.from(0),
//     totalBorrowed: BigNumber.from(0),
//     numLenders: 0,
//     numBorrowers: 0,
//     numTranches: allTrancheData.length,
//     numMarkets: 0,
//     topTranches: [],
//     topSuppliedAssets: [],
//     topBorrowedAssets: [],
//   };

//   allTrancheData.map((data: TrancheData) => {
//     protocolData.tvl = protocolData.tvl.add(data.tvl);
//     protocolData.totalReserves = protocolData.totalReserves.add(
//       data.availableLiquidity
//     );
//     protocolData.totalSupplied = protocolData.totalSupplied.add(
//       data.totalSupplied
//     );
//     protocolData.totalBorrowed = protocolData.totalBorrowed.add(
//       data.totalBorrowed
//     );
//     protocolData.numMarkets += data.assets.length;
//   });

//   let topTranches = [...allTrancheData].sort((a, b) => {
//     return a.totalSupplied
//       .add(a.totalBorrowed)
//       .gt(b.totalSupplied.add(b.totalBorrowed))
//       ? -1
//       : 1;
//   });

//   protocolData.topTranches = topTranches.slice(
//     0,
//     Math.min(5, topTranches.length)
//   );

//   try {
//     let topAssets = await getTopAssets(params);
//     protocolData.topSuppliedAssets = topAssets.topSuppliedAssets;
//     protocolData.topBorrowedAssets = topAssets.topBorrowedAssets;
//   } catch (e) {
//     console.log("UNABLE TO GET TOP SUPPLIED AND BORROWED DATA", e);
//   }

//   return protocolData;
// }

// export async function getTopAssets(
//   params?: {
//     network?: string;
//     test?: boolean;
//   },
//   callback?: () => Promise<TopAssetsData>
// ): Promise<TopAssetsData> {
//   let data = await getAllMarketsData(params);
//   console.log("done withe get all markets");

//   let aggregatedSuppliedAssetData = {};
//   let aggregatedBorrowedAssetData = {};

//   data.map((assetData: ReserveSummary) => {
//     let asset = assetData.asset.toString();
//     if (asset in aggregatedSuppliedAssetData) {
//       aggregatedSuppliedAssetData[asset].totalSupplied +=
//         assetData.totalSupplied;
//     } else {
//       aggregatedSuppliedAssetData[asset] = {
//         amount: assetData.totalSupplied,
//         asset: asset,
//       };
//     }

//     if (asset in aggregatedBorrowedAssetData) {
//       aggregatedBorrowedAssetData[asset].amount = aggregatedBorrowedAssetData[
//         asset
//       ].amount.add(assetData.totalBorrowed);
//     } else {
//       aggregatedBorrowedAssetData[asset] = {
//         amount: assetData.totalBorrowed,
//         asset: asset,
//       };
//     }
//   });

//   let supplied = Object.keys(aggregatedSuppliedAssetData).map(function (key) {
//     return aggregatedSuppliedAssetData[key];
//   });
//   let borrowed = Object.keys(aggregatedBorrowedAssetData).map(function (key) {
//     return aggregatedBorrowedAssetData[key];
//   });

//   supplied.sort(function (a: AssetBalance, b: AssetBalance) {
//     return a.amount.gt(b.amount) ? -1 : 1;
//   });
//   borrowed.sort(function (a: AssetBalance, b: AssetBalance) {
//     return a.amount.gt(b.amount) ? -1 : 1;
//   });

//   return {
//     topSuppliedAssets: supplied,
//     topBorrowedAssets: borrowed,
//   };
// }

/**
 * TRANCHE LEVEL ANALYTICS
 */

export async function getTrancheAllMarketsData(
  params: {
    tranche: number;
    network?: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<ReserveSummary[]>
): Promise<ReserveSummary[]> {
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("@vmexfinance/contracts/artifacts/contracts/analytics-utilities/asset/GetAllTrancheReserveData.sol/GetAllTrancheReserveData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  let allData = [];
  let paginatedData = [];
  let pagination = 0;

  do {
    [paginatedData] = await decodeConstructorBytecode(abi, bytecode, provider, [
      _addressProvider,
      params.tranche,
      pagination++,
    ]);
    allData.push(...paginatedData);
  } while (paginatedData.length == 10);

  return allData;
}

// export async function getAllTrancheData(
//   params: {
//     network?: string;
//     test?: boolean;
//     providerRpc?: string;
//   },
//   callback?: () => Promise<TrancheData[]>
// ): Promise<TrancheData[]> {
//   const provider = getProvider(params.providerRpc, params.test);
//   const {
//     abi,
//     bytecode,
//   } = require("@vmexfinance/contracts/artifacts/contracts/analytics-utilities/tranche/GetAllTrancheData.sol/GetAllTrancheData.json");
//   let _addressProvider =
//     deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
//       .address;
//   let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
//     _addressProvider,
//   ]);

//   return data;
// }

// export async function getTrancheData(
//   params: {
//     tranche: string;
//     network?: string;
//     test?: boolean;
//     providerRpc?: string;
//   },
//   callback?: () => Promise<TrancheData>
// ): Promise<TrancheData> {
//   const provider = getProvider(params.providerRpc, params.test);
//   const {
//     abi,
//     bytecode,
//   } = require("@vmexfinance/contracts/artifacts/contracts/analytics-utilities/tranche/GetTrancheData.sol/GetTrancheData.json");
//   let _addressProvider =
//     deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
//       .address;
//   let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
//     _addressProvider,
//     params.tranche,
//   ]);

//   return data;
// }

/**
 * ASSET LEVEL ANALYTICS
 */

// export async function getTrancheAssetData(
//   params: {
//     asset: string;
//     tranche: string;
//     network?: string;
//     test?: boolean;
//     providerRpc?: string;
//   },
//   callback?: () => Promise<any>
// ): Promise<ReserveSummary> {
//   const provider = getProvider(params.providerRpc, params.test);
//   const {
//     abi,
//     bytecode,
//   } = require("@vmexfinance/contracts/artifacts/contracts/analytics-utilities/asset/GetTrancheReserveData.sol/GetTrancheReserveData.json");
//   let _addressProvider =
//     deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
//       .address;
//   let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
//     _addressProvider,
//     params.asset,
//     params.tranche,
//   ]);

//   return data;
// }

/**
 * USER LEVEL ANALYTICS, these are the only functions used by the FE
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
  } = require("@vmexfinance/contracts/artifacts/contracts/analytics-utilities/user/GetUserSummaryData.sol/GetUserSummaryData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  const base = getDecimalBase(params.network);
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.user,
    base.ETHBase,
    base.chainlinkConverter,
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
  } = require("@vmexfinance/contracts/artifacts/contracts/analytics-utilities/user/GetUserTrancheData.sol/GetUserTrancheData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  const base = getDecimalBase(params.network);
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.user,
    params.tranche,
    base.ETHBase,
    base.chainlinkConverter,
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
  } = require("@vmexfinance/contracts/artifacts/contracts/analytics-utilities/user/GetUserWalletData.sol/GetUserWalletData.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "mainnet"]
      .address;
  const base = getDecimalBase(params.network);
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    params.user,
    base.ETHBase,
    base.chainlinkConverter,
  ]);

  return data;
}
