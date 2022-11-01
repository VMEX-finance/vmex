"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainlinkEthUsdAggregatorProxy = exports.chainlinkAggregatorProxy = exports.MOCK_CHAINLINK_AGGREGATORS_PRICES = exports.AAVE_REFERRAL = exports.USD_ADDRESS = exports.MOCK_USD_PRICE_IN_WEI = exports.TOKEN_DISTRIBUTOR_PERCENTAGE_BASE = exports.APPROVAL_AMOUNT_LENDING_POOL = exports.EXCESS_UTILIZATION_RATE = exports.OPTIMAL_UTILIZATION_RATE = exports.ONE_ADDRESS = exports.ZERO_ADDRESS = exports.ONE_YEAR = exports.MAX_UINT_AMOUNT = exports.oneRay = exports.oneUsd = exports.oneEther = exports.WAD_RAY_RATIO = exports.HALF_RAY = exports.RAY = exports.HALF_WAD = exports.WAD = exports.HALF_PERCENTAGE = exports.PERCENTAGE_FACTOR = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
// ----------------
// MATH
// ----------------
exports.PERCENTAGE_FACTOR = "10000";
exports.HALF_PERCENTAGE = "5000";
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
    xSUSHI: exports.oneEther.multipliedBy("0.00913428586").toFixed(),
    WAVAX: exports.oneEther.multipliedBy("0.006051936629").toFixed(),
    USD: "5848466240000000",
    Tricrypto2: exports.oneEther.toFixed(),
    ThreePool: exports.oneEther.toFixed(),
    StethEth: exports.oneEther.toFixed(),
    Steth: exports.oneEther.toFixed(),
    FraxUSDC: exports.oneEther.toFixed(),
    Frax3Crv: exports.oneEther.toFixed(),
    Frax: exports.oneEther.multipliedBy("0.00367714136416").toFixed(),
    BAL: exports.oneEther.multipliedBy("0.00443515").toFixed(),
    CRV: exports.oneEther.multipliedBy("0.0007007323").toFixed(),
    CVX: exports.oneEther.multipliedBy("0.00325699").toFixed(),
    BADGER: exports.oneEther.multipliedBy("0.002689352").toFixed(),
    LDO: exports.oneEther.multipliedBy("0.0011974251").toFixed(),
    ALCX: exports.oneEther.multipliedBy("0.0011974251").toFixed(),
    Oneinch: exports.oneEther.multipliedBy("0.0011974251").toFixed(), //this should not be used, just placed here to compile
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
//# sourceMappingURL=constants.js.map