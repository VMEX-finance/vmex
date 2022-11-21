import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { deployments } from "./constants";
import _ from "lodash";
import { getLendingPoolConfiguratorProxy } from "./contract-getters";
import { UserSummaryData } from "./interfaces";
import { decodeConstructorBytecode } from "./decode-bytecode";
// import { LendingPoolConfiguratorFactory } from "@vmex/contracts/dist";

/**
 *
 */
export async function approveUnderlying(
  signer: ethers.Signer,
  amount: any,
  underlying: string,
  spender: string
) {
  let _underlying = new ethers.Contract(
    underlying,
    [
      "function approve(address spender, uint256 value) external returns (bool success)",
    ],
    signer
  );
  return await _underlying.connect(signer).approve(spender, amount);
}

export function generateFinalUserSummary(data: UserSummaryData): UserSummaryData {
  let finalData : UserSummaryData = {
    totalCollateralETH : data.totalCollateralETH,
    totalDebtETH : data.totalDebtETH,
    availableBorrowsETH : data.availableBorrowsETH,
    currentLiquidityThreshold : data.currentLiquidityThreshold,
    ltv : data.ltv,
    healthFactor : data.healthFactor,
    suppliedAssetData: [],
    borrowedAssetData: [],
  };

  for (let i = 0; i<data.suppliedAssetData.length; i++) {
    if (data.suppliedAssetData[i].amount.gt(0)) {
      finalData.suppliedAssetData.push(data.suppliedAssetData[i]);
    }
  }
  for (let i = 0; i<data.borrowedAssetData.length; i++) {
    if (data.borrowedAssetData[i].amount.gt(0)) {
      finalData.borrowedAssetData.push(data.borrowedAssetData[i]);
    }
  }

  return finalData;
}

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


// // Convert a hex string to a byte array
// export function hexToBytes(hex) {
//   for (var bytes = [], c = 0; c < hex.length; c += 2)
//     bytes.push(parseInt(hex.substr(c, 2), 16));
//   return bytes;
// }

// export function isUsingAsCollateral(
//   userConfig: ethers.BigNumber,
//   reserveIndex: number
// ): boolean {
//   if (reserveIndex >= 128) {
//     throw new Error("Invalid reserve index");
//   }
//   const userConfigDataBytes = hexToBytes(userConfig.toHexString());
//   const bitToCheck = reserveIndex * 2 + 1;
//   const distFromBeginning = userConfigDataBytes.length - bitToCheck - 1;
//   // equation: data >> (reserveIndex * 2 + 1) & 1 != 0
//   return userConfigDataBytes[distFromBeginning] != 0;
// }


