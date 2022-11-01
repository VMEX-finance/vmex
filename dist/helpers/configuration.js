"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHardhatTestingStrategies = exports.getQuoteCurrency = exports.getLendingRateOracles = exports.getWrappedNativeTokenAddress = exports.getWethAddress = exports.getATokenDomainSeparatorPerNetwork = exports.getGlobalVMEXReserveFactor = exports.getTreasuryAddress = exports.getEmergencyAdmin = exports.getGenesisPoolAdmin = exports.getReservesConfigByPool = exports.loadPoolConfig = exports.loadCustomAavePoolConfig = exports.ConfigNames = void 0;
const types_1 = require("./types");
const contracts_helpers_1 = require("./contracts-helpers");
const aave_1 = __importDefault(require("../markets/aave"));
const matic_1 = __importDefault(require("../markets/matic"));
const avalanche_1 = __importDefault(require("../markets/avalanche"));
const amm_1 = __importDefault(require("../markets/amm"));
const commons_1 = require("../markets/aave/commons");
const misc_utils_1 = require("./misc-utils");
const contracts_helpers_2 = require("./contracts-helpers");
const contracts_deployments_1 = require("./contracts-deployments");
var ConfigNames;
(function (ConfigNames) {
    ConfigNames["Commons"] = "Commons";
    ConfigNames["Aave"] = "Aave";
    ConfigNames["Matic"] = "Matic";
    ConfigNames["Amm"] = "Amm";
    ConfigNames["Avalanche"] = "Avalanche";
})(ConfigNames = exports.ConfigNames || (exports.ConfigNames = {}));
const loadCustomAavePoolConfig = (trancheId) => {
    const { AaveConfig } = require("../markets/aave_" + trancheId);
    return AaveConfig;
};
exports.loadCustomAavePoolConfig = loadCustomAavePoolConfig;
const loadPoolConfig = (configName) => {
    switch (configName) {
        case ConfigNames.Aave:
            return aave_1.default;
        case ConfigNames.Matic:
            return matic_1.default;
        case ConfigNames.Amm:
            return amm_1.default;
        case ConfigNames.Avalanche:
            return avalanche_1.default;
        case ConfigNames.Commons:
            return commons_1.CommonsConfig;
        default:
            throw new Error(`Unsupported pool configuration: ${configName} is not one of the supported configs ${Object.values(ConfigNames)}`);
    }
};
exports.loadPoolConfig = loadPoolConfig;
// ----------------
// PROTOCOL PARAMS PER POOL
// ----------------
const getReservesConfigByPool = (pool) => (0, contracts_helpers_1.getParamPerPool)({
    [types_1.AavePools.proto]: {
        ...aave_1.default.ReservesConfig,
    },
    [types_1.AavePools.amm]: {
        ...amm_1.default.ReservesConfig,
    },
    [types_1.AavePools.matic]: {
        ...matic_1.default.ReservesConfig,
    },
    [types_1.AavePools.avalanche]: {
        ...avalanche_1.default.ReservesConfig,
    },
}, pool);
exports.getReservesConfigByPool = getReservesConfigByPool;
const getGenesisPoolAdmin = async (config) => {
    const currentNetwork = process.env.FORK ? process.env.FORK : misc_utils_1.DRE.network.name;
    const targetAddress = (0, contracts_helpers_2.getParamPerNetwork)(config.PoolAdmin, currentNetwork);
    if (targetAddress) {
        return targetAddress;
    }
    const addressList = await (0, contracts_helpers_1.getEthersSignersAddresses)();
    const addressIndex = config.PoolAdminIndex;
    return addressList[addressIndex];
};
exports.getGenesisPoolAdmin = getGenesisPoolAdmin;
const getEmergencyAdmin = async (config) => {
    const currentNetwork = process.env.FORK ? process.env.FORK : misc_utils_1.DRE.network.name;
    const targetAddress = (0, contracts_helpers_2.getParamPerNetwork)(config.EmergencyAdmin, currentNetwork);
    if (targetAddress) {
        return targetAddress;
    }
    const addressList = await (0, contracts_helpers_1.getEthersSignersAddresses)();
    const addressIndex = config.EmergencyAdminIndex;
    return addressList[addressIndex];
};
exports.getEmergencyAdmin = getEmergencyAdmin;
const getTreasuryAddress = async (config) => {
    const currentNetwork = process.env.FORK ? process.env.FORK : misc_utils_1.DRE.network.name;
    return (0, contracts_helpers_2.getParamPerNetwork)(config.ReserveFactorTreasuryAddress, currentNetwork);
};
exports.getTreasuryAddress = getTreasuryAddress;
const getGlobalVMEXReserveFactor = async () => {
    return "1000"; //10% is default VMEX reserve factor
};
exports.getGlobalVMEXReserveFactor = getGlobalVMEXReserveFactor;
const getATokenDomainSeparatorPerNetwork = (network, config) => (0, contracts_helpers_2.getParamPerNetwork)(config.ATokenDomainSeparator, network);
exports.getATokenDomainSeparatorPerNetwork = getATokenDomainSeparatorPerNetwork;
const getWethAddress = async (config) => {
    const currentNetwork = process.env.FORK ? process.env.FORK : misc_utils_1.DRE.network.name;
    const wethAddress = (0, contracts_helpers_2.getParamPerNetwork)(config.WETH, currentNetwork);
    if (wethAddress) {
        return wethAddress;
    }
    if (currentNetwork.includes("main")) {
        throw new Error("WETH not set at mainnet configuration.");
    }
    const weth = await (0, contracts_deployments_1.deployWETHMocked)();
    return weth.address;
};
exports.getWethAddress = getWethAddress;
const getWrappedNativeTokenAddress = async (config) => {
    const currentNetwork = process.env.MAINNET_FORK === "true" ? "main" : misc_utils_1.DRE.network.name;
    const wethAddress = (0, contracts_helpers_2.getParamPerNetwork)(config.WrappedNativeToken, currentNetwork);
    if (wethAddress) {
        return wethAddress;
    }
    if (currentNetwork.includes("main")) {
        throw new Error("WETH not set at mainnet configuration.");
    }
    const weth = await (0, contracts_deployments_1.deployWETHMocked)();
    return weth.address;
};
exports.getWrappedNativeTokenAddress = getWrappedNativeTokenAddress;
const getLendingRateOracles = (poolConfig) => {
    const { ProtocolGlobalParams: { UsdAddress }, LendingRateOracleRatesCommon, ReserveAssets, } = poolConfig;
    const network = process.env.FORK ? process.env.FORK : misc_utils_1.DRE.network.name;
    return (0, misc_utils_1.filterMapBy)(LendingRateOracleRatesCommon, (key) => Object.keys(ReserveAssets[network]).includes(key));
};
exports.getLendingRateOracles = getLendingRateOracles;
const getQuoteCurrency = async (config) => {
    switch (config.OracleQuoteCurrency) {
        case "ETH":
        case "WETH":
            return (0, exports.getWethAddress)(config);
        case "USD":
            return config.ProtocolGlobalParams.UsdAddress;
        default:
            throw `Quote ${config.OracleQuoteCurrency} currency not set. Add a new case to getQuoteCurrency switch`;
    }
};
exports.getQuoteCurrency = getQuoteCurrency;
// if testing strategies, make sure to have to comment out cvx, crv, underlying
// token allow all inside CrvLpStrategy.sol, otherwise setup fails for all tests
exports.isHardhatTestingStrategies = false;
//# sourceMappingURL=configuration.js.map