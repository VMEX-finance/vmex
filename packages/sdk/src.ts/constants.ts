import AaveConfig from "@vmexfinance/contracts/dist/markets/aave";
import OptimismConfig from "@vmexfinance/contracts/dist/markets/optimism";
import BaseConfig from "@vmexfinance/contracts/dist/markets/base";
import ArbitrumConfig from "@vmexfinance/contracts/dist/markets/arbitrum";
import Deployments from "./deployed-contracts.json";
export const deployments = Deployments;

export const MAX_UINT_AMOUNT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const formatNetworkMappings = (
  marketAssets: Map<string, string>
): [Map<string, string>, Map<string, string>] => {
  const assetToAddress = new Map();
  const addressToAsset = new Map();
  Object.keys(marketAssets).forEach((asset) => {
    assetToAddress.set(asset.toUpperCase(), marketAssets[asset]);
    addressToAsset.set(marketAssets[asset].toLowerCase(), asset);
  });
  return [assetToAddress, addressToAsset];
};

export const [MAINNET_ASSET_MAPPINGS, REVERSE_MAINNET_ASSET_MAPPINGS] =
  formatNetworkMappings(AaveConfig.ReserveAssets["main"]);

export const [OPTIMISM_ASSET_MAPPINGS, REVERSE_OPTIMISM_ASSET_MAPPINGS] =
  formatNetworkMappings(OptimismConfig.ReserveAssets["optimism"]);

export const [BASE_ASSET_MAPPINGS, REVERSE_BASE_ASSET_MAPPINGS] =
  formatNetworkMappings(BaseConfig.ReserveAssets["base"]);

export const [ARBITRUM_ASSET_MAPPINGS, REVERSE_ARBITRUM_ASSET_MAPPINGS] =
  formatNetworkMappings(ArbitrumConfig.ReserveAssets["arbitrum"]);

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
    addressesMap.set(
      symbol.toUpperCase(),
      deployments[symbol][network].address
    );
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

// Network Assets
export const AVAILABLE_ASSETS: Record<
  string,
  { symbol: string; rewardSource?: string }[]
> = {
  sepolia: [
    { symbol: "AAVE" },
    { symbol: "BAT" },
    { symbol: "BUSD" },
    { symbol: "DAI" },
    { symbol: "ENJ" },
    { symbol: "KNC" },
    { symbol: "LINK" },
    { symbol: "MANA" },
    { symbol: "MKR" },
    { symbol: "REN" },
    { symbol: "SNX" },
    { symbol: "SUSD" },
    { symbol: "TUSD" },
    { symbol: "UNI" },
    { symbol: "USDC" },
    { symbol: "USDT" },
    { symbol: "WBTC" },
    { symbol: "WETH" },
    { symbol: "YFI" },
    { symbol: "ZRX" },
    { symbol: "Tricrypto2" },
    { symbol: "ThreePool" },
    { symbol: "StethEth" },
    { symbol: "Steth" },
    { symbol: "FraxUSDC" },
    { symbol: "Frax3Crv" },
    { symbol: "Frax" },
    { symbol: "BAL" },
    { symbol: "CRV" },
    { symbol: "CVX" },
    { symbol: "BADGER" },
    { symbol: "LDO" },
    { symbol: "ALCX" },
    { symbol: "Oneinch" },
  ],
  optimism: [
    { symbol: "DAI", rewardSource: "" },
    { symbol: "SUSD" },
    { symbol: "USDC" },
    { symbol: "USDT" },
    { symbol: "WBTC" },
    { symbol: "WETH" },
    { symbol: "yvUSDC" },
    { symbol: "yvUSDT" },
    { symbol: "yvDAI" },
    { symbol: "yvWETH" },
    { symbol: "OP" },
    { symbol: "rETH" },
    { symbol: "LUSD" },
    { symbol: "3CRV", rewardSource: "Curve Finance" },
    { symbol: "sUSD3CRV-f", rewardSource: "Curve Finance" },
    { symbol: "wstETHCRV" },
    { symbol: "mooCurveWSTETH", rewardSource: "Beefy Finance" },
    { symbol: "vAMMV2-wstETH/WETH", rewardSource: "Velo" },
    { symbol: "sAMMV2-USDC/sUSD", rewardSource: "Velo" },
    { symbol: "vAMMV2-WETH/USDC", rewardSource: "Velo" },
    { symbol: "sAMMV2-USDC/DAI", rewardSource: "Velo" },
    { symbol: "vAMMV2-WETH/LUSD", rewardSource: "Velo" },
    { symbol: "sAMMV2-USDC/LUSD", rewardSource: "Velo" },
    { symbol: "BPT-WSTETH-WETH", rewardSource: "Aura" },
    { symbol: "BPT-rETH-ETH", rewardSource: "Aura" },
  ],
  base: [
    { symbol: "WETH" },
    { symbol: "USDbC" },
    { symbol: "cbETH" },
    { symbol: "vAMM-WETH/USDbC", rewardSource: "Velo" },
    { symbol: "vAMM-cbETH/WETH", rewardSource: "Velo" },
  ],
  arbitrum: [
    { symbol: "USDC.e" },
    { symbol: "WETH" },
    { symbol: "wstETH" },
    { symbol: "WBTC" },
    { symbol: "USDT" },
    { symbol: "USDC" },
    { symbol: "DAI" },
    { symbol: "ARB" },
    { symbol: "rETH" },
    { symbol: "LUSD" },
    { symbol: "FRAX" },
    { symbol: "2CRV" },
    { symbol: "wstETH-WETH-BPT" },
    { symbol: "rETH-WETH-BPT" },
    { symbol: "wstETHCRV" },
    { symbol: "FRAXBPCRV-f" },
    { symbol: "CMLT-ARB-ETH" },
    { symbol: "CMLT-ETH-USDC.e" },
    { symbol: "CMLT-USDT-USDC.e" },
    { symbol: "CMLT-wstETH-ETH" },
    { symbol: "CMLT-LUSD-USDC.e" },
  ],
};

// Decimals
export const PRICING_DECIMALS: any = {
  optimism: 8,
  base: 8,
  arbitrum: 8,
  mainnet: 18,
  sepolia: 18,
};

export const DECIMALS = new Map<string, number>([
  ["AAVE", 18],
  ["BAT", 18],
  ["BUSD", 18],
  ["DAI", 18],
  ["ENJ", 18],
  ["KNC", 18],
  ["LINK", 18],
  ["MANA", 18],
  ["MKR", 18],
  ["REN", 18],
  ["SNX", 18],
  ["SUSD", 18],
  ["sUSD", 18],
  ["TUSD", 18],
  ["UNI", 18],
  ["USDC", 6],
  ["USDT", 6],
  ["WBTC", 8],
  ["WETH", 18],
  ["YFI", 18],
  ["ZRX", 18],
  ["Tricrypto2", 18],
  ["ThreePool", 18],
  ["StethEth", 18],
  ["Steth", 18],
  ["FraxUSDC", 18],
  ["Frax3Crv", 18],
  ["Frax", 18],
  ["BAL", 18],
  ["CRV", 18],
  ["CVX", 18],
  ["BADGER", 18],
  ["LDO", 18],
  ["ALCX", 18],
  ["Oneinch", 18],
  ["yvTricrypto2", 18],
  ["yvThreePool", 18],
  ["yvStethEth", 18],
  ["yvFraxUSDC", 18],
  ["yvFrax3Crv", 18],
  ["yvUSDC", 6],
  ["yvUSDT", 6],
  ["yvDAI", 18],
  ["yvWETH", 18],
  ["OP", 18],
  ["rETH", 18],
  ["LUSD", 18],
  ["3CRV", 18],
  ["sUSD3CRV-f", 18],
  ["wstETHCRV", 18],
  ["mooCurveWSTETH", 18],
  ["vAMMV2-wstETH/WETH", 18],
  ["sAMMV2-USDC/sUSD", 18],
  ["vAMMV2-WETH/USDC", 18],
  ["sAMMV2-USDC/DAI", 18],
  ["vAMMV2-WETH/LUSD", 18],
  ["sAMMV2-USDC/LUSD", 18],
  ["BPT-WSTETH-WETH", 18],
  ["BPT-rETH-ETH", 18],
  ["USDbC", 6],
  ["cbETH", 18],
  ["vAMM-WETH/USDbC", 18],
  ["vAMM-cbETH/WETH", 18],
]);
