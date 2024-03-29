import {
  AssetMappingsFactory,
  AaveProtocolDataProviderFactory,
  ATokenFactory,
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
  MockVariableDebtTokenFactory,
  PriceOracleFactory,
  ReserveLogicFactory,
  SelfdestructTransferFactory,
  VariableDebtTokenFactory,
  WalletBalanceProviderFactory,
  WETH9MockedFactory,
  WETHGatewayFactory,
  BoosterFactory,
  BaseUniswapOracleFactory,
  YearnTokenMockedFactory,
  UpgradeableBeaconFactory,
  IncentivesControllerFactory,
  ATokenMockFactory,
  VmexTokenFactory,
  StakingRewardsMockFactory,
  MockIncentivesControllerFactory,
  ValidationLogicFactory,
  DepositWithdrawLogicFactory,
} from "../types";
import { IERC20DetailedFactory } from "../types/IERC20DetailedFactory";
import { getEthersSigners, MockTokenMap } from "./contracts-helpers";
import {
  DRE,
  getDb,
  getProdDb,
  notFalsyOrZeroAddress,
  omit,
} from "./misc-utils";
import {
  eContractid,
  IChainlinkInternal,
  PoolConfiguration,
  tEthereumAddress,
  TokenContractId,
} from "./types";

export const getFirstSigner = async () => (await getEthersSigners())[0];
export const getEmergencyAdminT0 = async () => (await getEthersSigners())[0];
// export const getTrancheAdminT1 = async (network?: string) => (await getEthersSigners())[network && network=="goerli" ? 1 : 7];
export const getTrancheAdminT1 = async () => (await getEthersSigners())[7];

export const getDbEntry = async (id: string | eContractid) =>
  await getDb().get(`${id}.${DRE.network.name}`).value();

export const getLendingPoolAddressesProvider = async (
  address?: tEthereumAddress,
  isProd?: boolean
) => {
  return await LendingPoolAddressesProviderFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.LendingPoolAddressesProvider}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
};

export const getValidationLogic = async (
  address?: tEthereumAddress,
  isProd?: boolean
) => {
  return await ValidationLogicFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.ValidationLogic}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
};

export const getDepositWithdrawLogic = async (
  address?: tEthereumAddress,
  isProd?: boolean
) => {
  return await DepositWithdrawLogicFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.DepositWithdrawLogic}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
};
export const getLendingPoolConfiguratorProxy = async (
  address?: tEthereumAddress,
  isProd?: boolean
) => {
  return await LendingPoolConfiguratorFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.LendingPoolConfigurator}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
};

export const getATokenBeacon = async (
  address?: tEthereumAddress,
  isProd?: boolean
) => {
  return await UpgradeableBeaconFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.ATokenBeacon}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
};

export const getVariableDebtTokenBeacon = async (
  address?: tEthereumAddress,
  isProd?: boolean
) => {
  return await UpgradeableBeaconFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.VariableDebtTokenBeacon}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
};

export const getAssetMappings = async (
  address?: tEthereumAddress,
  isProd?: boolean
) => {
  return await AssetMappingsFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.AssetMappings}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
};

export const getAssetMappingsImpl = async (
  address?: tEthereumAddress,
  isProd?: boolean
) => {
  return await AssetMappingsFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.AssetMappingsImpl}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
};

export const getLendingPool = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await LendingPoolFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.LendingPool}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getPriceOracle = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await PriceOracleFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.PriceOracle}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getAToken = async (address?: tEthereumAddress, isProd?: boolean) =>
  await ATokenFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.AToken}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getVariableDebtToken = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await VariableDebtTokenFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.VariableDebtToken}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getMintableERC20 = async (address: tEthereumAddress) =>
  await MintableERC20Factory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.MintableERC20}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getYearnTokenMocked = async (address: tEthereumAddress) =>
  await YearnTokenMockedFactory.connect(
    address ||
      (await getDb())
        .get(`${eContractid.MintableERC20}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getIErc20Detailed = async (address: tEthereumAddress) =>
  await IERC20DetailedFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.IERC20Detailed}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getAaveProtocolDataProvider = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await AaveProtocolDataProviderFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.AaveProtocolDataProvider}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getInterestRateStrategy = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await DefaultReserveInterestRateStrategyFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(
          `${eContractid.DefaultReserveInterestRateStrategy}.${DRE.network.name}`
        )
        .value().address,
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
    const address = db
      .get(`${tokenSymbol.toUpperCase()}.${DRE.network.name}`)
      .value().address;
    if (
      tokenSymbol === "yvTricrypto2" ||
      tokenSymbol === "yvThreePool" ||
      tokenSymbol === "yvStethEth" ||
      tokenSymbol === "yvFraxUSDC" ||
      tokenSymbol === "yvFrax3Crv"
    ) {
      accumulator[tokenSymbol] = await getYearnTokenMocked(address);
    } else {
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
  aggregatorsAddresses: { [tokenSymbol: string]: IChainlinkInternal },
  oracleQuoteCurrency: string
): [string[], IChainlinkInternal[]] => {
  const assetsWithoutQuoteCurrency = omit(
    allAssetsAddresses,
    getQuoteCurrencies(oracleQuoteCurrency)
  );

  const pairs = Object.entries(assetsWithoutQuoteCurrency)
    .filter(([tokenSymbol, tokenAddress]) => {
      //if (true/*tokenSymbol !== 'WETH' && tokenSymbol !== 'ETH' && tokenSymbol !== 'LpWETH'*/) {
      const aggregatorAddressIndex = Object.keys(
        aggregatorsAddresses
      ).findIndex((value) => value === tokenSymbol);

      if (aggregatorAddressIndex >= 0) {
        return true;
      }
      return false;
    })
    .map(([tokenSymbol, tokenAddress]) => {
      //if (true/*tokenSymbol !== 'WETH' && tokenSymbol !== 'ETH' && tokenSymbol !== 'LpWETH'*/) {
      const aggregatorAddressIndex = Object.keys(
        aggregatorsAddresses
      ).findIndex((value) => value === tokenSymbol);

      const [, aggregatorAddress] = (
        Object.entries(aggregatorsAddresses) as [string, IChainlinkInternal][]
      )[aggregatorAddressIndex];
      return [tokenAddress, aggregatorAddress];
      //}
    }) as [string, IChainlinkInternal][];

  const mappedPairs = pairs.map(([asset]) => asset);
  const mappedAggregators = pairs.map(([, source]) => source);

  return [mappedPairs, mappedAggregators];
};

export const getLendingPoolAddressesProviderRegistry = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await LendingPoolAddressesProviderRegistryFactory.connect(
    notFalsyOrZeroAddress(address)
      ? address
      : (isProd ? await getProdDb() : await getDb())
          .get(
            `${eContractid.LendingPoolAddressesProviderRegistry}.${DRE.network.name}`
          )
          .value().address,
    await getFirstSigner()
  );

export const getReserveLogic = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await ReserveLogicFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.ReserveLogic}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getGenericLogic = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await GenericLogicFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.GenericLogic}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getWETHGateway = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await WETHGatewayFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.WETHGateway}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getWETHMocked = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await WETH9MockedFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.WETHMocked}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getMockAToken = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await MockATokenFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.MockAToken}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getMockVariableDebtToken = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await MockVariableDebtTokenFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.MockVariableDebtToken}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getSelfdestructTransferMock = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await SelfdestructTransferFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.SelfdestructTransferMock}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getProxy = async (address: tEthereumAddress) =>
  await InitializableAdminUpgradeabilityProxyFactory.connect(
    address,
    await getFirstSigner()
  );

export const getLendingPoolImpl = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await LendingPoolFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.LendingPoolImpl}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getLendingPoolConfiguratorImpl = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await LendingPoolConfiguratorFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.LendingPoolConfiguratorImpl}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getLendingPoolCollateralManagerImpl = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await LendingPoolCollateralManagerFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(
          `${eContractid.LendingPoolCollateralManagerImpl}.${DRE.network.name}`
        )
        .value().address,
    await getFirstSigner()
  );

export const getWalletProvider = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await WalletBalanceProviderFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.WalletBalanceProvider}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getLendingPoolCollateralManager = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await LendingPoolCollateralManagerFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.LendingPoolCollateralManager}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getAddressById = async (
  id: string
): Promise<tEthereumAddress | undefined> =>
  (isProd ? await getProdDb() : await getDb())
    .get(`${id}.${DRE.network.name}`)
    .value()?.address || undefined;

export const getVMEXOracle = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await VMEXOracleFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.VMEXOracle}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
export const getBaseUniswapOracle = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await BaseUniswapOracleFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.BaseUniswapOracle}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
export const getConvexBooster = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await BoosterFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.Booster}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getIncentivesControllerImpl = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await IncentivesControllerFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.IncentivesControllerImpl}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getMockIncentivesControllerImpl = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await MockIncentivesControllerFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.MockIncentivesControllerImpl}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getIncentivesControllerProxy = async (
  address?: tEthereumAddress,
  isProd?: boolean
) => {
  console.log("DRE.network.name: ", DRE.network.name);
  return await IncentivesControllerFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.IncentivesControllerProxy}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
};

export const getATokenMock = async ({
  address,
  slug,
}: {
  address?: tEthereumAddress;
  slug?: string;
}) =>
  await ATokenMockFactory.connect(
    address ||
      (await getDb())
        .get(`${slug || eContractid.ATokenMock}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getVmexToken = async (
  address?: tEthereumAddress,
  isProd?: boolean
) =>
  await VmexTokenFactory.connect(
    address ||
      (isProd ? await getProdDb() : await getDb())
        .get(`${eContractid.VmexToken}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );

export const getStakingRewardsMock = async ({
  address,
  slug,
}: {
  address?: tEthereumAddress;
  slug?: string;
}) =>
  await StakingRewardsMockFactory.connect(
    address ||
      (await getDb())
        .get(`${slug || eContractid.StakingRewardsMock}.${DRE.network.name}`)
        .value().address,
    await getFirstSigner()
  );
