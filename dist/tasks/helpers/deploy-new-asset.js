"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const marketConfigs = __importStar(require("../../markets/aave"));
const reserveConfigs = __importStar(require("../../markets/aave/reservesConfigs"));
const contracts_getters_1 = require("./../../helpers/contracts-getters");
const contracts_deployments_1 = require("./../../helpers/contracts-deployments");
const misc_utils_1 = require("../../helpers/misc-utils");
const constants_1 = require("./../../helpers/constants");
const LENDING_POOL_ADDRESS_PROVIDER = {
    main: '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
    kovan: '0x652B2937Efd0B5beA1c8d54293FC1289672AFC6b',
};
const isSymbolValid = (symbol, network) => Object.keys(reserveConfigs).includes('strategy' + symbol) &&
    marketConfigs.AaveConfig.ReserveAssets[network][symbol] &&
    marketConfigs.AaveConfig.ReservesConfig[symbol] === reserveConfigs['strategy' + symbol];
(0, config_1.task)('external:deploy-new-asset', 'Deploy A token, Debt Tokens, Risk Parameters')
    .addParam('symbol', `Asset symbol, needs to have configuration ready`)
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify, symbol }, localBRE) => {
    const network = localBRE.network.name;
    if (!isSymbolValid(symbol, network)) {
        throw new Error(`
WRONG RESERVE ASSET SETUP:
        The symbol ${symbol} has no reserve Config and/or reserve Asset setup.
        update /markets/aave/index.ts and add the asset address for ${network} network
        update /markets/aave/reservesConfigs.ts and add parameters for ${symbol}
        `);
    }
    (0, misc_utils_1.setDRE)(localBRE);
    const strategyParams = reserveConfigs['strategy' + symbol];
    const reserveAssetAddress = marketConfigs.AaveConfig.ReserveAssets[localBRE.network.name][symbol];
    const deployCustomAToken = (0, contracts_deployments_1.chooseATokenDeployment)(strategyParams.aTokenImpl);
    const addressProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)(LENDING_POOL_ADDRESS_PROVIDER[network]);
    const poolAddress = await addressProvider.getLendingPool();
    const aToken = await deployCustomAToken(verify);
    const stableDebt = await (0, contracts_deployments_1.deployStableDebtToken)([
        poolAddress,
        reserveAssetAddress,
        constants_1.ZERO_ADDRESS,
        `Aave stable debt bearing ${symbol}`,
        `stableDebt${symbol}`,
    ], verify);
    const variableDebt = await (0, contracts_deployments_1.deployVariableDebtToken)([
        poolAddress,
        reserveAssetAddress,
        constants_1.ZERO_ADDRESS,
        `Aave variable debt bearing ${symbol}`,
        `variableDebt${symbol}`,
    ], verify);
    const rates = await (0, contracts_deployments_1.deployDefaultReserveInterestRateStrategy)([
        addressProvider.address,
        strategyParams.strategy.optimalUtilizationRate,
        strategyParams.strategy.baseVariableBorrowRate,
        strategyParams.strategy.variableRateSlope1,
        strategyParams.strategy.variableRateSlope2,
        strategyParams.strategy.stableRateSlope1,
        strategyParams.strategy.stableRateSlope2,
    ], verify);
    console.log(`
    New interest bearing asset deployed on ${network}:
    Interest bearing a${symbol} address: ${aToken.address}
    Variable Debt variableDebt${symbol} address: ${variableDebt.address}
    Stable Debt stableDebt${symbol} address: ${stableDebt.address}
    Strategy Implementation for ${symbol} address: ${rates.address}
    `);
});
