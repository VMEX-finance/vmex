"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployWETHGateway = exports.deployATokensAndRatesHelper = exports.deployStableAndVariableTokensHelper = exports.deployMockTokens = exports.deployAllMockTokens = exports.deployDelegationAwareATokenImpl = exports.deployDelegationAwareAToken = exports.deployGenericATokenImpl = exports.deployGenericAToken = exports.deployGenericVariableDebtToken = exports.deployGenericStableDebtToken = exports.deployVariableDebtToken = exports.deployStableDebtToken = exports.deployDefaultReserveInterestRateStrategy = exports.deployMintableDelegationERC20 = exports.deployMintableERC20 = exports.deployAaveProtocolDataProvider = exports.deployWalletBalancerProvider = exports.deployMockFlashLoanReceiver = exports.deployInitializableAdminUpgradeabilityProxy = exports.deployCurveOracleWrapper = exports.deployCurveOracle = exports.deployCurveLibraries = exports.deployConvexBaseRewardPool = exports.deployConvexBooster = exports.deployTricrypto2Strategy = exports.deployStrategyLibraries = exports.deployvStrategyHelper = exports.deployvMath = exports.deployLendingPoolCollateralManager = exports.deployAaveOracle = exports.deployMockAggregator = exports.deployLendingRateOracle = exports.deployPriceOracle = exports.deployLendingPool = exports.deployAaveLibraries = exports.deployDepositWithdrawLogic = exports.deployValidationLogic = exports.deployGenericLogic = exports.deployReserveLogicLibrary = exports.deployLendingPoolConfigurator = exports.deployConfiguratorLibraries = exports.deployATokenDeployer = exports.deployLendingPoolAddressesProviderRegistry = exports.deployLendingPoolAddressesProvider = exports.deployUiPoolDataProvider = exports.deployUiPoolDataProviderV2V3 = exports.deployUiPoolDataProviderV2 = exports.deployUiIncentiveDataProviderV2V3 = exports.deployUiIncentiveDataProviderV2 = void 0;
exports.deployParaSwapLiquiditySwapAdapter = exports.deployMockParaSwapAugustusRegistry = exports.deployMockParaSwapAugustus = exports.deployRateStrategy = exports.deployATokenImplementations = exports.chooseATokenDeployment = exports.deployFlashLiquidationAdapter = exports.deployUniswapRepayAdapter = exports.deployUniswapLiquiditySwapAdapter = exports.deployMockUniswapRouter = exports.deploySelfdestructTransferMock = exports.deployMockAToken = exports.deployMockVariableDebtToken = exports.deployWETHMocked = exports.deployMockStableDebtToken = exports.authorizeWETHGateway = void 0;
const misc_utils_1 = require("./misc-utils");
const types_1 = require("./types");
const configuration_1 = require("./configuration");
const contracts_getters_1 = require("./contracts-getters");
const types_2 = require("../types");
const contracts_helpers_1 = require("./contracts-helpers");
const StableAndVariableTokensHelperFactory_1 = require("../types/StableAndVariableTokensHelperFactory");
const plugins_1 = require("@nomiclabs/buidler/plugins");
const deployUiIncentiveDataProviderV2 = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.UiIncentiveDataProviderV2Factory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.UiIncentiveDataProviderV2, [], verify);
exports.deployUiIncentiveDataProviderV2 = deployUiIncentiveDataProviderV2;
const deployUiIncentiveDataProviderV2V3 = async (verify) => {
    const id = types_1.eContractid.UiIncentiveDataProviderV2V3;
    const instance = await (0, contracts_helpers_1.deployContract)(id, []);
    if (verify) {
        await (0, contracts_helpers_1.verifyContract)(id, instance, []);
    }
    return instance;
};
exports.deployUiIncentiveDataProviderV2V3 = deployUiIncentiveDataProviderV2V3;
const deployUiPoolDataProviderV2 = async (chainlinkAggregatorProxy, chainlinkEthUsdAggregatorProxy, verify) => {
    console.log("aggregator: ", chainlinkAggregatorProxy);
    console.log("chainlinkEthUsdAggregatorProxy: ", chainlinkEthUsdAggregatorProxy);
    return (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.UiPoolDataProviderV2Factory(await (0, contracts_getters_1.getFirstSigner)()).deploy(chainlinkAggregatorProxy, chainlinkEthUsdAggregatorProxy), types_1.eContractid.UiPoolDataProvider, [chainlinkAggregatorProxy, chainlinkEthUsdAggregatorProxy], verify);
};
exports.deployUiPoolDataProviderV2 = deployUiPoolDataProviderV2;
const deployUiPoolDataProviderV2V3 = async (chainlinkAggregatorProxy, chainlinkEthUsdAggregatorProxy, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.UiPoolDataProviderV2V3Factory(await (0, contracts_getters_1.getFirstSigner)()).deploy(chainlinkAggregatorProxy, chainlinkEthUsdAggregatorProxy), types_1.eContractid.UiPoolDataProvider, [chainlinkAggregatorProxy, chainlinkEthUsdAggregatorProxy], verify);
exports.deployUiPoolDataProviderV2V3 = deployUiPoolDataProviderV2V3;
const deployUiPoolDataProvider = async ([incentivesController, aaveOracle], verify) => {
    const id = types_1.eContractid.UiPoolDataProvider;
    const args = [incentivesController, aaveOracle];
    const instance = await (0, contracts_helpers_1.deployContract)(id, args);
    if (verify) {
        await (0, contracts_helpers_1.verifyContract)(id, instance, args);
    }
    return instance;
};
exports.deployUiPoolDataProvider = deployUiPoolDataProvider;
const readArtifact = async (id) => {
    if (misc_utils_1.DRE.network.name === types_1.eEthereumNetwork.buidlerevm) {
        return (0, plugins_1.readArtifact)(misc_utils_1.DRE.config.paths.artifacts, id);
    }
    return misc_utils_1.DRE.artifacts.readArtifact(id);
};
const deployLendingPoolAddressesProvider = async (marketId, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.LendingPoolAddressesProviderFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(marketId), types_1.eContractid.LendingPoolAddressesProvider, [marketId], verify);
exports.deployLendingPoolAddressesProvider = deployLendingPoolAddressesProvider;
const deployLendingPoolAddressesProviderRegistry = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.LendingPoolAddressesProviderRegistryFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.LendingPoolAddressesProviderRegistry, [], verify);
exports.deployLendingPoolAddressesProviderRegistry = deployLendingPoolAddressesProviderRegistry;
const deployATokenDeployer = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.DeployATokensFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.ReserveLogic, [], verify);
exports.deployATokenDeployer = deployATokenDeployer;
const deployConfiguratorLibraries = async (verify) => {
    const atokendeployer = await (0, exports.deployATokenDeployer)(verify);
    // Hardcoded solidity placeholders, if any library changes path this will fail.
    // The '__$PLACEHOLDER$__ can be calculated via solidity keccak, but the LendingPoolLibraryAddresses Type seems to
    // require a hardcoded string.
    //
    //  how-to:
    //  1. PLACEHOLDER = solidityKeccak256(['string'], `${libPath}:${libName}`).slice(2, 36)
    //  2. LIB_PLACEHOLDER = `__$${PLACEHOLDER}$__`
    // or grab placeholdes from LendingPoolLibraryAddresses at Typechain generation.
    //
    // libPath example: contracts/libraries/logic/GenericLogic.sol
    // libName example: GenericLogic
    // f1f6c0540507d7a73571ad55dbacf4a67d
    return {
        ["__$1a4ab84be2d7625b6f21850c42bc00346a$__"]: atokendeployer.address,
    };
};
exports.deployConfiguratorLibraries = deployConfiguratorLibraries;
const deployLendingPoolConfigurator = async (verify) => {
    const libraries = await (0, exports.deployConfiguratorLibraries)(verify);
    const lendingPoolConfiguratorImpl = await new types_2.LendingPoolConfiguratorFactory(libraries, await (0, contracts_getters_1.getFirstSigner)()).deploy();
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.LendingPoolConfiguratorImpl, lendingPoolConfiguratorImpl.address);
    return (0, contracts_helpers_1.withSaveAndVerify)(lendingPoolConfiguratorImpl, types_1.eContractid.LendingPoolConfigurator, [], verify);
};
exports.deployLendingPoolConfigurator = deployLendingPoolConfigurator;
const deployReserveLogicLibrary = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.ReserveLogicFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.ReserveLogic, [], verify);
exports.deployReserveLogicLibrary = deployReserveLogicLibrary;
const deployGenericLogic = async (reserveLogic, verify) => {
    const genericLogicArtifact = await readArtifact(types_1.eContractid.GenericLogic);
    const linkedGenericLogicByteCode = (0, contracts_helpers_1.linkBytecode)(genericLogicArtifact, {
        [types_1.eContractid.ReserveLogic]: reserveLogic.address,
    });
    const genericLogicFactory = await misc_utils_1.DRE.ethers.getContractFactory(genericLogicArtifact.abi, linkedGenericLogicByteCode);
    const genericLogic = await (await genericLogicFactory.connect(await (0, contracts_getters_1.getFirstSigner)()).deploy()).deployed();
    return (0, contracts_helpers_1.withSaveAndVerify)(genericLogic, types_1.eContractid.GenericLogic, [], verify);
};
exports.deployGenericLogic = deployGenericLogic;
const deployValidationLogic = async (reserveLogic, genericLogic, verify) => {
    const validationLogicArtifact = await readArtifact(types_1.eContractid.ValidationLogic);
    const linkedValidationLogicByteCode = (0, contracts_helpers_1.linkBytecode)(validationLogicArtifact, {
        [types_1.eContractid.ReserveLogic]: reserveLogic.address,
        [types_1.eContractid.GenericLogic]: genericLogic.address,
    });
    const validationLogicFactory = await misc_utils_1.DRE.ethers.getContractFactory(validationLogicArtifact.abi, linkedValidationLogicByteCode);
    const validationLogic = await (await validationLogicFactory.connect(await (0, contracts_getters_1.getFirstSigner)()).deploy()).deployed();
    return (0, contracts_helpers_1.withSaveAndVerify)(validationLogic, types_1.eContractid.ValidationLogic, [], verify);
};
exports.deployValidationLogic = deployValidationLogic;
const deployDepositWithdrawLogic = async (reserveLogic, genericLogic, validationLogic, verify) => {
    const depositWithdrawLogicArtifact = await readArtifact(types_1.eContractid.DepositWithdrawLogic);
    const linkedValidationLogicByteCode = (0, contracts_helpers_1.linkBytecode)(depositWithdrawLogicArtifact, {
        [types_1.eContractid.ReserveLogic]: reserveLogic.address,
        [types_1.eContractid.GenericLogic]: genericLogic.address,
        [types_1.eContractid.ValidationLogic]: validationLogic.address,
    });
    const depositWithdrawLogicFactory = await misc_utils_1.DRE.ethers.getContractFactory(depositWithdrawLogicArtifact.abi, linkedValidationLogicByteCode);
    const depositWithdrawLogic = await (await depositWithdrawLogicFactory.connect(await (0, contracts_getters_1.getFirstSigner)()).deploy()).deployed();
    return (0, contracts_helpers_1.withSaveAndVerify)(depositWithdrawLogic, types_1.eContractid.DepositWithdrawLogic, [], verify);
};
exports.deployDepositWithdrawLogic = deployDepositWithdrawLogic;
const deployAaveLibraries = async (verify) => {
    const reserveLogic = await (0, exports.deployReserveLogicLibrary)(verify);
    const genericLogic = await (0, exports.deployGenericLogic)(reserveLogic, verify);
    const validationLogic = await (0, exports.deployValidationLogic)(reserveLogic, genericLogic, verify);
    const depositWithdrawLogic = await (0, exports.deployDepositWithdrawLogic)(reserveLogic, genericLogic, validationLogic, verify);
    // Hardcoded solidity placeholders, if any library changes path this will fail.
    // The '__$PLACEHOLDER$__ can be calculated via solidity keccak, but the LendingPoolLibraryAddresses Type seems to
    // require a hardcoded string.
    //
    //  how-to:
    //  1. PLACEHOLDER = solidityKeccak256(['string'], `${libPath}:${libName}`).slice(2, 36)
    //  2. LIB_PLACEHOLDER = `__$${PLACEHOLDER}$__`
    // or grab placeholdes from LendingPoolLibraryAddresses at Typechain generation.
    //
    // libPath example: contracts/libraries/logic/GenericLogic.sol
    // libName example: GenericLogic
    // f1f6c0540507d7a73571ad55dbacf4a67d
    return {
        ["__$de8c0cf1a7d7c36c802af9a64fb9d86036$__"]: validationLogic.address,
        ["__$22cd43a9dda9ce44e9b92ba393b88fb9ac$__"]: reserveLogic.address,
        ["__$f1f6c0540507d7a73571ad55dbacf4a67d$__"]: depositWithdrawLogic.address,
    };
};
exports.deployAaveLibraries = deployAaveLibraries;
const deployLendingPool = async (verify) => {
    const libraries = await (0, exports.deployAaveLibraries)(verify);
    const lendingPoolImpl = await new types_2.LendingPoolFactory(libraries, await (0, contracts_getters_1.getFirstSigner)()).deploy();
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.LendingPoolImpl, lendingPoolImpl.address);
    return (0, contracts_helpers_1.withSaveAndVerify)(lendingPoolImpl, types_1.eContractid.LendingPool, [], verify);
};
exports.deployLendingPool = deployLendingPool;
const deployPriceOracle = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.PriceOracleFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.PriceOracle, [], verify);
exports.deployPriceOracle = deployPriceOracle;
const deployLendingRateOracle = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.LendingRateOracleFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.LendingRateOracle, [], verify);
exports.deployLendingRateOracle = deployLendingRateOracle;
const deployMockAggregator = async (price, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MockAggregatorFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(price), types_1.eContractid.MockAggregator, [price], verify);
exports.deployMockAggregator = deployMockAggregator;
const deployAaveOracle = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.AaveOracleFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.AaveOracle, args, verify);
exports.deployAaveOracle = deployAaveOracle;
const deployLendingPoolCollateralManager = async (verify) => {
    const collateralManagerImpl = await new types_2.LendingPoolCollateralManagerFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy();
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.LendingPoolCollateralManagerImpl, collateralManagerImpl.address);
    return (0, contracts_helpers_1.withSaveAndVerify)(collateralManagerImpl, types_1.eContractid.LendingPoolCollateralManager, [], verify);
};
exports.deployLendingPoolCollateralManager = deployLendingPoolCollateralManager;
const deployvMath = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.VMathFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.vMath, [], verify);
exports.deployvMath = deployvMath;
const deployvStrategyHelper = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.VStrategyHelperFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.vStrategyHelper, [], verify);
exports.deployvStrategyHelper = deployvStrategyHelper;
const deployStrategyLibraries = async (verify) => {
    // TODO: pull this out of db instead
    // const vMath = getContractAddressWithJsonFallback(eContractid.vMath, DRE.network.name);
    const vStrategyHelper = await (0, exports.deployvStrategyHelper)();
    return {
        ["__$7512de7f1b86abca670bc1676b640da4fd$__"]: vStrategyHelper.address,
    };
};
exports.deployStrategyLibraries = deployStrategyLibraries;
const deployTricrypto2Strategy = async (verify) => {
    const libraries = await (0, exports.deployStrategyLibraries)(verify);
    const tricrypto2StrategyImpl = await new types_2.CrvLpStrategyFactory(libraries, await (0, contracts_getters_1.getFirstSigner)()).deploy();
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.tricrypto2Strategy, tricrypto2StrategyImpl.address);
    return (0, contracts_helpers_1.withSaveAndVerify)(tricrypto2StrategyImpl, types_1.eContractid.tricrypto2Strategy, [], verify);
};
exports.deployTricrypto2Strategy = deployTricrypto2Strategy;
const deployConvexBooster = async (verify) => {
    return await (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.BoosterFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.Booster, [], verify);
};
exports.deployConvexBooster = deployConvexBooster;
const deployConvexBaseRewardPool = async (verify) => {
    return await (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.BaseRewardPoolFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.BaseRewardPool, [], verify);
};
exports.deployConvexBaseRewardPool = deployConvexBaseRewardPool;
const deployCurveLibraries = async (verify) => {
    const vMath = await (0, exports.deployvMath)(verify);
    return {
        ["__$fc961522ee25e21dc45bf9241cf35e1d80$__"]: vMath.address,
    };
};
exports.deployCurveLibraries = deployCurveLibraries;
const deployCurveOracle = async (verify) => {
    const libraries = await (0, exports.deployCurveLibraries)(verify);
    const curveOracleImpl = await new types_2.CurveOracleV2Factory(libraries, await (0, contracts_getters_1.getFirstSigner)()).deploy();
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.CurveOracle, curveOracleImpl.address);
    return (0, contracts_helpers_1.withSaveAndVerify)(curveOracleImpl, types_1.eContractid.CurveOracle, [], verify);
};
exports.deployCurveOracle = deployCurveOracle;
const deployCurveOracleWrapper = async (addressProvider, fallbackOracle, baseCurrency, baseCurrencyUnit, verify) => {
    const curveOracleWrapper = await new types_2.CurveWrapperFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(addressProvider, fallbackOracle, baseCurrency, baseCurrencyUnit);
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.CurveWrapper, curveOracleWrapper.address);
    return (0, contracts_helpers_1.withSaveAndVerify)(curveOracleWrapper, types_1.eContractid.CurveWrapper, [], verify);
};
exports.deployCurveOracleWrapper = deployCurveOracleWrapper;
const deployInitializableAdminUpgradeabilityProxy = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.InitializableAdminUpgradeabilityProxyFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.InitializableAdminUpgradeabilityProxy, [], verify);
exports.deployInitializableAdminUpgradeabilityProxy = deployInitializableAdminUpgradeabilityProxy;
const deployMockFlashLoanReceiver = async (addressesProvider, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MockFlashLoanReceiverFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(addressesProvider), types_1.eContractid.MockFlashLoanReceiver, [addressesProvider], verify);
exports.deployMockFlashLoanReceiver = deployMockFlashLoanReceiver;
const deployWalletBalancerProvider = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.WalletBalanceProviderFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.WalletBalanceProvider, [], verify);
exports.deployWalletBalancerProvider = deployWalletBalancerProvider;
const deployAaveProtocolDataProvider = async (addressesProvider, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.AaveProtocolDataProviderFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(addressesProvider), types_1.eContractid.AaveProtocolDataProvider, [addressesProvider], verify);
exports.deployAaveProtocolDataProvider = deployAaveProtocolDataProvider;
const deployMintableERC20 = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MintableERC20Factory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.MintableERC20, args, verify);
exports.deployMintableERC20 = deployMintableERC20;
const deployMintableDelegationERC20 = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MintableDelegationERC20Factory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.MintableDelegationERC20, args, verify);
exports.deployMintableDelegationERC20 = deployMintableDelegationERC20;
const deployDefaultReserveInterestRateStrategy = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.DefaultReserveInterestRateStrategyFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.DefaultReserveInterestRateStrategy, args, verify);
exports.deployDefaultReserveInterestRateStrategy = deployDefaultReserveInterestRateStrategy;
const deployStableDebtToken = async (args, verify) => {
    const instance = await (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.StableDebtTokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.StableDebtToken, [], verify);
    await instance.initialize(args[0], args[1], 0, //set tranche to zero for now
    args[2], "18", args[3], args[4], "0x10");
    return instance;
};
exports.deployStableDebtToken = deployStableDebtToken;
const deployVariableDebtToken = async (args, verify) => {
    const instance = await (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.VariableDebtTokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.VariableDebtToken, [], verify);
    await instance.initialize(args[0], args[1], 0, //set tranche to zero for now
    args[2], "18", args[3], args[4], "0x10");
    return instance;
};
exports.deployVariableDebtToken = deployVariableDebtToken;
const deployGenericStableDebtToken = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.StableDebtTokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.StableDebtToken, [], verify);
exports.deployGenericStableDebtToken = deployGenericStableDebtToken;
const deployGenericVariableDebtToken = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.VariableDebtTokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.VariableDebtToken, [], verify);
exports.deployGenericVariableDebtToken = deployGenericVariableDebtToken;
const deployGenericAToken = async ([poolAddress, underlyingAssetAddress, treasuryAddress, incentivesController, name, symbol,], verify) => {
    const instance = await (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.ATokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.AToken, [], verify);
    await instance.initialize(poolAddress, {
        treasury: treasuryAddress,
        underlyingAsset: underlyingAssetAddress,
        tranche: 0,
    }, //set tranche to zero for now
    incentivesController, "18", name, symbol, "0x10");
    return instance;
};
exports.deployGenericAToken = deployGenericAToken;
const deployGenericATokenImpl = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.ATokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.AToken, [], verify);
exports.deployGenericATokenImpl = deployGenericATokenImpl;
const deployDelegationAwareAToken = async ([pool, underlyingAssetAddress, treasuryAddress, incentivesController, name, symbol,], verify) => {
    const instance = await (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.DelegationAwareATokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.DelegationAwareAToken, [], verify);
    await instance.initialize(pool, {
        treasury: treasuryAddress,
        underlyingAsset: underlyingAssetAddress,
        tranche: 0,
    }, //set tranche to zero for now
    incentivesController, "18", name, symbol, "0x10");
    return instance;
};
exports.deployDelegationAwareAToken = deployDelegationAwareAToken;
const deployDelegationAwareATokenImpl = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.DelegationAwareATokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.DelegationAwareAToken, [], verify);
exports.deployDelegationAwareATokenImpl = deployDelegationAwareATokenImpl;
const deployAllMockTokens = async (verify) => {
    const tokens = {};
    const protoConfigData = (0, configuration_1.getReservesConfigByPool)(types_1.AavePools.proto);
    for (const tokenSymbol of Object.keys(types_1.TokenContractId)) {
        let decimals = "18";
        let configData = protoConfigData[tokenSymbol];
        tokens[tokenSymbol] = await (0, exports.deployMintableERC20)([
            tokenSymbol,
            tokenSymbol,
            configData ? configData.reserveDecimals : decimals,
        ], verify);
        await (0, contracts_helpers_1.registerContractInJsonDb)(tokenSymbol.toUpperCase(), tokens[tokenSymbol]);
    }
    return tokens;
};
exports.deployAllMockTokens = deployAllMockTokens;
const deployMockTokens = async (config, verify) => {
    const tokens = {};
    const defaultDecimals = 18;
    const configData = config.ReservesConfig;
    for (const tokenSymbol of Object.keys(configData)) {
        tokens[tokenSymbol] = await (0, exports.deployMintableERC20)([
            tokenSymbol,
            tokenSymbol,
            configData[tokenSymbol]
                .reserveDecimals || defaultDecimals.toString(),
        ], verify);
        await (0, contracts_helpers_1.registerContractInJsonDb)(tokenSymbol.toUpperCase(), tokens[tokenSymbol]);
    }
    return tokens;
};
exports.deployMockTokens = deployMockTokens;
const deployStableAndVariableTokensHelper = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new StableAndVariableTokensHelperFactory_1.StableAndVariableTokensHelperFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.StableAndVariableTokensHelper, args, verify);
exports.deployStableAndVariableTokensHelper = deployStableAndVariableTokensHelper;
const deployATokensAndRatesHelper = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.ATokensAndRatesHelperFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.ATokensAndRatesHelper, args, verify);
exports.deployATokensAndRatesHelper = deployATokensAndRatesHelper;
const deployWETHGateway = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.WETHGatewayFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.WETHGateway, args, verify);
exports.deployWETHGateway = deployWETHGateway;
const authorizeWETHGateway = async (wethGateWay, lendingPool) => await new types_2.WETHGatewayFactory(await (0, contracts_getters_1.getFirstSigner)())
    .attach(wethGateWay)
    .authorizeLendingPool(lendingPool);
exports.authorizeWETHGateway = authorizeWETHGateway;
const deployMockStableDebtToken = async (args, verify) => {
    const instance = await (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MockStableDebtTokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.MockStableDebtToken, [], verify);
    await instance.initialize(args[0], args[1], 0, args[2], "18", args[3], args[4], args[5]);
    return instance;
};
exports.deployMockStableDebtToken = deployMockStableDebtToken;
const deployWETHMocked = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.WETH9MockedFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.WETHMocked, [], verify);
exports.deployWETHMocked = deployWETHMocked;
const deployMockVariableDebtToken = async (args, verify) => {
    const instance = await (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MockVariableDebtTokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.MockVariableDebtToken, [], verify);
    await instance.initialize(args[0], args[1], 0, args[2], "18", args[3], args[4], args[5]);
    return instance;
};
exports.deployMockVariableDebtToken = deployMockVariableDebtToken;
const deployMockAToken = async (args, verify) => {
    const instance = await (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MockATokenFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.MockAToken, [], verify);
    await instance.initialize(args[0], { treasury: args[2], underlyingAsset: args[1], tranche: 0 }, //set tranche to zero for now
    args[3], "18", args[4], args[5], args[6]);
    return instance;
};
exports.deployMockAToken = deployMockAToken;
const deploySelfdestructTransferMock = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.SelfdestructTransferFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.SelfdestructTransferMock, [], verify);
exports.deploySelfdestructTransferMock = deploySelfdestructTransferMock;
const deployMockUniswapRouter = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MockUniswapV2Router02Factory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.MockUniswapV2Router02, [], verify);
exports.deployMockUniswapRouter = deployMockUniswapRouter;
const deployUniswapLiquiditySwapAdapter = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.UniswapLiquiditySwapAdapterFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.UniswapLiquiditySwapAdapter, args, verify);
exports.deployUniswapLiquiditySwapAdapter = deployUniswapLiquiditySwapAdapter;
const deployUniswapRepayAdapter = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.UniswapRepayAdapterFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.UniswapRepayAdapter, args, verify);
exports.deployUniswapRepayAdapter = deployUniswapRepayAdapter;
const deployFlashLiquidationAdapter = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.FlashLiquidationAdapterFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.FlashLiquidationAdapter, args, verify);
exports.deployFlashLiquidationAdapter = deployFlashLiquidationAdapter;
const chooseATokenDeployment = (id) => {
    switch (id) {
        case types_1.eContractid.AToken:
            return exports.deployGenericATokenImpl;
        case types_1.eContractid.DelegationAwareAToken:
            return exports.deployDelegationAwareATokenImpl;
        default:
            throw Error(`Missing aToken implementation deployment script for: ${id}`);
    }
};
exports.chooseATokenDeployment = chooseATokenDeployment;
const deployATokenImplementations = async (pool, reservesConfig, verify = false) => {
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const network = misc_utils_1.DRE.network.name;
    // Obtain the different AToken implementations of all reserves inside the Market config
    const aTokenImplementations = [
        ...Object.entries(reservesConfig).reduce((acc, [, entry]) => {
            acc.add(entry.aTokenImpl);
            return acc;
        }, new Set()),
    ];
    for (let x = 0; x < aTokenImplementations.length; x++) {
        const aTokenAddress = (0, contracts_helpers_1.getOptionalParamAddressPerNetwork)(poolConfig[aTokenImplementations[x].toString()], network);
        if (!(0, misc_utils_1.notFalsyOrZeroAddress)(aTokenAddress)) {
            const deployImplementationMethod = (0, exports.chooseATokenDeployment)(aTokenImplementations[x]);
            console.log(`Deploying implementation`, aTokenImplementations[x]);
            await deployImplementationMethod(verify);
        }
    }
    // Debt tokens, for now all Market configs follows same implementations
    const genericStableDebtTokenAddress = (0, contracts_helpers_1.getOptionalParamAddressPerNetwork)(poolConfig.StableDebtTokenImplementation, network);
    const geneticVariableDebtTokenAddress = (0, contracts_helpers_1.getOptionalParamAddressPerNetwork)(poolConfig.VariableDebtTokenImplementation, network);
    if (!(0, misc_utils_1.notFalsyOrZeroAddress)(genericStableDebtTokenAddress)) {
        await (0, exports.deployGenericStableDebtToken)(verify);
    }
    if (!(0, misc_utils_1.notFalsyOrZeroAddress)(geneticVariableDebtTokenAddress)) {
        await (0, exports.deployGenericVariableDebtToken)(verify);
    }
};
exports.deployATokenImplementations = deployATokenImplementations;
const deployRateStrategy = async (strategyName, args, verify) => {
    switch (strategyName) {
        default:
            return await (await (0, exports.deployDefaultReserveInterestRateStrategy)(args, verify)).address;
    }
};
exports.deployRateStrategy = deployRateStrategy;
const deployMockParaSwapAugustus = async (verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MockParaSwapAugustusFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(), types_1.eContractid.MockParaSwapAugustus, [], verify);
exports.deployMockParaSwapAugustus = deployMockParaSwapAugustus;
const deployMockParaSwapAugustusRegistry = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.MockParaSwapAugustusRegistryFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.MockParaSwapAugustusRegistry, args, verify);
exports.deployMockParaSwapAugustusRegistry = deployMockParaSwapAugustusRegistry;
const deployParaSwapLiquiditySwapAdapter = async (args, verify) => (0, contracts_helpers_1.withSaveAndVerify)(await new types_2.ParaSwapLiquiditySwapAdapterFactory(await (0, contracts_getters_1.getFirstSigner)()).deploy(...args), types_1.eContractid.ParaSwapLiquiditySwapAdapter, args, verify);
exports.deployParaSwapLiquiditySwapAdapter = deployParaSwapLiquiditySwapAdapter;
//# sourceMappingURL=contracts-deployments.js.map