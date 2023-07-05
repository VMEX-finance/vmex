import { ethers, BigNumber } from "ethers";
import _ from "lodash";
import {
  deployments,
  MAINNET_ASSET_MAPPINGS,
  OPTIMISM_ASSET_MAPPINGS,
  REVERSE_GOERLI_CUSTOM_ASSET_MAPPINGS,
  REVERSE_MAINNET_ASSET_MAPPINGS,
  REVERSE_OPTIMISM_ASSET_MAPPINGS,
  REVERSE_SEPOLIA_CUSTOM_ASSET_MAPPINGS,
} from "./constants";
import {
  getLendingPoolConfiguratorProxy,
  getIErc20Detailed,
  getProvider,
  getMintableERC20,
} from "./contract-getters";
import { decodeConstructorBytecode } from "./decode-bytecode";
import { PriceData } from "./interfaces";
import { CacheContainer } from "node-ts-cache";
import { MemoryStorage } from "node-ts-cache-storage-memory";

export const cache = new CacheContainer(new MemoryStorage());

function isMainnetFork(network: string): boolean {
  return network == "main" || network == "localhost";
}

// import { LendingPoolConfiguratorFactory } from "@vmexfinance/contracts/dist";
export function convertAddressToSymbol(asset: string, network?: string) {
  asset = asset.toLowerCase();
  if (!network) {
    // assume mainnet if network not give
    return REVERSE_MAINNET_ASSET_MAPPINGS.get(asset);
  }

  switch (network) {
    // goerli, optimism_goerli, sepolia will use our custom deployments
    case "goerli":
      return REVERSE_GOERLI_CUSTOM_ASSET_MAPPINGS.get(asset);
    case "sepolia":
      return REVERSE_SEPOLIA_CUSTOM_ASSET_MAPPINGS.get(asset);

    // forks and networks will use real addresses
    case "localhost":
    case "main":
      return REVERSE_MAINNET_ASSET_MAPPINGS.get(asset);
    case "optimism_localhost":
    case "optimism":
      return REVERSE_OPTIMISM_ASSET_MAPPINGS.get(asset);
  }

  throw Error(`Asset=${asset} not found on network ${network}`);
}

export function convertAddressListToSymbol(assets: string[], network?: string) {
  return assets.map((el) => convertAddressToSymbol(el, network));
}

export function convertSymbolToAddress(asset: string, network?: string) {
  if (!asset) {
    throw new Error("Convert symbol to address missing asset");
  }
  asset = asset.toUpperCase();
  if (!network) {
    // assume mainnet if network not give
    return MAINNET_ASSET_MAPPINGS.get(asset);
  }

  switch (network) {
    // goerli, optimism_goerli, sepolia will use our custom deployments
    case "goerli":
    case "sepolia":
      return deployments[asset][network].address;

    // forks and networks will use real addresses
    case "localhost":
    case "main":
      return MAINNET_ASSET_MAPPINGS.get(asset);
    case "optimism_localhost":
    case "optimism":
      return OPTIMISM_ASSET_MAPPINGS.get(asset);
  }

  throw Error(`Asset=${asset} not found on network ${network}`);
}

export function getContractAddress(contractName: string, network: string) {
  return deployments[contractName][network].address;
}

export function convertListSymbolToAddress(assets: string[], network?: string) {
  return assets.map((el) => convertSymbolToAddress(el, network));
}
export async function getAssetPrices(params?: {
  assets: string[];
  network?: string;
  test?: boolean;
  providerRpc?: string;
}): Promise<Map<string, PriceData>> {
  const cacheKey = "asset-prices";
  const cachedTotalMarkets = await cache.getItem<Map<string, PriceData>>(
    cacheKey
  );
  if (cachedTotalMarkets) {
    return cachedTotalMarkets;
  }
  const provider = getProvider(params.providerRpc, params.test);
  const {
    abi,
    bytecode,
  } = require("@vmexfinance/contracts/artifacts/contracts/analytics-utilities/asset/GetAllAssetPrices.sol/GetAllAssetPrices.json");
  let _addressProvider =
    deployments.LendingPoolAddressesProvider[params.network || "main"].address;

  const assets = convertListSymbolToAddress(
    params.assets,
    params.network
  ).filter((el) => el !== undefined);

  let [data] = await decodeConstructorBytecode(abi, bytecode, provider, [
    _addressProvider,
    assets,
  ]);

  let assetPrices: Map<string, PriceData> = new Map();

  assets.map((asset, idx) => {
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
  providerRpc?: string
) => {
  const token = await getIErc20Detailed(tokenAddress, providerRpc, test);
  let decimals = (await token.decimals()).toString();

  return ethers.utils.parseUnits(amount, decimals);
};

export async function mintTokens(params: {
  token: string;
  signer: ethers.Signer;
  network: string;
  test?: boolean;
  providerRpc?: string;
}) {
  const token = await getMintableERC20({
    tokenSymbol: params.token,
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  return await token.mint(
    ethers.utils.parseUnits("1000000.0", await token.decimals())
  );
}

export const chunk = <T>(arr: Array<T>, chunkSize: number): Array<Array<T>> => {
  return arr.reduce(
    (prevVal: any, currVal: any, currIndx: number, array: Array<T>) =>
      !(currIndx % chunkSize)
        ? prevVal.concat([array.slice(currIndx, currIndx + chunkSize)])
        : prevVal,
    []
  );
};

export const increaseTime = async (provider, secondsToIncrease: number) => {
  await provider.send("evm_increaseTime", [secondsToIncrease]);
  await provider.send("evm_mine", []);
};

export const isLocalhost = (network) => {
  return network == "localhost" || network == "optimism_localhost";
};
