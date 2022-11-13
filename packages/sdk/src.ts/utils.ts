import { ethers } from "ethers";
import { deployments } from "./constants";
import _ from "lodash";
import ILendingPoolConfigurator from "@vmex/contracts/artifacts/contracts/protocol/lendingPool/LendingPoolConfigurator.sol/LendingPoolConfigurator.json";
import { getLendingPool } from "./contract-getters";
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

// Convert a hex string to a byte array
export function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

export function isUsingAsCollateral(
  userConfig: ethers.BigNumber,
  reserveIndex: number
): boolean {
  if (reserveIndex >= 128) {
    throw new Error("Invalid reserve index");
  }
  const userConfigDataBytes = hexToBytes(userConfig.toHexString());
  const bitToCheck = reserveIndex * 2 + 1;
  const distFromBeginning = userConfigDataBytes.length - bitToCheck - 1;
  // equation: data >> (reserveIndex * 2 + 1) & 1 != 0
  return userConfigDataBytes[distFromBeginning] != 0;
}

// export async function getUserSingleReserveData(
//   signer: ethers.Signer,
//   network: string,
//   asset: string,
//   tranche: number
// ) {
//   let lendingPool = await getLendingPool({
//     signer: signer,
//     network: network,
//   });
//   return await lendingPool.getReserveData(asset, tranche);
// }

// export async function getLendingPoolReservesList(
//   signer: ethers.Signer,
//   network: string,
//   tranche: number
// ) {
//   let lendingPool = await getLendingPool({
//     signer: signer,
//     network: network,
//   });
//   return await lendingPool.getReservesList(tranche);
// }

// export async function getAssetData(
//   signer: ethers.Signer,
//   network: string,
//   asset: string,
//   tranche: number
// ) {
//   let lendingPool = await getLendingPool({
//     signer: signer,
//     network: network,
//   });
//   return await lendingPool.getAssetData(asset, tranche);
// }

// export async function getReserveData(
//   signer: ethers.Signer,
//   network: string,
//   asset: string,
//   tranche: number
// ) {
//   let lendingPool = await getLendingPool({
//     signer: signer,
//     network: network,
//   });
//   return await lendingPool.getReserveData(asset, tranche);
// }
