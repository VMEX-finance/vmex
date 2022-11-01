import { Contract } from "ethers";
import { tEthereumAddress, eContractid, tStringTokenSmallUnits, IReserveParams, PoolConfiguration } from "./types";
import { MintableERC20 } from "../types/MintableERC20";
import { MockContract } from "ethereum-waffle";
import { ConfigNames } from "./configuration";
import { UiIncentiveDataProviderV2V3 } from "../types";
import { CrvLpStrategyLibraryAddresses } from "../types/CrvLpStrategyFactory";
import { MintableDelegationERC20 } from "../types/MintableDelegationERC20";
import { LendingPoolLibraryAddresses } from "../types/LendingPoolFactory";
import { LendingPoolConfiguratorLibraryAddresses } from "../types/LendingPoolConfiguratorFactory";
import { CurveOracleV2LibraryAddresses } from "../types/CurveOracleV2Factory";
import { UiPoolDataProvider } from "../types";
export declare const deployUiIncentiveDataProviderV2: (verify?: boolean) => Promise<import("../types").UiIncentiveDataProviderV2>;
export declare const deployUiIncentiveDataProviderV2V3: (verify?: boolean) => Promise<UiIncentiveDataProviderV2V3>;
export declare const deployUiPoolDataProviderV2: (chainlinkAggregatorProxy: string, chainlinkEthUsdAggregatorProxy: string, verify?: boolean) => Promise<import("../types").UiPoolDataProviderV2>;
export declare const deployUiPoolDataProviderV2V3: (chainlinkAggregatorProxy: string, chainlinkEthUsdAggregatorProxy: string, verify?: boolean) => Promise<import("../types").UiPoolDataProviderV2V3>;
export declare const deployUiPoolDataProvider: ([incentivesController, aaveOracle]: [tEthereumAddress, tEthereumAddress], verify?: boolean) => Promise<UiPoolDataProvider>;
export declare const deployLendingPoolAddressesProvider: (marketId: string, verify?: boolean) => Promise<import("../types").LendingPoolAddressesProvider>;
export declare const deployLendingPoolAddressesProviderRegistry: (verify?: boolean) => Promise<import("../types").LendingPoolAddressesProviderRegistry>;
export declare const deployATokenDeployer: (verify?: boolean) => Promise<import("../types").DeployATokens>;
export declare const deployConfiguratorLibraries: (verify?: boolean) => Promise<LendingPoolConfiguratorLibraryAddresses>;
export declare const deployLendingPoolConfigurator: (verify?: boolean) => Promise<import("../types").LendingPoolConfigurator>;
export declare const deployReserveLogicLibrary: (verify?: boolean) => Promise<import("../types").ReserveLogic>;
export declare const deployGenericLogic: (reserveLogic: Contract, verify?: boolean) => Promise<any>;
export declare const deployValidationLogic: (reserveLogic: Contract, genericLogic: Contract, verify?: boolean) => Promise<any>;
export declare const deployDepositWithdrawLogic: (reserveLogic: Contract, genericLogic: Contract, validationLogic: Contract, verify?: boolean) => Promise<any>;
export declare const deployAaveLibraries: (verify?: boolean) => Promise<LendingPoolLibraryAddresses>;
export declare const deployLendingPool: (verify?: boolean) => Promise<import("../types").LendingPool>;
export declare const deployPriceOracle: (verify?: boolean) => Promise<import("../types").PriceOracle>;
export declare const deployLendingRateOracle: (verify?: boolean) => Promise<import("../types").LendingRateOracle>;
export declare const deployMockAggregator: (price: tStringTokenSmallUnits, verify?: boolean) => Promise<import("../types").MockAggregator>;
export declare const deployAaveOracle: (args: [
    tEthereumAddress[],
    tEthereumAddress[],
    tEthereumAddress,
    tEthereumAddress,
    string
], verify?: boolean) => Promise<import("../types").AaveOracle>;
export declare const deployLendingPoolCollateralManager: (verify?: boolean) => Promise<import("../types").LendingPoolCollateralManager>;
export declare const deployvMath: (verify?: boolean) => Promise<import("../types").VMath>;
export declare const deployvStrategyHelper: (verify?: boolean) => Promise<any>;
export declare const deployStrategyLibraries: (verify?: boolean) => Promise<CrvLpStrategyLibraryAddresses>;
export declare const deployTricrypto2Strategy: (verify?: boolean) => Promise<any>;
export declare const deployConvexBooster: (verify?: boolean) => Promise<any>;
export declare const deployConvexBaseRewardPool: (verify?: boolean) => Promise<any>;
export declare const deployCurveLibraries: (verify?: boolean) => Promise<CurveOracleV2LibraryAddresses>;
export declare const deployCurveOracle: (verify?: boolean) => Promise<import("../types").CurveOracleV2>;
export declare const deployCurveOracleWrapper: (addressProvider: tEthereumAddress, fallbackOracle: tEthereumAddress, baseCurrency: tEthereumAddress, baseCurrencyUnit: string, verify?: boolean) => Promise<import("../types").CurveWrapper>;
export declare const deployInitializableAdminUpgradeabilityProxy: (verify?: boolean) => Promise<import("../types").InitializableAdminUpgradeabilityProxy>;
export declare const deployMockFlashLoanReceiver: (addressesProvider: tEthereumAddress, verify?: boolean) => Promise<import("../types").MockFlashLoanReceiver>;
export declare const deployWalletBalancerProvider: (verify?: boolean) => Promise<import("../types").WalletBalanceProvider>;
export declare const deployAaveProtocolDataProvider: (addressesProvider: tEthereumAddress, verify?: boolean) => Promise<import("../types").AaveProtocolDataProvider>;
export declare const deployMintableERC20: (args: [string, string, string], verify?: boolean) => Promise<MintableERC20>;
export declare const deployMintableDelegationERC20: (args: [string, string, string], verify?: boolean) => Promise<MintableDelegationERC20>;
export declare const deployDefaultReserveInterestRateStrategy: (args: [tEthereumAddress, string, string, string, string, string, string], verify: boolean) => Promise<import("../types").DefaultReserveInterestRateStrategy>;
export declare const deployStableDebtToken: (args: [tEthereumAddress, tEthereumAddress, tEthereumAddress, string, string], verify: boolean) => Promise<import("../types").StableDebtToken>;
export declare const deployVariableDebtToken: (args: [tEthereumAddress, tEthereumAddress, tEthereumAddress, string, string], verify: boolean) => Promise<import("../types").VariableDebtToken>;
export declare const deployGenericStableDebtToken: (verify?: boolean) => Promise<import("../types").StableDebtToken>;
export declare const deployGenericVariableDebtToken: (verify?: boolean) => Promise<import("../types").VariableDebtToken>;
export declare const deployGenericAToken: ([poolAddress, underlyingAssetAddress, treasuryAddress, incentivesController, name, symbol,]: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string
], verify: boolean) => Promise<import("../types").AToken>;
export declare const deployGenericATokenImpl: (verify: boolean) => Promise<import("../types").AToken>;
export declare const deployDelegationAwareAToken: ([pool, underlyingAssetAddress, treasuryAddress, incentivesController, name, symbol,]: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string
], verify: boolean) => Promise<import("../types").DelegationAwareAToken>;
export declare const deployDelegationAwareATokenImpl: (verify: boolean) => Promise<import("../types").DelegationAwareAToken>;
export declare const deployAllMockTokens: (verify?: boolean) => Promise<{
    [symbol: string]: MintableERC20 | MockContract;
}>;
export declare const deployMockTokens: (config: PoolConfiguration, verify?: boolean) => Promise<{
    [symbol: string]: MintableERC20 | MockContract;
}>;
export declare const deployStableAndVariableTokensHelper: (args: [tEthereumAddress, tEthereumAddress], verify?: boolean) => Promise<import("../types").StableAndVariableTokensHelper>;
export declare const deployATokensAndRatesHelper: (args: [tEthereumAddress, tEthereumAddress, tEthereumAddress, string], verify?: boolean) => Promise<import("../types").ATokensAndRatesHelper>;
export declare const deployWETHGateway: (args: [tEthereumAddress], verify?: boolean) => Promise<import("../types").WETHGateway>;
export declare const authorizeWETHGateway: (wethGateWay: tEthereumAddress, lendingPool: tEthereumAddress) => Promise<import("ethers").ContractTransaction>;
export declare const deployMockStableDebtToken: (args: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    string
], verify?: boolean) => Promise<import("../types").MockStableDebtToken>;
export declare const deployWETHMocked: (verify?: boolean) => Promise<import("../types").WETH9Mocked>;
export declare const deployMockVariableDebtToken: (args: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    string
], verify?: boolean) => Promise<import("../types").MockVariableDebtToken>;
export declare const deployMockAToken: (args: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    string
], verify?: boolean) => Promise<import("../types").MockAToken>;
export declare const deploySelfdestructTransferMock: (verify?: boolean) => Promise<import("../types").SelfdestructTransfer>;
export declare const deployMockUniswapRouter: (verify?: boolean) => Promise<import("../types").MockUniswapV2Router02>;
export declare const deployUniswapLiquiditySwapAdapter: (args: [tEthereumAddress, tEthereumAddress, tEthereumAddress], verify?: boolean) => Promise<import("../types").UniswapLiquiditySwapAdapter>;
export declare const deployUniswapRepayAdapter: (args: [tEthereumAddress, tEthereumAddress, tEthereumAddress], verify?: boolean) => Promise<import("../types").UniswapRepayAdapter>;
export declare const deployFlashLiquidationAdapter: (args: [tEthereumAddress, tEthereumAddress, tEthereumAddress], verify?: boolean) => Promise<import("../types").FlashLiquidationAdapter>;
export declare const chooseATokenDeployment: (id: eContractid) => (verify: boolean) => Promise<import("../types").AToken>;
export declare const deployATokenImplementations: (pool: ConfigNames, reservesConfig: {
    [key: string]: IReserveParams;
}, verify?: boolean) => Promise<void>;
export declare const deployRateStrategy: (strategyName: string, args: [tEthereumAddress, string, string, string, string, string, string], verify: boolean) => Promise<tEthereumAddress>;
export declare const deployMockParaSwapAugustus: (verify?: boolean) => Promise<import("../types").MockParaSwapAugustus>;
export declare const deployMockParaSwapAugustusRegistry: (args: [tEthereumAddress], verify?: boolean) => Promise<import("../types").MockParaSwapAugustusRegistry>;
export declare const deployParaSwapLiquiditySwapAdapter: (args: [tEthereumAddress, tEthereumAddress], verify?: boolean) => Promise<import("../types").ParaSwapLiquiditySwapAdapter>;
