import {
  AssetMappingsFactory,
  AaveProtocolDataProviderFactory,
  ATokenFactory,
  // ATokensAndRatesHelperFactory,
  VMEXOracleFactory,
  DefaultReserveInterestRateStrategyFactory,
  GenericLogicFactory,
  InitializableAdminUpgradeabilityProxyFactory,
  LendingPoolAddressesProviderFactory,
  LendingPoolAddressesProviderRegistryFactory,
  LendingPoolCollateralManagerFactory,
  LendingPoolConfiguratorFactory,
  LendingPoolFactory,
  MintableERC20Factory,
  MockATokenFactory,
  MockFlashLoanReceiverFactory,
  MockStableDebtTokenFactory,
  MockVariableDebtTokenFactory,
  MockUniswapV2Router02Factory,
  MockParaSwapAugustusFactory,
  MockParaSwapAugustusRegistryFactory,
  ParaSwapLiquiditySwapAdapterFactory,
  PriceOracleFactory,
  ReserveLogicFactory,
  SelfdestructTransferFactory,
  StableAndVariableTokensHelperFactory,
  StableDebtTokenFactory,
  UniswapLiquiditySwapAdapterFactory,
  UniswapRepayAdapterFactory,
  VariableDebtTokenFactory,
  WalletBalanceProviderFactory,
  WETH9MockedFactory,
  WETHGatewayFactory,
  FlashLiquidationAdapterFactory,
  CurveWrapperFactory,
  CrvLpStrategyFactory,
  BoosterFactory,
  VStrategyHelperFactory,
  UserConfigurationFactory,
  BaseUniswapOracleFactory,
  YearnTokenMockedFactory,
  ATokenBeaconFactory,
  VariableDebtTokenBeaconFactory,
  UpgradeableBeaconFactory,
  IncentivesControllerFactory,
  ATokenMockFactory,
  VmexTokenFactory,
  StakingRewardsMockFactory
} from "../types";
import { IERC20DetailedFactory } from "../types/IERC20DetailedFactory";
import { getEthersSigners, MockTokenMap } from "./contracts-helpers";
import { DRE, getDb, notFalsyOrZeroAddress, omit } from "./misc-utils";
import {
  eContractid,
  PoolConfiguration,
  tEthereumAddress,
  TokenContractId,
} from "./types";

export const getFirstSigner = async () => (await getEthersSigners())[0];
export const getEmergencyAdminT0 = async () => (await getEthersSigners())[0];
export const getTrancheAdminT1 = async (network?: string) => (await getEthersSigners())[network && network=="goerli" ? 1 : 7];

export const getDbEntry = async (
  id: eContractid
) =>
    await getDb()
      .get(
        `${id}.${DRE.network.name}`
      ).value()

export const getLendingPoolAddressesProvider = async (
  address?: tEthereumAddress
) => {
  return await LendingPoolAddressesProviderFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${eContractid.LendingPoolAddressesProvider}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );
};
export const getLendingPoolConfiguratorProxy = async (
  address?: tEthereumAddress
) => {
  return await LendingPoolConfiguratorFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.LendingPoolConfigurator}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
};

export const getATokenBeacon = async (
  address?: tEthereumAddress
) => {
  return await UpgradeableBeaconFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.ATokenBeacon}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
};

export const getVariableDebtTokenBeacon = async (
  address?: tEthereumAddress
) => {
  return await UpgradeableBeaconFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.VariableDebtTokenBeacon}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
};

export const getAssetMappings = async (
  address?: tEthereumAddress
) => {
  return await AssetMappingsFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.AssetMappings}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
};

export const getUserConfiguration = async (
  address?: tEthereumAddress
) => {
  return await UserConfigurationFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.UserConfiguration}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
};

export const getLendingPool = async (address?: tEthereumAddress) =>
  await LendingPoolFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.LendingPool}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getPriceOracle = async (address?: tEthereumAddress) =>
  await PriceOracleFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.PriceOracle}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getCurvePriceOracleWrapper = async (address?: tEthereumAddress) =>
  await CurveWrapperFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.CurveWrapper}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getAToken = async (address?: tEthereumAddress) =>
  await ATokenFactory.connect(
    address ||
      (
        await getDb().get(`${eContractid.AToken}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getStableDebtToken = async (address?: tEthereumAddress) =>
  await StableDebtTokenFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.StableDebtToken}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getVariableDebtToken = async (address?: tEthereumAddress) =>
  await VariableDebtTokenFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.VariableDebtToken}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getMintableERC20 = async (address: tEthereumAddress) =>
  await MintableERC20Factory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.MintableERC20}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getYearnTokenMocked = async (address: tEthereumAddress) =>
  await YearnTokenMockedFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.MintableERC20}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getIErc20Detailed = async (address: tEthereumAddress) =>
  await IERC20DetailedFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.IERC20Detailed}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getAaveProtocolDataProvider = async (address?: tEthereumAddress) =>
  await AaveProtocolDataProviderFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.AaveProtocolDataProvider}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getInterestRateStrategy = async (address?: tEthereumAddress) =>
  await DefaultReserveInterestRateStrategyFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${eContractid.DefaultReserveInterestRateStrategy}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );

export const getMockFlashLoanReceiver = async (address?: tEthereumAddress) =>
  await MockFlashLoanReceiverFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.MockFlashLoanReceiver}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getMockedTokens = async (config: PoolConfiguration) => {
  const tokenSymbols = Object.keys(config.ReservesConfig);
  const db = getDb();
  const tokens: MockTokenMap = await tokenSymbols.reduce<Promise<MockTokenMap>>(
    async (acc, tokenSymbol) => {
      const accumulator = await acc;
      const address = db
        .get(`${tokenSymbol.toUpperCase()}.${DRE.network.name}`)
        .value().address;
      accumulator[tokenSymbol] = await getMintableERC20(address);
      return Promise.resolve(acc);
    },
    Promise.resolve({})
  );
  return tokens;
};

export const getAllMockedTokens = async () => {
  const db = getDb();
  const tokens: MockTokenMap = await Object.keys(TokenContractId).reduce<
    Promise<MockTokenMap>
  >(async (acc, tokenSymbol) => {
    const accumulator = await acc;
    console.log("tokenSymbol.toUpperCase(): ",tokenSymbol.toUpperCase())
    console.log("DRE.network.name: ",DRE.network.name)
    const address = db
      .get(`${tokenSymbol.toUpperCase()}.${DRE.network.name}`)
      .value().address;
      if (tokenSymbol === "yvTricrypto2" || tokenSymbol === "yvThreePool" || tokenSymbol === "yvStethEth"|| tokenSymbol === "yvFraxUSDC"|| tokenSymbol === "yvFrax3Crv") {
        accumulator[tokenSymbol] = await getYearnTokenMocked(address);
      }
      else {
        accumulator[tokenSymbol] = await getMintableERC20(address);
      }

    return Promise.resolve(acc);
  }, Promise.resolve({}));
  return tokens;
};

export const getQuoteCurrencies = (oracleQuoteCurrency: string): string[] => {
  switch (oracleQuoteCurrency) {
    case "USD":
      return ["USD"];
    case "ETH":
    case "WETH":
    default:
      return ["ETH", "WETH"];
  }
};

export const getPairsTokenAggregator = (
  allAssetsAddresses: {
    [tokenSymbol: string]: tEthereumAddress;
  },
  aggregatorsAddresses: { [tokenSymbol: string]: tEthereumAddress },
  oracleQuoteCurrency: string
): [string[], string[]] => {
  const assetsWithoutQuoteCurrency = omit(
    allAssetsAddresses,
    getQuoteCurrencies(oracleQuoteCurrency)
  );

  const pairs = Object.entries(assetsWithoutQuoteCurrency).map(
    ([tokenSymbol, tokenAddress]) => {
      //if (true/*tokenSymbol !== 'WETH' && tokenSymbol !== 'ETH' && tokenSymbol !== 'LpWETH'*/) {
      const aggregatorAddressIndex = Object.keys(
        aggregatorsAddresses
      ).findIndex((value) => value === tokenSymbol);
      const [, aggregatorAddress] = (
        Object.entries(aggregatorsAddresses) as [string, tEthereumAddress][]
      )[aggregatorAddressIndex];
      return [tokenAddress, aggregatorAddress];
      //}
    }
  ) as [string, string][];

  const mappedPairs = pairs.map(([asset]) => asset);
  const mappedAggregators = pairs.map(([, source]) => source);

  return [mappedPairs, mappedAggregators];
};

export const getLendingPoolAddressesProviderRegistry = async (
  address?: tEthereumAddress
) =>
  await LendingPoolAddressesProviderRegistryFactory.connect(
    notFalsyOrZeroAddress(address)
      ? address
      : (
          await getDb()
            .get(
              `${eContractid.LendingPoolAddressesProviderRegistry}.${DRE.network.name}`
            )
            .value()
        ).address,
    await getFirstSigner()
  );

export const getReserveLogic = async (address?: tEthereumAddress) =>
  await ReserveLogicFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.ReserveLogic}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getGenericLogic = async (address?: tEthereumAddress) =>
  await GenericLogicFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.GenericLogic}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getWETHGateway = async (address?: tEthereumAddress) =>
  await WETHGatewayFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.WETHGateway}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getWETHMocked = async (address?: tEthereumAddress) =>
  await WETH9MockedFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.WETHMocked}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getMockAToken = async (address?: tEthereumAddress) =>
  await MockATokenFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.MockAToken}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getMockVariableDebtToken = async (address?: tEthereumAddress) =>
  await MockVariableDebtTokenFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.MockVariableDebtToken}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getMockStableDebtToken = async (address?: tEthereumAddress) =>
  await MockStableDebtTokenFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.MockStableDebtToken}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getSelfdestructTransferMock = async (address?: tEthereumAddress) =>
  await SelfdestructTransferFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.SelfdestructTransferMock}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getProxy = async (address: tEthereumAddress) =>
  await InitializableAdminUpgradeabilityProxyFactory.connect(
    address,
    await getFirstSigner()
  );

export const getLendingPoolImpl = async (address?: tEthereumAddress) =>
  await LendingPoolFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.LendingPoolImpl}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getLendingPoolConfiguratorImpl = async (
  address?: tEthereumAddress
) =>
  await LendingPoolConfiguratorFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.LendingPoolConfiguratorImpl}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getLendingPoolCollateralManagerImpl = async (
  address?: tEthereumAddress
) =>
  await LendingPoolCollateralManagerFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${eContractid.LendingPoolCollateralManagerImpl}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );

export const getWalletProvider = async (address?: tEthereumAddress) =>
  await WalletBalanceProviderFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.WalletBalanceProvider}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getLendingPoolCollateralManager = async (
  address?: tEthereumAddress
) =>
  await LendingPoolCollateralManagerFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${eContractid.LendingPoolCollateralManager}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );

export const getAddressById = async (
  id: string
): Promise<tEthereumAddress | undefined> =>
  (await getDb().get(`${id}.${DRE.network.name}`).value())?.address ||
  undefined;

export const getVMEXOracle = async (address?: tEthereumAddress) =>
  await VMEXOracleFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.VMEXOracle}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
  export const getBaseUniswapOracle = async (address?: tEthereumAddress) =>
  await BaseUniswapOracleFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.BaseUniswapOracle}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
  export const getvStrategyHelper = async (address?: tEthereumAddress) =>
  await VStrategyHelperFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.vStrategyHelper}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
export const getCrvLpStrategy = async (address?: tEthereumAddress) =>
  await CrvLpStrategyFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.CrvLpStrategy}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
export const getConvexBooster = async (address?: tEthereumAddress) =>
  await BoosterFactory.connect(
    address ||
      (
        await getDb().get(`${eContractid.Booster}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getMockUniswapRouter = async (address?: tEthereumAddress) =>
  await MockUniswapV2Router02Factory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.MockUniswapV2Router02}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getUniswapLiquiditySwapAdapter = async (
  address?: tEthereumAddress
) =>
  await UniswapLiquiditySwapAdapterFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.UniswapLiquiditySwapAdapter}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getUniswapRepayAdapter = async (address?: tEthereumAddress) =>
  await UniswapRepayAdapterFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.UniswapRepayAdapter}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getFlashLiquidationAdapter = async (address?: tEthereumAddress) =>
  await FlashLiquidationAdapterFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.FlashLiquidationAdapter}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getMockParaSwapAugustus = async (address?: tEthereumAddress) =>
  await MockParaSwapAugustusFactory.connect(
    address ||
      (
        await getDb()
          .get(`${eContractid.MockParaSwapAugustus}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );

export const getMockParaSwapAugustusRegistry = async (
  address?: tEthereumAddress
) =>
  await MockParaSwapAugustusRegistryFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${eContractid.MockParaSwapAugustusRegistry}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );

export const getParaSwapLiquiditySwapAdapter = async (
  address?: tEthereumAddress
) =>
  await ParaSwapLiquiditySwapAdapterFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${eContractid.ParaSwapLiquiditySwapAdapter}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );

export const getIncentivesControllerImpl = async (
  address?: tEthereumAddress
) =>
  await IncentivesControllerFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${eContractid.IncentivesControllerImpl}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );

export const getIncentivesControllerProxy = async (
  address?: tEthereumAddress
) =>
  await IncentivesControllerFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${eContractid.IncentivesControllerProxy}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );

export const getATokenMock = async ({
  address,
  slug
}: {
  address?: tEthereumAddress,
  slug?: string
}) =>
  await ATokenMockFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${slug || eContractid.ATokenMock}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );

export const getVmexToken = async (
  address?: tEthereumAddress
) =>
  await VmexTokenFactory.connect(
    address ||
      (
        await getDb()
          .get(
            `${eContractid.VmexToken}.${DRE.network.name}`
          )
          .value()
      ).address,
    await getFirstSigner()
  );

  export const getStakingRewardsMock = async ({
    address,
    slug
  }: {
    address?: tEthereumAddress,
    slug?: string
  }) =>
  await StakingRewardsMockFactory.connect(
    address ||
      (
        await getDb()
          .get(`${slug || eContractid.StakingRewardsMock}.${DRE.network.name}`)
          .value()
      ).address,
    await getFirstSigner()
  );
