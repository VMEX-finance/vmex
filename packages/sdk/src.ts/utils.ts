import { ethers, BigNumber } from "ethers";
import _ from "lodash";
import { deployments, MAINNET_ASSET_MAPPINGS } from "./constants";
import {
  getLendingPoolConfiguratorProxy,
  getIErc20Detailed,
  getProvider,
} from "./contract-getters";
import { decodeConstructorBytecode } from "./decode-bytecode";
import { PriceData } from "./interfaces";
import { CacheContainer } from "node-ts-cache";
import { MemoryStorage } from "node-ts-cache-storage-memory";

export const cache = new CacheContainer(new MemoryStorage());

// import { LendingPoolConfiguratorFactory } from "@vmexfinance/contracts/dist";
export function convertSymbolToAddress(asset: string, network?: string){
  return network && 
    network!="main" ? deployments[asset.toUpperCase()][network].address
    : MAINNET_ASSET_MAPPINGS[asset]
}
export function convertListSymbolToAddress(assets: string[], network?: string){
  return assets.map(
    (el)=> convertSymbolToAddress(el,network)
  )
}
export async function getAssetPrices(
  params?: {
    assets: string[];
    network?: string;
    test?: boolean;
    providerRpc?: string;
  }
): Promise<Map<string, PriceData>> {
  const cacheKey = "asset-prices";
  const cachedTotalMarkets = await cache.getItem<Map<string, PriceData>>(cacheKey);
  if (cachedTotalMarkets) {
    return cachedTotalMarkets;
  }
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("@vmexfinance/contracts/artifacts/contracts/analytics-utilities/asset/GetAllAssetPrices.sol/GetAllAssetPrices.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "main"]
      .address;
  
  const assets =  convertListSymbolToAddress(params.assets, params.network);
  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    assets
  ]);

  let assetPrices: Map<string, PriceData> = new Map();

  params.assets.map((asset, idx) => {
    assetPrices.set(asset, data[idx]);
  });

  await cache.setItem(cacheKey, assetPrices, { ttl: 60 });

  return assetPrices;
}

/**
 *
 */
export async function approveUnderlyingIfFirstInteraction(
  signer: ethers.Signer,
  underlying: string,
  spender: string
) {
  let _underlying = new ethers.Contract(
    underlying,
    [
      "function approve(address spender, uint256 value) external returns (bool success)",
      "function allowance(address owner, address spender) external view returns (uint256)",
    ],
    signer
  );
  let allowance = await _underlying
    .connect(signer)
    .allowance(await signer.getAddress(), spender);
  if (allowance.eq(BigNumber.from("0"))) {
    return await _underlying
      .connect(signer)
      .approve(
        spender,
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      ); //approves uint256 max
  }
}

export const convertToCurrencyDecimals = async (
  tokenAddress: string,
  amount: string,
  test?: boolean,
  providerRpc?: string,
) => {
  const token = await getIErc20Detailed(tokenAddress, providerRpc, test);
  let decimals = (await token.decimals()).toString();

  return ethers.utils.parseUnits(amount, decimals);
};
