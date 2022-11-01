"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParaSwapLiquiditySwapAdapter = exports.getMockParaSwapAugustusRegistry = exports.getMockParaSwapAugustus = exports.getFlashLiquidationAdapter = exports.getUniswapRepayAdapter = exports.getUniswapLiquiditySwapAdapter = exports.getMockUniswapRouter = exports.getConvexBooster = exports.getTricrypto2Strategy = exports.getAaveOracle = exports.getAddressById = exports.getLendingPoolCollateralManager = exports.getWalletProvider = exports.getLendingPoolCollateralManagerImpl = exports.getLendingPoolConfiguratorImpl = exports.getLendingPoolImpl = exports.getProxy = exports.getSelfdestructTransferMock = exports.getMockStableDebtToken = exports.getMockVariableDebtToken = exports.getMockAToken = exports.getWETHMocked = exports.getWETHGateway = exports.getATokensAndRatesHelper = exports.getStableAndVariableTokensHelper = exports.getGenericLogic = exports.getReserveLogic = exports.getLendingPoolAddressesProviderRegistry = exports.getPairsTokenAggregator = exports.getQuoteCurrencies = exports.getAllMockedTokens = exports.getMockedTokens = exports.getLendingRateOracle = exports.getMockFlashLoanReceiver = exports.getInterestRateStrategy = exports.getAaveProtocolDataProvider = exports.getIErc20Detailed = exports.getMintableERC20 = exports.getVariableDebtToken = exports.getStableDebtToken = exports.getAToken = exports.getCurvePriceOracleWrapper = exports.getPriceOracle = exports.getLendingPool = exports.getLendingPoolConfiguratorProxy = exports.getLendingPoolAddressesProvider = exports.getEmergencyAdmin = exports.getFirstSigner = void 0;
const types_1 = require("../types");
const IERC20DetailedFactory_1 = require("../types/IERC20DetailedFactory");
const contracts_helpers_1 = require("./contracts-helpers");
const misc_utils_1 = require("./misc-utils");
const types_2 = require("./types");
const getFirstSigner = async () => (await (0, contracts_helpers_1.getEthersSigners)())[0];
exports.getFirstSigner = getFirstSigner;
const getEmergencyAdmin = async () => (await (0, contracts_helpers_1.getEthersSigners)())[1];
exports.getEmergencyAdmin = getEmergencyAdmin;
const getLendingPoolAddressesProvider = async (address) => {
    return await types_1.LendingPoolAddressesProviderFactory.connect(address ||
        (await (0, misc_utils_1.getDb)()
            .get(`${types_2.eContractid.LendingPoolAddressesProvider}.${misc_utils_1.DRE.network.name}`)
            .value()).address, await (0, exports.getFirstSigner)());
};
exports.getLendingPoolAddressesProvider = getLendingPoolAddressesProvider;
const getLendingPoolConfiguratorProxy = async (address) => {
    return await types_1.LendingPoolConfiguratorFactory.connect(address ||
        (await (0, misc_utils_1.getDb)()
            .get(`${types_2.eContractid.LendingPoolConfigurator}.${misc_utils_1.DRE.network.name}`)
            .value()).address, await (0, exports.getFirstSigner)());
};
exports.getLendingPoolConfiguratorProxy = getLendingPoolConfiguratorProxy;
const getLendingPool = async (address) => await types_1.LendingPoolFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.LendingPool}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getLendingPool = getLendingPool;
const getPriceOracle = async (address) => await types_1.PriceOracleFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.PriceOracle}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getPriceOracle = getPriceOracle;
const getCurvePriceOracleWrapper = async (address) => await types_1.CurveWrapperFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.CurveWrapper}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getCurvePriceOracleWrapper = getCurvePriceOracleWrapper;
const getAToken = async (address) => await types_1.ATokenFactory.connect(address ||
    (await (0, misc_utils_1.getDb)().get(`${types_2.eContractid.AToken}.${misc_utils_1.DRE.network.name}`).value()).address, await (0, exports.getFirstSigner)());
exports.getAToken = getAToken;
const getStableDebtToken = async (address) => await types_1.StableDebtTokenFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.StableDebtToken}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getStableDebtToken = getStableDebtToken;
const getVariableDebtToken = async (address) => await types_1.VariableDebtTokenFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.VariableDebtToken}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getVariableDebtToken = getVariableDebtToken;
const getMintableERC20 = async (address) => await types_1.MintableERC20Factory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.MintableERC20}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getMintableERC20 = getMintableERC20;
const getIErc20Detailed = async (address) => await IERC20DetailedFactory_1.IERC20DetailedFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.IERC20Detailed}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getIErc20Detailed = getIErc20Detailed;
const getAaveProtocolDataProvider = async (address) => await types_1.AaveProtocolDataProviderFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.AaveProtocolDataProvider}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getAaveProtocolDataProvider = getAaveProtocolDataProvider;
const getInterestRateStrategy = async (address) => await types_1.DefaultReserveInterestRateStrategyFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.DefaultReserveInterestRateStrategy}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getInterestRateStrategy = getInterestRateStrategy;
const getMockFlashLoanReceiver = async (address) => await types_1.MockFlashLoanReceiverFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.MockFlashLoanReceiver}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getMockFlashLoanReceiver = getMockFlashLoanReceiver;
const getLendingRateOracle = async (address) => await types_1.LendingRateOracleFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.LendingRateOracle}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getLendingRateOracle = getLendingRateOracle;
const getMockedTokens = async (config) => {
    const tokenSymbols = Object.keys(config.ReservesConfig);
    const db = (0, misc_utils_1.getDb)();
    const tokens = await tokenSymbols.reduce(async (acc, tokenSymbol) => {
        const accumulator = await acc;
        const address = db
            .get(`${tokenSymbol.toUpperCase()}.${misc_utils_1.DRE.network.name}`)
            .value().address;
        accumulator[tokenSymbol] = await (0, exports.getMintableERC20)(address);
        return Promise.resolve(acc);
    }, Promise.resolve({}));
    return tokens;
};
exports.getMockedTokens = getMockedTokens;
const getAllMockedTokens = async () => {
    const db = (0, misc_utils_1.getDb)();
    const tokens = await Object.keys(types_2.TokenContractId).reduce(async (acc, tokenSymbol) => {
        const accumulator = await acc;
        const address = db
            .get(`${tokenSymbol.toUpperCase()}.${misc_utils_1.DRE.network.name}`)
            .value().address;
        accumulator[tokenSymbol] = await (0, exports.getMintableERC20)(address);
        return Promise.resolve(acc);
    }, Promise.resolve({}));
    return tokens;
};
exports.getAllMockedTokens = getAllMockedTokens;
const getQuoteCurrencies = (oracleQuoteCurrency) => {
    switch (oracleQuoteCurrency) {
        case "USD":
            return ["USD"];
        case "ETH":
        case "WETH":
        default:
            return ["ETH", "WETH"];
    }
};
exports.getQuoteCurrencies = getQuoteCurrencies;
const getPairsTokenAggregator = (allAssetsAddresses, aggregatorsAddresses, oracleQuoteCurrency) => {
    const assetsWithoutQuoteCurrency = (0, misc_utils_1.omit)(allAssetsAddresses, (0, exports.getQuoteCurrencies)(oracleQuoteCurrency));
    const pairs = Object.entries(assetsWithoutQuoteCurrency).map(([tokenSymbol, tokenAddress]) => {
        //if (true/*tokenSymbol !== 'WETH' && tokenSymbol !== 'ETH' && tokenSymbol !== 'LpWETH'*/) {
        const aggregatorAddressIndex = Object.keys(aggregatorsAddresses).findIndex((value) => value === tokenSymbol);
        const [, aggregatorAddress] = Object.entries(aggregatorsAddresses)[aggregatorAddressIndex];
        return [tokenAddress, aggregatorAddress];
        //}
    });
    const mappedPairs = pairs.map(([asset]) => asset);
    const mappedAggregators = pairs.map(([, source]) => source);
    return [mappedPairs, mappedAggregators];
};
exports.getPairsTokenAggregator = getPairsTokenAggregator;
const getLendingPoolAddressesProviderRegistry = async (address) => await types_1.LendingPoolAddressesProviderRegistryFactory.connect((0, misc_utils_1.notFalsyOrZeroAddress)(address)
    ? address
    : (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.LendingPoolAddressesProviderRegistry}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getLendingPoolAddressesProviderRegistry = getLendingPoolAddressesProviderRegistry;
const getReserveLogic = async (address) => await types_1.ReserveLogicFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.ReserveLogic}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getReserveLogic = getReserveLogic;
const getGenericLogic = async (address) => await types_1.GenericLogicFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.GenericLogic}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getGenericLogic = getGenericLogic;
const getStableAndVariableTokensHelper = async (address) => await types_1.StableAndVariableTokensHelperFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.StableAndVariableTokensHelper}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getStableAndVariableTokensHelper = getStableAndVariableTokensHelper;
const getATokensAndRatesHelper = async (address) => await types_1.ATokensAndRatesHelperFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.ATokensAndRatesHelper}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getATokensAndRatesHelper = getATokensAndRatesHelper;
const getWETHGateway = async (address) => await types_1.WETHGatewayFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.WETHGateway}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getWETHGateway = getWETHGateway;
const getWETHMocked = async (address) => await types_1.WETH9MockedFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.WETHMocked}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getWETHMocked = getWETHMocked;
const getMockAToken = async (address) => await types_1.MockATokenFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.MockAToken}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getMockAToken = getMockAToken;
const getMockVariableDebtToken = async (address) => await types_1.MockVariableDebtTokenFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.MockVariableDebtToken}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getMockVariableDebtToken = getMockVariableDebtToken;
const getMockStableDebtToken = async (address) => await types_1.MockStableDebtTokenFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.MockStableDebtToken}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getMockStableDebtToken = getMockStableDebtToken;
const getSelfdestructTransferMock = async (address) => await types_1.SelfdestructTransferFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.SelfdestructTransferMock}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getSelfdestructTransferMock = getSelfdestructTransferMock;
const getProxy = async (address) => await types_1.InitializableAdminUpgradeabilityProxyFactory.connect(address, await (0, exports.getFirstSigner)());
exports.getProxy = getProxy;
const getLendingPoolImpl = async (address) => await types_1.LendingPoolFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.LendingPoolImpl}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getLendingPoolImpl = getLendingPoolImpl;
const getLendingPoolConfiguratorImpl = async (address) => await types_1.LendingPoolConfiguratorFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.LendingPoolConfiguratorImpl}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getLendingPoolConfiguratorImpl = getLendingPoolConfiguratorImpl;
const getLendingPoolCollateralManagerImpl = async (address) => await types_1.LendingPoolCollateralManagerFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.LendingPoolCollateralManagerImpl}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getLendingPoolCollateralManagerImpl = getLendingPoolCollateralManagerImpl;
const getWalletProvider = async (address) => await types_1.WalletBalanceProviderFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.WalletBalanceProvider}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getWalletProvider = getWalletProvider;
const getLendingPoolCollateralManager = async (address) => await types_1.LendingPoolCollateralManagerFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.LendingPoolCollateralManager}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getLendingPoolCollateralManager = getLendingPoolCollateralManager;
const getAddressById = async (id) => {
    var _a;
    return ((_a = (await (0, misc_utils_1.getDb)().get(`${id}.${misc_utils_1.DRE.network.name}`).value())) === null || _a === void 0 ? void 0 : _a.address) ||
        undefined;
};
exports.getAddressById = getAddressById;
const getAaveOracle = async (address) => await types_1.AaveOracleFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.AaveOracle}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getAaveOracle = getAaveOracle;
const getTricrypto2Strategy = async (address) => await types_1.CrvLpStrategyFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.tricrypto2Strategy}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getTricrypto2Strategy = getTricrypto2Strategy;
const getConvexBooster = async (address) => await types_1.BoosterFactory.connect(address ||
    (await (0, misc_utils_1.getDb)().get(`${types_2.eContractid.Booster}.${misc_utils_1.DRE.network.name}`).value()).address, await (0, exports.getFirstSigner)());
exports.getConvexBooster = getConvexBooster;
const getMockUniswapRouter = async (address) => await types_1.MockUniswapV2Router02Factory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.MockUniswapV2Router02}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getMockUniswapRouter = getMockUniswapRouter;
const getUniswapLiquiditySwapAdapter = async (address) => await types_1.UniswapLiquiditySwapAdapterFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.UniswapLiquiditySwapAdapter}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getUniswapLiquiditySwapAdapter = getUniswapLiquiditySwapAdapter;
const getUniswapRepayAdapter = async (address) => await types_1.UniswapRepayAdapterFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.UniswapRepayAdapter}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getUniswapRepayAdapter = getUniswapRepayAdapter;
const getFlashLiquidationAdapter = async (address) => await types_1.FlashLiquidationAdapterFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.FlashLiquidationAdapter}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getFlashLiquidationAdapter = getFlashLiquidationAdapter;
const getMockParaSwapAugustus = async (address) => await types_1.MockParaSwapAugustusFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.MockParaSwapAugustus}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getMockParaSwapAugustus = getMockParaSwapAugustus;
const getMockParaSwapAugustusRegistry = async (address) => await types_1.MockParaSwapAugustusRegistryFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.MockParaSwapAugustusRegistry}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getMockParaSwapAugustusRegistry = getMockParaSwapAugustusRegistry;
const getParaSwapLiquiditySwapAdapter = async (address) => await types_1.ParaSwapLiquiditySwapAdapterFactory.connect(address ||
    (await (0, misc_utils_1.getDb)()
        .get(`${types_2.eContractid.ParaSwapLiquiditySwapAdapter}.${misc_utils_1.DRE.network.name}`)
        .value()).address, await (0, exports.getFirstSigner)());
exports.getParaSwapLiquiditySwapAdapter = getParaSwapLiquiditySwapAdapter;
//# sourceMappingURL=contracts-getters.js.map