import AaveConfig from "@vmexfinance/contracts/dist/markets/aave"
import OptimismConfig from "@vmexfinance/contracts/dist/markets/optimism"

export const MAX_UINT_AMOUNT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const TOKEN_PRICE = {
  AAVE: "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012",
  BAT: "0x0d16d4528239e9ee52fa531af613AcdB23D88c94",
  BUSD: "0x614715d2Af89E6EC99A233818275142cE88d1Cfd",
  DAI: "0x773616E4d11A78F511299002da57A0a94577F1f4",
  ENJ: "0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B",
  KNC: "0x656c0544eF4C98A6a98491833A89204Abb045d6b",
  LINK: "0xDC530D9457755926550b59e8ECcdaE7624181557",
  MANA: "0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9",
  MKR: "0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2",
  REN: "0x3147D7203354Dc06D9fd350c7a2437bcA92387a4",
  SNX: "0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c",
  SUSD: "0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757",
  TUSD: "0x3886BA987236181D98F2401c507Fb8BeA7871dF2",
  UNI: "0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e",
  USDC: "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
  USDT: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
  WBTC: "0xdeb288F737066589598e9214E782fa5A8eD689e8",
  YFI: "0x7c5d4F8345e66f68099581Db340cd65B078C41f4",
  ZRX: "0x2Da4983a622a8498bb1a21FaE9D8F6C664939962",
  USD: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
};

export const TOKEN_PRICE_CONTRACTS = {
  AAVE: [
    "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012",
    "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
  ],
  BAT: [
    "0x0d16d4528239e9ee52fa531af613AcdB23D88c94",
    "0x9441D7556e7820B5ca42082cfa99487D56AcA958",
  ],
  BUSD: [
    "0x614715d2Af89E6EC99A233818275142cE88d1Cfd",
    "0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A",
  ],
  DAI: [
    "0x773616E4d11A78F511299002da57A0a94577F1f4",
    "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
  ],
  ENJ: [
    "0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B",
    "0x23905C55dC11D609D5d11Dc604905779545De9a7",
  ],
  KNC: [
    "0x656c0544eF4C98A6a98491833A89204Abb045d6b",
    "0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc",
  ],
  LINK: [
    "0xDC530D9457755926550b59e8ECcdaE7624181557",
    "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
  ],
  MANA: [
    "0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9",
    "0x56a4857acbcfe3a66965c251628B1c9f1c408C19",
  ],
  MKR: [
    "0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2",
    "0xec1D1B3b0443256cc3860e24a46F108e699484Aa",
  ],
  REN: [
    "0x3147D7203354Dc06D9fd350c7a2437bcA92387a4",
    "0x0f59666EDE214281e956cb3b2D0d69415AfF4A01",
  ],
  SNX: [
    "0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c",
    "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
  ],
  SUSD: [
    "0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757",
    "0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94",
  ],
  TUSD: [
    "0x3886BA987236181D98F2401c507Fb8BeA7871dF2",
    "0xec746eCF986E2927Abd291a2A1716c940100f8Ba",
  ],
  UNI: [
    "0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e",
    "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
  ],
  USDC: [
    "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
    "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  ],
  USDT: [
    "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
    "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
  ],
  WBTC: [
    "0xdeb288F737066589598e9214E782fa5A8eD689e8",
    "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
  ],
  YFI: [
    "0x7c5d4F8345e66f68099581Db340cd65B078C41f4",
    "0xA027702dbb89fbd58938e4324ac03B58d812b0E1",
  ],
  ZRX: [
    "0x2Da4983a622a8498bb1a21FaE9D8F6C664939962",
    "0x2885d15b8Af22648b98B122b22FDF4D2a56c6023",
  ],
};

const formatNetworkMappings = (
  marketAssets: Map<string, string>,
): [Map<string, string>, Map<string, string>] => {

  return [
    new Map(
      Array.from(marketAssets, (entry) => [
        entry[0].toUpperCase(),
        entry[1],
      ])
    ),
    new Map(
      Array.from(marketAssets, (entry) => [
        entry[1].toLowerCase(),
        entry[0],
      ])
    ),
  ];
};

export const [MAINNET_ASSET_MAPPINGS, REVERSE_MAINNET_ASSET_MAPPINGS] =
  formatNetworkMappings(AaveConfig.ReserveAssets['main']);

export const [OPTIMISM_ASSET_MAPPINGS, REVERSE_OPTIMISM_ASSET_MAPPINGS] =
  formatNetworkMappings(OptimismConfig.ReserveAssets['optimism']);

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
    addressesMap.set(symbol, deployments[symbol][network].address);
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
console.log("goerli reverse mappings", REVERSE_GOERLI_CUSTOM_ASSET_MAPPINGS);
export const SEPOLIA_CUSTOM_ASSET_MAPPINGS = findCustomTokenAddresses(
  [...MAINNET_ASSET_MAPPINGS.keys()],
  "sepolia"
);
export const REVERSE_SEPOLIA_CUSTOM_ASSET_MAPPINGS = flipAndLowerCase(
  SEPOLIA_CUSTOM_ASSET_MAPPINGS
);


//note that this is mainnet
export const TOKEN: Token<typeof TOKEN_PRICE> = {
  ["AAVE"]: {
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    decimals: "18",
  },
  ["BAT"]: {
    address: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
    decimals: "18",
  },
  ["BUSD"]: {
    address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    decimals: "18",
  },
  ["DAI"]: {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: "18",
  },
  ["ENJ"]: {
    address: "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c",
    decimals: "18",
  },
  ["KNC"]: {
    address: "0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202",
    decimals: "18",
  },
  ["LINK"]: {
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: "18",
  },
  ["MANA"]: {
    address: "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
    decimals: "18",
  },
  ["MKR"]: {
    address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
    decimals: "18",
  },
  ["REN"]: {
    address: "0x408e41876cCCDC0F92210600ef50372656052a38",
    decimals: "18",
  },
  ["SNX"]: {
    address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
    decimals: "18",
  },
  ["SUSD"]: {
    address: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
    decimals: "18",
  },
  ["TUSD"]: {
    address: "0x0000000000085d4780B73119b644AE5ecd22b376",
    decimals: "18",
  },
  ["UNI"]: {
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    decimals: "18",
  },
  ["USDC"]: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: "18",
  },
  ["USDT"]: {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: "18",
  },
  ["WBTC"]: {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: "18",
  },
  ["YFI"]: {
    address: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
    decimals: "18",
  },
  ["ZRX"]: {
    address: "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
    decimals: "18",
  },
  ["USD"]: {
    address: "",
    decimals: "8",
  },
};

import Deployments from "./deployed-contracts.json";
export const deployments = Deployments;
