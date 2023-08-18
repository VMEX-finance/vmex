"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RANDOM_ADDRESSES = exports.reserveAssets = exports.chainlinkEthUsdAggregatorProxy = exports.chainlinkAggregatorProxy = exports.MOCK_CHAINLINK_AGGREGATORS_PRICES = exports.AAVE_REFERRAL = exports.USD_ADDRESS = exports.MOCK_USD_PRICE_IN_WEI = exports.TOKEN_DISTRIBUTOR_PERCENTAGE_BASE = exports.APPROVAL_AMOUNT_LENDING_POOL = exports.EXCESS_UTILIZATION_RATE = exports.OPTIMAL_UTILIZATION_RATE = exports.ONE_ADDRESS = exports.ZERO_ADDRESS = exports.ONE_YEAR = exports.MAX_UINT_AMOUNT = exports.oneRay = exports.oneUsd = exports.oneEther = exports.WAD_RAY_RATIO = exports.HALF_RAY = exports.RAY = exports.HALF_WAD = exports.WAD = exports.HALF_PERCENTAGE = exports.PERCENTAGE_FACTOR = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
// ----------------
// MATH
// ----------------
exports.PERCENTAGE_FACTOR = Math.pow(10, 18).toString();
exports.HALF_PERCENTAGE = (5 * Math.pow(10, 17)).toString();
exports.WAD = Math.pow(10, 18).toString();
exports.HALF_WAD = new bignumber_js_1.default(exports.WAD).multipliedBy(0.5).toString();
exports.RAY = new bignumber_js_1.default(10).exponentiatedBy(27).toFixed();
exports.HALF_RAY = new bignumber_js_1.default(exports.RAY).multipliedBy(0.5).toFixed();
exports.WAD_RAY_RATIO = Math.pow(10, 9).toString();
exports.oneEther = new bignumber_js_1.default(Math.pow(10, 18));
exports.oneUsd = new bignumber_js_1.default(Math.pow(10, 8));
exports.oneRay = new bignumber_js_1.default(Math.pow(10, 27));
exports.MAX_UINT_AMOUNT = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
exports.ONE_YEAR = "31536000";
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.ONE_ADDRESS = "0x0000000000000000000000000000000000000001";
// ----------------
// PROTOCOL GLOBAL PARAMS
// ----------------
exports.OPTIMAL_UTILIZATION_RATE = new bignumber_js_1.default(0.8).times(exports.RAY);
exports.EXCESS_UTILIZATION_RATE = new bignumber_js_1.default(0.2).times(exports.RAY);
exports.APPROVAL_AMOUNT_LENDING_POOL = "1000000000000000000000000000";
exports.TOKEN_DISTRIBUTOR_PERCENTAGE_BASE = "10000";
exports.MOCK_USD_PRICE_IN_WEI = "5848466240000000";
exports.USD_ADDRESS = "0x10F7Fc1F91Ba351f9C629c5947AD69bD03C05b96";
exports.AAVE_REFERRAL = "0";
exports.MOCK_CHAINLINK_AGGREGATORS_PRICES = {
    // Update to USD-based price feeds
    AAVE: exports.oneEther.multipliedBy("0.003620948469").toFixed(),
    BAT: exports.oneEther.multipliedBy("0.00137893825230").toFixed(),
    BUSD: exports.oneEther.multipliedBy("0.00736484").toFixed(),
    DAI: exports.oneEther.multipliedBy("0.00369068412860").toFixed(),
    ENJ: exports.oneEther.multipliedBy("0.00029560").toFixed(),
    KNC: exports.oneEther.multipliedBy("0.001072").toFixed(),
    LINK: exports.oneEther.multipliedBy("0.009955").toFixed(),
    MANA: exports.oneEther.multipliedBy("0.000158").toFixed(),
    MKR: exports.oneEther.multipliedBy("2.508581").toFixed(),
    REN: exports.oneEther.multipliedBy("0.00065133").toFixed(),
    SNX: exports.oneEther.multipliedBy("0.00442616").toFixed(),
    SUSD: exports.oneEther.multipliedBy("0.00364714136416").toFixed(),
    TUSD: exports.oneEther.multipliedBy("0.00364714136416").toFixed(),
    UNI: exports.oneEther.multipliedBy("0.00536479").toFixed(),
    USDC: exports.oneEther.multipliedBy("0.00367714136416").toFixed(),
    USDT: exports.oneEther.multipliedBy("0.00369068412860").toFixed(),
    WETH: exports.oneEther.toFixed(),
    WBTC: exports.oneEther.multipliedBy("47.332685").toFixed(),
    YFI: exports.oneEther.multipliedBy("22.407436").toFixed(),
    ZRX: exports.oneEther.multipliedBy("0.001151").toFixed(),
    OP: exports.oneEther.multipliedBy("0.006").toFixed(),
    ThreeCRV: exports.oneEther.multipliedBy("0.00369068412860").toFixed(),
    sUSD3CRV: exports.oneEther.multipliedBy("0.00369068412860").toFixed(),
    wstETHCRV: exports.oneEther.toFixed(),
    UniDAIWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniWBTCWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniAAVEWETH: exports.oneEther.multipliedBy("0.003620948469").toFixed(),
    UniBATWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniDAIUSDC: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniCRVWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniLINKWETH: exports.oneEther.multipliedBy("0.009955").toFixed(),
    UniMKRWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniRENWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniSNXWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniUNIWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniUSDCWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniWBTCUSDC: exports.oneEther.multipliedBy("22.407436").toFixed(),
    UniYFIWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    BptWBTCWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    BptBALWETH: exports.oneEther.multipliedBy("22.407436").toFixed(),
    WMATIC: exports.oneEther.multipliedBy("0.003620948469").toFixed(),
    STAKE: exports.oneEther.multipliedBy("0.003620948469").toFixed(),
    WAVAX: exports.oneEther.multipliedBy("0.006051936629").toFixed(),
    USD: "5848466240000000",
    Tricrypto2: exports.oneEther.toFixed(),
    ThreePool: exports.oneEther.toFixed(),
    StethEth: exports.oneEther.toFixed(),
    Steth: exports.oneEther.toFixed(),
    wstETH: exports.oneEther.toFixed(),
    FraxUSDC: exports.oneEther.toFixed(),
    Frax3Crv: exports.oneEther.toFixed(),
    FRAX: exports.oneEther.multipliedBy("0.00367714136416").toFixed(),
    BAL: exports.oneEther.multipliedBy("0.00443515").toFixed(),
    CRV: exports.oneEther.multipliedBy("0.0007007323").toFixed(),
    CVX: exports.oneEther.multipliedBy("0.00325699").toFixed(),
    BADGER: exports.oneEther.multipliedBy("0.002689352").toFixed(),
    LDO: exports.oneEther.multipliedBy("0.0011974251").toFixed(),
    ALCX: exports.oneEther.multipliedBy("0.0011974251").toFixed(),
    Oneinch: exports.oneEther.multipliedBy("0.0011974251").toFixed(),
    yvTricrypto2: exports.oneEther.toFixed(),
    yvThreePool: exports.oneEther.toFixed(),
    yvStethEth: exports.oneEther.toFixed(),
    yvFraxUSDC: exports.oneEther.toFixed(),
    yvFrax3Crv: exports.oneEther.toFixed(),
    mooCurveFsUSD: exports.oneEther.toFixed(),
    mooCurveWSTETH: exports.oneEther.toFixed(),
    velo_rETHWETH: exports.oneEther.toFixed(),
    velo_wstETHWETH: exports.oneEther.toFixed(),
    moo_velo_wstETHWETH: exports.oneEther.toFixed(),
    velo_USDCsUSD: exports.oneEther.toFixed(),
    moo_velo_USDCsUSD: exports.oneEther.toFixed(),
    velo_ETHUSDC: exports.oneEther.toFixed(),
    moo_velo_ETHUSDC: exports.oneEther.toFixed(),
    velo_OPETH: exports.oneEther.toFixed(),
    moo_velo_OPETH: exports.oneEther.toFixed(),
    velo_ETHSNX: exports.oneEther.toFixed(),
    moo_velo_ETHSNX: exports.oneEther.toFixed(),
    velo_OPUSDC: exports.oneEther.toFixed(),
    moo_velo_OPUSDC: exports.oneEther.toFixed(),
    velo_DAIUSDC: exports.oneEther.toFixed(),
    moo_velo_DAIUSDC: exports.oneEther.toFixed(),
    velo_FRAXUSDC: exports.oneEther.toFixed(),
    moo_velo_FRAXUSDC: exports.oneEther.toFixed(),
    velo_USDTUSDC: exports.oneEther.toFixed(),
    moo_velo_USDTUSDC: exports.oneEther.toFixed(),
    beethoven_USDCDAI: exports.oneEther.toFixed(),
    beethoven_wstETHETH: exports.oneEther.toFixed(),
    beethoven_WETHOPUSDC: exports.oneEther.multipliedBy("0.00367714136416").toFixed(),
    rETH: exports.oneEther.toFixed(),
    beethoven_rETHETH: exports.oneEther.toFixed(),
    yvUSDC: exports.oneEther.multipliedBy("0.00367714136416").toFixed(),
    yvDAI: exports.oneEther.multipliedBy("0.00367714136416").toFixed(),
    yvUSDT: exports.oneEther.multipliedBy("0.00367714136416").toFixed(),
    yvWETH: exports.oneEther.toFixed(),
    LUSD: exports.oneEther.multipliedBy("0.00367714136416").toFixed(),
    velo_LUSDWETH: exports.oneEther.toFixed(),
    velo_LUSDUSDC: exports.oneEther.multipliedBy("0.00367714136416").toFixed(),
};
exports.chainlinkAggregatorProxy = {
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
exports.chainlinkEthUsdAggregatorProxy = {
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
exports.reserveAssets = new Map([
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
exports.RANDOM_ADDRESSES = [
    '0x0000000000000000000000000000000000000221',
    '0x0000000000000000000000000000000000000321',
    '0x0000000000000000000000000000000000000211',
    '0x0000000000000000000000000000000000000251',
    '0x0000000000000000000000000000000000000271',
    '0x0000000000000000000000000000000000000291',
    '0x0000000000000000000000000000000000000321',
    '0x0000000000000000000000000000000000000421',
    '0x0000000000000000000000000000000000000521',
    '0x0000000000000000000000000000000000000621',
    '0x0000000000000000000000000000000000000721',
];
//# sourceMappingURL=constants.js.map