"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReserveAddressFromSymbol = exports.getUserData = exports.getReserveData = void 0;
const contracts_getters_1 = require("../../../../helpers/contracts-getters");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const misc_utils_1 = require("../../../../helpers/misc-utils");
const getReserveData = async (helper, reserve, tranche) => {
    const [reserveData, tokenAddresses, rateOracle, token] = await Promise.all([
        helper.getReserveData(reserve, tranche),
        helper.getReserveTokensAddresses(reserve, tranche),
        (0, contracts_getters_1.getLendingRateOracle)(),
        (0, contracts_getters_1.getIErc20Detailed)(reserve),
    ]);
    const stableDebtToken = await (0, contracts_getters_1.getStableDebtToken)(tokenAddresses.stableDebtTokenAddress);
    const variableDebtToken = await (0, contracts_getters_1.getVariableDebtToken)(tokenAddresses.variableDebtTokenAddress);
    const { 0: principalStableDebt } = await stableDebtToken.getSupplyData();
    const totalStableDebtLastUpdated = await stableDebtToken.getTotalSupplyLastUpdated();
    const scaledVariableDebt = await variableDebtToken.scaledTotalSupply();
    const rate = (await rateOracle.getMarketBorrowRate(reserve)).toString();
    const symbol = await token.symbol();
    const decimals = new bignumber_js_1.default(await token.decimals());
    const totalLiquidity = new bignumber_js_1.default(reserveData.availableLiquidity.toString())
        .plus(reserveData.totalStableDebt.toString())
        .plus(reserveData.totalVariableDebt.toString());
    const utilizationRate = new bignumber_js_1.default(totalLiquidity.eq(0)
        ? 0
        : new bignumber_js_1.default(reserveData.totalStableDebt.toString())
            .plus(reserveData.totalVariableDebt.toString())
            .rayDiv(totalLiquidity));
    return {
        totalLiquidity,
        utilizationRate,
        availableLiquidity: new bignumber_js_1.default(reserveData.availableLiquidity.toString()),
        totalStableDebt: new bignumber_js_1.default(reserveData.totalStableDebt.toString()),
        totalVariableDebt: new bignumber_js_1.default(reserveData.totalVariableDebt.toString()),
        liquidityRate: new bignumber_js_1.default(reserveData.liquidityRate.toString()),
        variableBorrowRate: new bignumber_js_1.default(reserveData.variableBorrowRate.toString()),
        stableBorrowRate: new bignumber_js_1.default(reserveData.stableBorrowRate.toString()),
        averageStableBorrowRate: new bignumber_js_1.default(reserveData.averageStableBorrowRate.toString()),
        liquidityIndex: new bignumber_js_1.default(reserveData.liquidityIndex.toString()),
        variableBorrowIndex: new bignumber_js_1.default(reserveData.variableBorrowIndex.toString()),
        lastUpdateTimestamp: new bignumber_js_1.default(reserveData.lastUpdateTimestamp),
        totalStableDebtLastUpdated: new bignumber_js_1.default(totalStableDebtLastUpdated),
        principalStableDebt: new bignumber_js_1.default(principalStableDebt.toString()),
        scaledVariableDebt: new bignumber_js_1.default(scaledVariableDebt.toString()),
        address: reserve,
        aTokenAddress: tokenAddresses.aTokenAddress,
        symbol,
        decimals,
        marketStableRate: new bignumber_js_1.default(rate),
    };
};
exports.getReserveData = getReserveData;
const getUserData = async (pool, helper, reserve, tranche, user, sender) => {
    const [userData, scaledATokenBalance] = await Promise.all([
        helper.getUserReserveData(reserve, tranche, user),
        getATokenUserData(reserve, tranche, user, helper),
    ]);
    const token = await (0, contracts_getters_1.getMintableERC20)(reserve);
    const walletBalance = new bignumber_js_1.default((await token.balanceOf(sender || user)).toString());
    return {
        scaledATokenBalance: new bignumber_js_1.default(scaledATokenBalance),
        currentATokenBalance: new bignumber_js_1.default(userData.currentATokenBalance.toString()),
        currentStableDebt: new bignumber_js_1.default(userData.currentStableDebt.toString()),
        currentVariableDebt: new bignumber_js_1.default(userData.currentVariableDebt.toString()),
        principalStableDebt: new bignumber_js_1.default(userData.principalStableDebt.toString()),
        scaledVariableDebt: new bignumber_js_1.default(userData.scaledVariableDebt.toString()),
        stableBorrowRate: new bignumber_js_1.default(userData.stableBorrowRate.toString()),
        liquidityRate: new bignumber_js_1.default(userData.liquidityRate.toString()),
        usageAsCollateralEnabled: userData.usageAsCollateralEnabled,
        stableRateLastUpdated: new bignumber_js_1.default(userData.stableRateLastUpdated.toString()),
        walletBalance,
    };
};
exports.getUserData = getUserData;
const getReserveAddressFromSymbol = async (symbol) => {
    //console.log("DB: ",await getDb().get(`${symbol}.${DRE.network.name}`).value())
    const token = await (0, contracts_getters_1.getMintableERC20)((await (0, misc_utils_1.getDb)().get(`${symbol}.${misc_utils_1.DRE.network.name}`).value()).address);
    if (!token) {
        throw `Could not find instance for contract ${symbol}`;
    }
    return token.address;
};
exports.getReserveAddressFromSymbol = getReserveAddressFromSymbol;
const getATokenUserData = async (reserve, tranche, user, helpersContract) => {
    const aTokenAddress = (await helpersContract.getReserveTokensAddresses(reserve, tranche)).aTokenAddress;
    const aToken = await (0, contracts_getters_1.getAToken)(aTokenAddress);
    const scaledBalance = await aToken.scaledBalanceOf(user);
    return scaledBalance.toString();
};
//# sourceMappingURL=helpers.js.map