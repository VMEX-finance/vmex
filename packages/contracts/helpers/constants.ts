import BigNumber from "bignumber.js";
import { eEthereumNetwork } from "./types";
import ethers from "ethers";

// ----------------
// MATH
// ----------------

export const PERCENTAGE_FACTOR = Math.pow(10, 18).toString();
export const HALF_PERCENTAGE = (5*Math.pow(10, 17)).toString();
export const WAD = Math.pow(10, 18).toString();
export const HALF_WAD = new BigNumber(WAD).multipliedBy(0.5).toString();
export const RAY = new BigNumber(10).exponentiatedBy(27).toFixed();
export const HALF_RAY = new BigNumber(RAY).multipliedBy(0.5).toFixed();
export const WAD_RAY_RATIO = Math.pow(10, 9).toString();
export const oneEther = new BigNumber(Math.pow(10, 18));
export const oneUsd = new BigNumber(Math.pow(10, 8));
export const oneRay = new BigNumber(Math.pow(10, 27));
export const MAX_UINT_AMOUNT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export const ONE_YEAR = "31536000";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ONE_ADDRESS = "0x0000000000000000000000000000000000000001";
// ----------------
// PROTOCOL GLOBAL PARAMS
// ----------------
export const OPTIMAL_UTILIZATION_RATE = new BigNumber(0.8).times(RAY);
export const EXCESS_UTILIZATION_RATE = new BigNumber(0.2).times(RAY);
export const APPROVAL_AMOUNT_LENDING_POOL = "1000000000000000000000000000";
export const TOKEN_DISTRIBUTOR_PERCENTAGE_BASE = "10000";
export const MOCK_USD_PRICE_IN_WEI = "5848466240000000";
export const USD_ADDRESS = "0x10F7Fc1F91Ba351f9C629c5947AD69bD03C05b96";
export const AAVE_REFERRAL = "0";

export const MOCK_CHAINLINK_AGGREGATORS_PRICES = {
  // Update to USD-based price feeds
  AAVE: oneEther.multipliedBy("0.003620948469").toFixed(),
  BAT: oneEther.multipliedBy("0.00137893825230").toFixed(),
  BUSD: oneEther.multipliedBy("0.00736484").toFixed(),
  DAI: oneEther.multipliedBy("0.00369068412860").toFixed(),
  ENJ: oneEther.multipliedBy("0.00029560").toFixed(),
  KNC: oneEther.multipliedBy("0.001072").toFixed(),
  LINK: oneEther.multipliedBy("0.009955").toFixed(),
  MANA: oneEther.multipliedBy("0.000158").toFixed(),
  MKR: oneEther.multipliedBy("2.508581").toFixed(),
  REN: oneEther.multipliedBy("0.00065133").toFixed(),
  SNX: oneEther.multipliedBy("0.00442616").toFixed(),
  SUSD: oneEther.multipliedBy("0.00364714136416").toFixed(),
  TUSD: oneEther.multipliedBy("0.00364714136416").toFixed(),
  UNI: oneEther.multipliedBy("0.00536479").toFixed(),
  USDC: oneEther.multipliedBy("0.00367714136416").toFixed(),
  USDT: oneEther.multipliedBy("0.00369068412860").toFixed(),
  WETH: oneEther.toFixed(),
  WBTC: oneEther.multipliedBy("47.332685").toFixed(),
  YFI: oneEther.multipliedBy("22.407436").toFixed(),
  ZRX: oneEther.multipliedBy("0.001151").toFixed(),
  UniDAIWETH: oneEther.multipliedBy("22.407436").toFixed(),
  UniWBTCWETH: oneEther.multipliedBy("22.407436").toFixed(),
  UniAAVEWETH: oneEther.multipliedBy("0.003620948469").toFixed(),
  UniBATWETH: oneEther.multipliedBy("22.407436").toFixed(),
  UniDAIUSDC: oneEther.multipliedBy("22.407436").toFixed(),
  UniCRVWETH: oneEther.multipliedBy("22.407436").toFixed(),
  UniLINKWETH: oneEther.multipliedBy("0.009955").toFixed(),
  UniMKRWETH: oneEther.multipliedBy("22.407436").toFixed(),
  UniRENWETH: oneEther.multipliedBy("22.407436").toFixed(),
  UniSNXWETH: oneEther.multipliedBy("22.407436").toFixed(),
  UniUNIWETH: oneEther.multipliedBy("22.407436").toFixed(),
  UniUSDCWETH: oneEther.multipliedBy("22.407436").toFixed(),
  UniWBTCUSDC: oneEther.multipliedBy("22.407436").toFixed(),
  UniYFIWETH: oneEther.multipliedBy("22.407436").toFixed(),
  BptWBTCWETH: oneEther.multipliedBy("22.407436").toFixed(),
  BptBALWETH: oneEther.multipliedBy("22.407436").toFixed(),
  WMATIC: oneEther.multipliedBy("0.003620948469").toFixed(),
  STAKE: oneEther.multipliedBy("0.003620948469").toFixed(),
  WAVAX: oneEther.multipliedBy("0.006051936629").toFixed(),
  USD: "5848466240000000",
  Tricrypto2: oneEther.toFixed(), //this should not be used, just placed here to compile
  ThreePool: oneEther.toFixed(), //this should not be used, just placed here to compile
  StethEth: oneEther.toFixed(), //this should not be used, just placed here to compile
  Steth: oneEther.toFixed(), //this should not be used, just placed here to compile
  FraxUSDC: oneEther.toFixed(), //this should not be used, just placed here to compile
  Frax3Crv: oneEther.toFixed(), //this should not be used, just placed here to compile
  Frax: oneEther.multipliedBy("0.00367714136416").toFixed(), //this should not be used, just placed here to compile
  BAL: oneEther.multipliedBy("0.00443515").toFixed(), //this should not be used, just placed here to compile
  CRV: oneEther.multipliedBy("0.0007007323").toFixed(), //this should not be used, just placed here to compile
  CVX: oneEther.multipliedBy("0.00325699").toFixed(), //this should not be used, just placed here to compile
  BADGER: oneEther.multipliedBy("0.002689352").toFixed(), //this should not be used, just placed here to compile
  LDO: oneEther.multipliedBy("0.0011974251").toFixed(), //this should not be used, just placed here to compile
  ALCX: oneEther.multipliedBy("0.0011974251").toFixed(), //this should not be used, just placed here to compile
  Oneinch: oneEther.multipliedBy("0.0011974251").toFixed(), //this should not be used, just placed here to compile
  yvTricrypto2: oneEther.toFixed(), //this should not be used, just placed here to compile
  yvThreePool: oneEther.toFixed(), //this should not be used, just placed here to compile
  yvStethEth: oneEther.toFixed(), //this should not be used, just placed here to compile
  yvFraxUSDC: oneEther.toFixed(), //this should not be used, just placed here to compile
  yvFrax3Crv: oneEther.toFixed(), //this should not be used, just placed here to compile
};

export const chainlinkAggregatorProxy = {
  main: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  hardhat: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  localhost: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  kovan: "0x9326BFA02ADD2366b30bacB125260Af641031331",
  matic: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  mumbai: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
  avalanche: "0x0A77230d17318075983913bC2145DB16C7366156",
  fuji: "0x5498BB86BC934c8D34FDA08E81D444153d0D06aD",
  tenderly: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  "arbitrum-rinkeby": "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8",
  arbitrum: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  rinkeby: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
};

export const chainlinkEthUsdAggregatorProxy = {
  main: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  hardhat: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  localhost: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  kovan: "0x9326BFA02ADD2366b30bacB125260Af641031331",
  matic: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  mumbai: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
  avalanche: "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
  fuji: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
  tenderly: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  "arbitrum-rinkeby": "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8",
  arbitrum: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  rinkeby: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
};

export const reserveAssets = new Map<string, string>([
  ['AAVE', '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'],
  ['BAT', '0x0d8775f648430679a709e98d2b0cb6250d2887ef'],
  ['BUSD', '0x4Fabb145d64652a948d72533023f6E7A623C7C53'],
  ['DAI', '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
  ['ENJ', '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c'],
  ['KNC', '0xdd974D5C2e2928deA5F71b9825b8b646686BD200'],
  ['LINK', '0x514910771AF9Ca656af840dff83E8264EcF986CA'],
  ['MANA', '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'],
  ['MKR', '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'],
  ['REN', '0x408e41876cCCDC0F92210600ef50372656052a38'],
  ['SNX', '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F'],
  ['SUSD', '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51'],
  ['TUSD', '0x0000000000085d4780B73119b644AE5ecd22b376'],
  ['UNI', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'],
  ['USDC', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
  ['USDT', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
  ['WBTC', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
  ['WETH', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
  ['YFI', '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'],
  ['ZRX', '0xE41d2489571d322189246DaFA5ebDe1F4699F498'],
  ['stETH', '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
  ['FRAX', '0x853d955aCEf822Db058eb8505911ED77F175b99e'],
  ['BAL', '0xba100000625a3754423978a60c9317c58a424e3D'],
  ['CRV', '0xD533a949740bb3306d119CC777fa900bA034cd52'],
  ['CVX', '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B'],
  ['BADGER', '0x3472A5A71965499acd81997a54BBA8D852C6E53d'],
  ['LDO', '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'],
  ['ALCX', '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF'],
  ['1INCH', '0x111111111117dC0aa78b770fA6A738034120C302'],
]);