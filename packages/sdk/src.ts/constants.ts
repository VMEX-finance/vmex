import AaveConfig from "@vmexfinance/contracts/dist/markets/aave"
import OptimismConfig from "@vmexfinance/contracts/dist/markets/optimism"
import BaseConfig from "@vmexfinance/contracts/dist/markets/base"
import Deployments from "./deployed-contracts.json";
export const deployments = Deployments;

export const MAX_UINT_AMOUNT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";


export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const formatNetworkMappings = (
  marketAssets: Map<string, string>,
): [Map<string, string>, Map<string, string>] => {
  const assetToAddress = new Map;
  const addressToAsset = new Map;
  Object.keys(marketAssets).forEach((asset) => {
    assetToAddress.set(asset.toUpperCase(), marketAssets[asset]);
    addressToAsset.set(marketAssets[asset].toLowerCase(), asset);
  })
  return [assetToAddress, addressToAsset];
};

export const [MAINNET_ASSET_MAPPINGS, REVERSE_MAINNET_ASSET_MAPPINGS] =
  formatNetworkMappings(AaveConfig.ReserveAssets['main']);

export const [OPTIMISM_ASSET_MAPPINGS, REVERSE_OPTIMISM_ASSET_MAPPINGS] =
  formatNetworkMappings(OptimismConfig.ReserveAssets['optimism']);

export const [BASE_ASSET_MAPPINGS, REVERSE_BASE_ASSET_MAPPINGS] =
  formatNetworkMappings(BaseConfig.ReserveAssets['base']);

export const flipAndLowerCase = (
  data: Map<string, string>
): Map<string, string> =>
  new Map(Array.from(data, (entry) => [entry[1].toLowerCase(), entry[0]]));

type Token<T> = {
  [k in keyof T]?: {
    address: string;
    decimals: string;
  };
};

export const findCustomTokenAddresses = (
  symbols: string[],
  network: "goerli" | "sepolia"
): Map<string, string> => {
  const addressesMap = new Map();
  symbols.forEach((symbol) => {
    if (!deployments[symbol] || !deployments[symbol][network]) return;
    addressesMap.set(symbol.toUpperCase(), deployments[symbol][network].address);
  });
  return addressesMap;
};

// NOTE: we deploy common tokens on testnets
// Symbol => Address mapping of custom deployed tokens
export const GOERLI_CUSTOM_ASSET_MAPPINGS = findCustomTokenAddresses(
  [...MAINNET_ASSET_MAPPINGS.keys()],
  "goerli"
);
export const REVERSE_GOERLI_CUSTOM_ASSET_MAPPINGS = flipAndLowerCase(
  GOERLI_CUSTOM_ASSET_MAPPINGS
);
export const SEPOLIA_CUSTOM_ASSET_MAPPINGS = findCustomTokenAddresses(
  [...MAINNET_ASSET_MAPPINGS.keys()],
  "sepolia"
);
export const REVERSE_SEPOLIA_CUSTOM_ASSET_MAPPINGS = flipAndLowerCase(
  SEPOLIA_CUSTOM_ASSET_MAPPINGS
);

