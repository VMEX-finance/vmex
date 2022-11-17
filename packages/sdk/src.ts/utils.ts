import { ethers } from "ethers";
import { deployments } from "./constants";
import _ from "lodash";
import ILendingPoolAddressesProvider from "@vmex/contracts/artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";
import AaveProtocolDataProvider from "@vmex/contracts/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json";
import IERC20 from "@vmex/contracts/artifacts/contracts/dependencies/openzeppelin/contracts/IERC20.sol/IERC20.json";
import IAToken from "@vmex/contracts/artifacts/contracts/interfaces/IAToken.sol/IAToken.json";
import ILendingPool from "@vmex/contracts/artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json";
import ILendingPoolConfigurator from "@vmex/contracts/artifacts/contracts/protocol/lendingPool/LendingPoolConfigurator.sol/LendingPoolConfigurator.json";
// import { LendingPoolConfiguratorFactory } from "@vmex/contracts/dist";

const defaultProvider = ethers.getDefaultProvider("http://localhost:8545");

/**
 * network agnostic function for getting the correct LendingPool address
 * @param signer
 * @param network
 * @param test
 */
export async function getLendingPoolImpl(
  signer: ethers.Signer,
  network: string,
  test?: boolean
) {
  let LPAddressProvider = new ethers.Contract(
    deployments.LendingPoolAddressesProvider[`${network}`].address,
    ILendingPoolAddressesProvider.abi,
    signer
  );
  let address = await LPAddressProvider.getLendingPool();
  let { abi } = ILendingPool;
  return new ethers.Contract(address, abi, signer);
}

/**
 * network agnostic function for getting the correct LendingPool address
 * @param signer
 * @param network
 * @param test
 */
 export async function getLendingPoolConfigurationImpl(
  // signer: ethers.Signer,
  network: string,
  test?: boolean
) {
  return new ethers.Contract(
    deployments.LendingPoolConfigurator[`${network || "mainnet"}`].address,
    ILendingPoolConfigurator.abi,
    defaultProvider
  );
}


/**
 * unsignedLendingPool
 * a modified lendingPoolImpl fn doesnt require a signer or network
 */
export async function getUnsignedLP(params?: {
  signer?: ethers.Signer;
  network?: string;
  test?: boolean;
}) {
  let lendingPool = new ethers.Contract(
    deployments.LendingPool[
      `${params && params.network ? params.network : "mainnet"}`
    ].address,
    ILendingPool.abi,
    defaultProvider
  );

  if (params.signer) lendingPool.connect(await params.signer);
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
    defaultProvider
  );
  if (params.signer) helperContract.connect(await params.signer);
  return helperContract;
}

export async function getAToken(params?: {
  address: string;
  signer?: ethers.Signer;
}) {
  let aToken = new ethers.Contract(
    params.address,
    IAToken.abi,
    defaultProvider
  );
  if (params.signer) aToken.connect(await params.signer);
  return aToken;
}

export async function getIErc20(params?: {
  address: string;
  signer?: ethers.Signer;
}) {
  let ercToken = new ethers.Contract(
    params.address,
    IERC20.abi,
    defaultProvider
  );
  if (params.signer) ercToken.connect(await params.signer);
  return ercToken;
}

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

//temp function
function getNetworkProvider(network) {
  return new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); //TODO implement
}

/**
 * utility function to query number of tranches present in lending pool
 * @param network
 * @returns BigNumber
 * by using an eth_call contract this can be done in one rpc call*
 */

export async function getTrancheNames(network?: string) {
  let provider =
    network == "localhost"
      ? new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
      : getNetworkProvider(network);
  let signer = new ethers.VoidSigner(ethers.constants.AddressZero, provider);
  const _lpConfiguratorProxy = new ethers.Contract(
    deployments.LendingPoolConfigurator[`${network || "mainnet"}`].address,
    ILendingPoolConfigurator.abi,
    signer
  );
  let trancheIds = (await _lpConfiguratorProxy.totalTranches()).toNumber();
  let x = [...Array(trancheIds).keys()];
  return Promise.all(
    x.map(async (x) => await _lpConfiguratorProxy.trancheNames(x))
  );
}

export async function totalTranches(network?: string) {
    let provider =
	network == "localhost"
	   ? new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
	   : getNetworkProvider(network);
    let signer = new ethers.VoidSigner(ethers.constants.AddressZero, provider);
    const _lpConfiguratorProxy = new ethers.Contract(
	deployments.LendingPoolConfigurator[`${network || "mainnet"}`].address,
	ILendingPoolConfigurator.abi,
	signer
   );
   return (await _lpConfiguratorProxy.totalTranches()).toNumber();
}

export async function lendingPoolPause(
  approvedSigner: ethers.Signer,
  setPause: boolean,
  network: string,
  tranche: number
) {
  let LPAddressProvider = new ethers.Contract(
    deployments.LendingPoolAddressesProvider[`${network}`].address,
    ILendingPoolAddressesProvider.abi,
    approvedSigner
  );
  if (
    (await approvedSigner.getAddress()) !==
    (await LPAddressProvider.getPoolAdmin(tranche))
  )
    throw new Error("signer must be pool admin");
  let lendingPool = await getLendingPoolImpl(approvedSigner, network);
  try {
    let _LendingPoolConfiguratorProxy = new ethers.Contract(
      deployments.LendingPoolConfigurator[`${network}`].address,
      ILendingPoolConfigurator.abi,
      approvedSigner
    );
    // let LendingPoolConfiguratorProxy = await LendingPoolConfiguratorFactory.connect(deployments.LendingPoolConfigurator[`${network}`].address, approvedSigner);
    await _LendingPoolConfiguratorProxy.setPoolPause(false, tranche);
    return await lendingPool.paused(tranche);
  } catch (error) {
    console.log(error);
    throw error;
    // throw new Error("Failed to set LendingPool Pause Status")
  }
}

export async function getUserSingleReserveData(
  signer: ethers.Signer,
  network: string,
  asset: string,
  tranche: number
) {
  let lendingPool = await getLendingPoolImpl(signer, network);
  return await lendingPool.getReserveData(asset, tranche);
}

export async function getLendingPoolReservesList(
  signer: ethers.Signer,
  network: string,
  tranche: number
) {
  let lendingPool = await getLendingPoolImpl(signer, network);
  return await lendingPool.getReservesList(tranche);
}

export async function getAssetData(
  signer: ethers.Signer,
  network: string,
  asset: string,
  tranche: number
) {
  let lendingPool = await getLendingPoolImpl(signer, network);
  return await lendingPool.getAssetData(asset, tranche);
}

export async function getReserveData(
  signer: ethers.Signer,
  network: string,
  asset: string,
  tranche: number
) {
  let lendingPool = await getLendingPoolImpl(signer, network);
  return await lendingPool.getReserveData(asset, tranche);
}
