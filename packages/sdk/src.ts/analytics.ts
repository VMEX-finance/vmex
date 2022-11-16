import { deployments } from "./constants";
import "@vmex/contracts/artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json";
// import { getAaveProtocolDataProvider, getAToken, getIErc20 } from "@vmex/contracts/helpers/contracts-getters";
import { BigNumber, ethers } from "ethers";
import {
  getLendingPoolImpl,
  getUnsignedLP,
  approveUnderlying,
  getAaveProtocolDataProvider,
  getAToken,
  getIErc20,
  getLendingPoolConfigurationImpl
} from "./utils";


/**
 * PROTOCOL LEVEL ANALYTICS
 */

/**
 * getTVL()
 * @params { network: string, test: bool }
 * @returns uint(aTokens, underlying)
 * returns a tuple containing the sum of the balances of all aTokens in all pools
 */
export async function getTVL(
  params: {
    numTranches: number;
    network?: string;
  },
  callback?: () => Promise<any>
) {
  var tvl = BigNumber.from(0);
  for (var i = 0; i < params.numTranches; i++) {
    const trancheTvl = await getTrancheTVL({
        tranche: i,
        network: params.network
    });
    tvl = tvl.add(trancheTvl);
  }

  return tvl;
}

/**
 * TRANCHE LEVEL ANALYTICS
 */


export async function getTrancheTVL(
  params: {
    tranche: number;
    network?: string;
  },
  callback?: () => Promise<any>
) {
  // get all vTokens associated with the given tranche
  const [allvTokens, reserveAddresses] = await getTrancheTokens({
    tranche: params.tranche,
    network: params.network
  });

  var tvl = BigNumber.from(0);
  for (let i = 0; i < allvTokens.length; i++) {
    const underlying = await getIErc20({
        address: reserveAddresses[i]
    });
    const bal = await underlying.balanceOf(allvTokens[i]);
    tvl = tvl.add(bal);
  }

  return tvl;
}

export async function getTrancheTokens(
  params: {
    tranche: number;
    network?: string;
  },
  callback?: () => Promise<any>
) {
  const helperContract = await getAaveProtocolDataProvider({
    network: params.network
  });

  const allvTokens = await helperContract.getAllATokens(
    params.tranche.toString()
  );

  let vTokenAddresses = [];
  allvTokens.map((vTokenData) => {
    vTokenAddresses.push(vTokenData.tokenAddress);
  });

  let underlyingAddresses = [];
  for (const vTokenAddress of vTokenAddresses) {
    const vToken = await getAToken({
        address: vTokenAddress
    });
    const underlying = await vToken.UNDERLYING_ASSET_ADDRESS();
    underlyingAddresses.push(underlying);
  }

  return [vTokenAddresses, underlyingAddresses];
}

export async function getTotalTranches(params: {
    network: string;
}) {
  let configurator = await getLendingPoolConfigurationImpl(params.network);
    return await configurator.totalTranches();
    //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed).
}

/**
 * USER LEVEL ANALYTICS
 */

/**
 * userAggregatedTrancheData
 * @params { signer: ethers.Signer, tranche: number, network?: string }
 * @returns Promise {
 *  totalCollateralETH: BigNumber
 *  totalDebtETH: BigNumber
 *  availableBorrowsETH: BigNumber
 *  currentLiquidationThreshold: BigNumber
 *  ltv: BigNumber
 *  healthFactor: BigNumber
 * }
 */
export async function userAggregatedTrancheData(
  params: {
    signer: ethers.Signer;
    tranche: number;
    network?: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  const lendingPool = await getLendingPoolImpl(
    params.signer,
    params.network || "mainnet"
  );
  return await lendingPool.getUserAccountData(
    await params.signer.getAddress(),
    params.tranche, false
  );
}

/**
 * userTrancheBalances
 * @params { signer: ethers.Signer, tranche: number, network?: string }
 * @returns tuple(address, uint256)[];
 */
export async function userTrancheBalances(
  params: {
    signer: ethers.Signer;
    tranche: number;
    network?: string;
  },
  callback?: () => Promise<any>
) {
  const provider =
    deployments.LendingPoolAddressesProvider[`${params.network || "localhost"}`]
      .address;
  const _balanceProviderAddress =
    deployments.WalletBalanceProvider[`${params.network || "localhost"}`]
      .address;
  const {
    abi,
  } = require("@vmex/contracts/artifacts/contracts/misc/WalletBalanceProvider.sol/WalletBalanceProvider.json");

  const balanceProvider = new ethers.Contract(
    _balanceProviderAddress,
    abi,
    params.signer
  );
  return await balanceProvider.getUserWalletBalances(
    provider,
    await params.signer.getAddress(),
    params.tranche
  );
}

/**
 * getUserReserveConfig
 * @params { signer: ethers.Signer, underlying: address, network?: string }
 */

// export async function totalTranches(params?: {
//     network: string;
//     test: boolean;
// }, callback?: () => Promise<BigNumber>) {
//     let configurator = await getLendingPoolConfiguratorProxy();
//     return configurator.totalTranches;
//     //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed).
// }

// export async function totalMarkets(params?: {
//     network: string;
//     test: boolean;
// }, callback?: () => Promise<BigNumber>) {
//     let configurator = await getLendingPoolConfiguratorProxy();
//     return configurator.totalTranches;
//     //sum of atoken amounts in all pools (this will reflect total supplied)? Or sum of actual underlying amounts (which will be total supplied - total borrowed).
// }

//tranche level

// //user level (querying by wallet address)
//  export async function userInfo(params: {
//     underlying: string;
//     trancheId: string;
//     signer: ethers.Signer; //assume signer is also address that you want
//     network?: string;
//     test?: boolean;
// }, callback?: () => Promise<UserReserveData>) {
//     let lendingPool = await getLendingPool();
//     let helpersContract = await getAaveProtocolDataProvider();

//     return getUserData(lendingPool, helpersContract, params.underlying, params.trancheId, await params.signer.getAddress() );
// }
