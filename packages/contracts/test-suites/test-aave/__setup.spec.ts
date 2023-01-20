import rawBRE from "hardhat";
import { MockContract } from "ethereum-waffle";
import {
  insertContractAddressInDb,
  getEthersSigners,
  registerContractInJsonDb,
  getEthersSignersAddresses,
  getContractAddressWithJsonFallback
} from "../../helpers/contracts-helpers";
import {
  deployAssetMapping,
  deployLendingPoolAddressesProvider,
  deployMintableERC20,
  deployLendingPoolAddressesProviderRegistry,
  deployLendingPoolConfigurator,
  deployLendingPool,
  deployPriceOracle,
  deployLendingPoolCollateralManager,
  deployMockFlashLoanReceiver,
  deployWalletBalancerProvider,
  deployAaveProtocolDataProvider,
  // deployATokensAndRatesHelper,
  deployWETHGateway,
  deployWETHMocked,
  deployMockUniswapRouter,
  deployUniswapLiquiditySwapAdapter,
  deployUniswapRepayAdapter,
  deployFlashLiquidationAdapter,
  deployMockParaSwapAugustus,
  deployMockParaSwapAugustusRegistry,
  deployParaSwapLiquiditySwapAdapter,
  authorizeWETHGateway,
  deployATokenImplementations,
  deployVMEXOracle,
  deployConvexBaseRewardPool,
  deployConvexBooster,
  deployYearnTokenMocked,
} from "../../helpers/contracts-deployments";
import { Signer } from "ethers";
import {
  TokenContractId,
  eContractid,
  tEthereumAddress,
  AavePools,
} from "../../helpers/types";
import { MintableERC20 } from "../../types/MintableERC20";
import {
  ConfigNames,
  getReservesConfigByPool,
  loadPoolConfig,
} from "../../helpers/configuration";
import { initializeMakeSuite } from "./helpers/make-suite";

import {
  setInitialAssetPricesInOracle,
  deployAllMockAggregators,
} from "../../helpers/oracles-helpers";
import { DRE, waitForTx } from "../../helpers/misc-utils";
import {
  initReservesByHelper,
  claimTrancheId,
  initAssetData,
  getTranche0MockedData,
  getTranche1MockedData
} from "../../helpers/init-helpers";
import AaveConfig from "../../markets/aave";
import { oneEther, ZERO_ADDRESS } from "../../helpers/constants";
import {
  getEmergencyAdminT0,
  getEmergencyAdminT1,
  getLendingPool,
  getLendingPoolConfiguratorProxy,
  getPairsTokenAggregator,
  getVMEXOracle,
  getAssetMappings,
  getFirstSigner,
} from "../../helpers/contracts-getters";
import { WETH9Mocked } from "../../types/WETH9Mocked";
import { logger } from "./helpers//actions";

const MOCK_USD_PRICE_IN_WEI = AaveConfig.ProtocolGlobalParams.MockUsdPriceInWei;
const ALL_ASSETS_INITIAL_PRICES = AaveConfig.Mocks.AllAssetsInitialPrices;
const USD_ADDRESS = AaveConfig.ProtocolGlobalParams.UsdAddress;
const LENDING_RATE_ORACLE_RATES_COMMON =
  AaveConfig.LendingRateOracleRatesCommon;

const deployAllMockTokens = async (deployer: Signer) => {
  const tokens: {
    [symbol: string]: MockContract | MintableERC20 | WETH9Mocked;
  } = {};

  const protoConfigData = getReservesConfigByPool(AavePools.proto);

  //console.log(protoConfigData)

  for (const tokenSymbol of Object.keys(TokenContractId)) {
    if (tokenSymbol === "WETH") {
      tokens[tokenSymbol] = await deployWETHMocked();
      await registerContractInJsonDb(
        tokenSymbol.toUpperCase(),
        tokens[tokenSymbol]
      );
      continue;
    } 
    let decimals = 18;

    let configData = (<any>protoConfigData)[tokenSymbol];

    if (!configData) {
      decimals = 18;
    }

    if (tokenSymbol === "yvTricrypto2" || tokenSymbol === "yvThreePool" || tokenSymbol === "yvStethEth"|| tokenSymbol === "yvFraxUSDC"|| tokenSymbol === "yvFrax3Crv") {
      tokens[tokenSymbol] = await deployYearnTokenMocked([
        tokenSymbol,
        tokenSymbol,
        configData ? configData.reserveDecimals : 18,
        tokens[tokenSymbol.substring(2)].address
      ]);
      await registerContractInJsonDb(
        tokenSymbol.toUpperCase(),
        tokens[tokenSymbol]
      );
      continue;
    }

    tokens[tokenSymbol] = await deployMintableERC20([
      tokenSymbol,
      tokenSymbol,
      configData ? configData.reserveDecimals : 18,
    ]);
    await registerContractInJsonDb(
      tokenSymbol.toUpperCase(),
      tokens[tokenSymbol]
    );
  }

  return tokens;
};

const buildTestEnv = async (deployer: Signer) => {
  console.time("setup");
  const aaveAdmin = await deployer.getAddress();
  var config = loadPoolConfig(ConfigNames.Aave);

  const mockTokens: {
    [symbol: string]: MockContract | MintableERC20 | WETH9Mocked;
  } = {
    ...(await deployAllMockTokens(deployer)),
  };

  //console.log("mockTokens: ",mockTokens)
  const addressesProvider = await deployLendingPoolAddressesProvider(
    AaveConfig.MarketId
  );
  await waitForTx(await addressesProvider.setGlobalAdmin(aaveAdmin));
  await waitForTx(await addressesProvider.setEmergencyAdmin(aaveAdmin));

  //setting users[1] as emergency admin, which is in position 2 in the DRE addresses list
  const addressList = await getEthersSignersAddresses();

  //await waitForTx(await addressesProvider.setEmergencyAdmin(addressList[2]));

  const addressesProviderRegistry =
    await deployLendingPoolAddressesProviderRegistry();
  await waitForTx(
    await addressesProviderRegistry.registerAddressesProvider(
      addressesProvider.address,
      1
    )
  );

    //-------------------------------------------------------------
  //deploy AssetMappings
  // Reserve params from AAVE pool + mocked tokens
  var reservesParams = {
    ...config.ReservesConfig,
  };

  const allTokenAddresses = Object.entries(mockTokens).reduce(
    (
      accum: { [tokenSymbol: string]: tEthereumAddress },
      [tokenSymbol, tokenContract]
    ) => ({
      ...accum,
      [tokenSymbol]: tokenContract.address,
    }),
    {}
  );

  const { USD, ...tokensAddressesWithoutUsd } = allTokenAddresses;

  const allReservesAddresses = {
    ...tokensAddressesWithoutUsd,
  };

  const testHelpers = await deployAaveProtocolDataProvider(
    addressesProvider.address
  );

  const admin = await DRE.ethers.getSigner(await
    (await getEmergencyAdminT0()).getAddress());

  const {
    ATokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
  } = config;
  var treasuryAddress = admin.address;


  const AssetMappingImpl = await deployAssetMapping();

  await waitForTx(
    await addressesProvider.setAssetMappingsImpl(AssetMappingImpl.address)
  );

  const AssetMappingProxy = await getAssetMappings(
    await addressesProvider.getAssetMappings()
  );
  await insertContractAddressInDb(
    eContractid.AssetMappings,
    AssetMappingProxy.address
  );

  await initAssetData(
    reservesParams,
    allReservesAddresses,
    ATokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
    admin,
    false
  );

  const lendingPoolImpl = await deployLendingPool();

  await waitForTx(
    await addressesProvider.setLendingPoolImpl(lendingPoolImpl.address)
  );

  const lendingPoolAddress = await addressesProvider.getLendingPool();
  const lendingPoolProxy = await getLendingPool(lendingPoolAddress);

  await insertContractAddressInDb(
    eContractid.LendingPool,
    lendingPoolProxy.address
  );

  const lendingPoolConfiguratorImpl = await deployLendingPoolConfigurator();
  await waitForTx(
    await addressesProvider.setLendingPoolConfiguratorImpl(
      lendingPoolConfiguratorImpl.address
    )
  );
  // await lendingPoolConfiguratorImpl.initialize(addressesProvider.address, await getTreasuryAddress(config));

  const lendingPoolConfiguratorProxy = await getLendingPoolConfiguratorProxy(
    await addressesProvider.getLendingPoolConfigurator()
  );
  await insertContractAddressInDb(
    eContractid.LendingPoolConfigurator,
    lendingPoolConfiguratorProxy.address
  );

  const fallbackOracle = await deployPriceOracle();
  await waitForTx(await fallbackOracle.setEthUsdPrice(MOCK_USD_PRICE_IN_WEI));
  await setInitialAssetPricesInOracle(
    ALL_ASSETS_INITIAL_PRICES,
    {
      WETH: mockTokens.WETH.address,
      DAI: mockTokens.DAI.address,
      TUSD: mockTokens.TUSD.address,
      USDC: mockTokens.USDC.address,
      USDT: mockTokens.USDT.address,
      SUSD: mockTokens.SUSD.address,
      AAVE: mockTokens.AAVE.address,
      BAT: mockTokens.BAT.address,
      MKR: mockTokens.MKR.address,
      LINK: mockTokens.LINK.address,
      KNC: mockTokens.KNC.address,
      WBTC: mockTokens.WBTC.address,
      MANA: mockTokens.MANA.address,
      ZRX: mockTokens.ZRX.address,
      SNX: mockTokens.SNX.address,
      BUSD: mockTokens.BUSD.address,
      YFI: mockTokens.BUSD.address,
      REN: mockTokens.REN.address,
      UNI: mockTokens.UNI.address,
      ENJ: mockTokens.ENJ.address,
      // DAI: mockTokens.LpDAI.address,
      // USDC: mockTokens.LpUSDC.address,
      // USDT: mockTokens.LpUSDT.address,
      // WBTC: mockTokens.LpWBTC.address,
      // WETH: mockTokens.LpWETH.address,
      UniDAIWETH: mockTokens.UniDAIWETH.address,
      UniWBTCWETH: mockTokens.UniWBTCWETH.address,
      UniAAVEWETH: mockTokens.UniAAVEWETH.address,
      UniBATWETH: mockTokens.UniBATWETH.address,
      UniDAIUSDC: mockTokens.UniDAIUSDC.address,
      UniCRVWETH: mockTokens.UniCRVWETH.address,
      UniLINKWETH: mockTokens.UniLINKWETH.address,
      UniMKRWETH: mockTokens.UniMKRWETH.address,
      UniRENWETH: mockTokens.UniRENWETH.address,
      UniSNXWETH: mockTokens.UniSNXWETH.address,
      UniUNIWETH: mockTokens.UniUNIWETH.address,
      UniUSDCWETH: mockTokens.UniUSDCWETH.address,
      UniWBTCUSDC: mockTokens.UniWBTCUSDC.address,
      UniYFIWETH: mockTokens.UniYFIWETH.address,
      BptWBTCWETH: mockTokens.BptWBTCWETH.address,
      BptBALWETH: mockTokens.BptBALWETH.address,
      WMATIC: mockTokens.WMATIC.address,
      USD: USD_ADDRESS,
      STAKE: mockTokens.STAKE.address,
      WAVAX: mockTokens.WAVAX.address,
      Tricrypto2: mockTokens.Tricrypto2.address,
      ThreePool: mockTokens.ThreePool.address,
      StethEth: mockTokens.StethEth.address,
      Steth: mockTokens.Steth.address,
      FraxUSDC: mockTokens.FraxUSDC.address,
      Frax3Crv: mockTokens.Frax3Crv.address,
      Frax: mockTokens.Frax.address,
      BAL: mockTokens.Frax3Crv.address,
      CRV: mockTokens.Frax3Crv.address,
      CVX: mockTokens.Frax3Crv.address,
      BADGER: mockTokens.Frax3Crv.address,
      LDO: mockTokens.Frax3Crv.address,
      ALCX: mockTokens.Frax3Crv.address,
      Oneinch: mockTokens.Frax3Crv.address,
      yvTricrypto2: mockTokens.Tricrypto2.address,
      yvThreePool: mockTokens.ThreePool.address,
      yvStethEth: mockTokens.StethEth.address,
      yvFraxUSDC: mockTokens.FraxUSDC.address,
      yvFrax3Crv: mockTokens.Frax3Crv.address,
    },
    fallbackOracle
  );

  const mockAggregators = await deployAllMockAggregators(
    ALL_ASSETS_INITIAL_PRICES
  );

  const allAggregatorsAddresses = Object.entries(mockAggregators).reduce(
    (
      accum: { [tokenSymbol: string]: tEthereumAddress },
      [tokenSymbol, aggregator]
    ) => ({
      ...accum,
      [tokenSymbol]: aggregator.address,
    }),
    {}
  );

  const [tokens, aggregators] = getPairsTokenAggregator(
    allTokenAddresses,
    allAggregatorsAddresses,
    config.OracleQuoteCurrency
  );

  const vmexOracleImpl = await deployVMEXOracle();


  await waitForTx(
    await addressesProvider.setPriceOracle(vmexOracleImpl.address)
  );


  const VMEXOracleAddress = await addressesProvider.getPriceOracle(); //returns address of the proxy
  const VMEXOracleProxy = await getVMEXOracle(VMEXOracleAddress);

  await insertContractAddressInDb(
    eContractid.VMEXOracle,
    VMEXOracleProxy.address
  );

  console.log("Set addresses provider price oracle as vmex oracle")

  await waitForTx(
    await VMEXOracleProxy.connect(admin).setBaseCurrency(
      mockTokens.WETH.address,
      oneEther.toString()
      )
  );

  console.log("Set vmex oracle base currency")
  await waitForTx(
    await VMEXOracleProxy.connect(admin).setFallbackOracle(
      fallbackOracle.address
      )
  );

  console.log("Set vmex oracle fallback oracle")

  await deployATokenImplementations(ConfigNames.Aave, reservesParams, false);

  await waitForTx(
    await addressesProvider.setATokenImpl(
      await getContractAddressWithJsonFallback(
        eContractid.AToken,
        ConfigNames.Aave
      )
    )
  );

  await waitForTx(
    await addressesProvider.setVariableDebtToken(
      await getContractAddressWithJsonFallback(
        eContractid.VariableDebtToken,
        ConfigNames.Aave
      )
    )
  );

  await waitForTx(
    await addressesProvider.addWhitelistedAddress(
      await deployer.getAddress(),
      true
    )
  );

  await waitForTx(
    await addressesProvider.addWhitelistedAddress(addressList[1], true)
  );

  await waitForTx(
    await addressesProvider.addWhitelistedAddress(addressList[2], true)
  );

  //-------------------------------------------------------------
  //deploy tranche 0
  // config = await loadCustomAavePoolConfig("0");
  // reservesParams = {
  //   ...config.ReservesConfig,
  // };
  await claimTrancheId("Vmex tranche 0", admin);

  let [assets0, reserveFactors0, forceDisabledBorrow0, forceDisabledCollateral0] = getTranche0MockedData(allReservesAddresses);

  await initReservesByHelper(
    assets0,
    reserveFactors0,
    forceDisabledBorrow0,
    forceDisabledCollateral0,
    admin,
    treasuryAddress,
    ZERO_ADDRESS,
    0
  );

  //-------------------------------------------------------------

  //-------------------------------------------------------------
  //deploy tranche 1 with tricrypto
  const user1 =  await DRE.ethers.getSigner(await
    (await getEmergencyAdminT1()).getAddress());
  treasuryAddress = user1.address;
  await claimTrancheId("Vmex tranche 1", user1);

  let [assets1, reserveFactors1, forceDisabledBorrow1, forceDisabledCollateral1] = getTranche1MockedData(allReservesAddresses);

  await initReservesByHelper(
    assets1,
    reserveFactors1,
    forceDisabledBorrow1,
    forceDisabledCollateral1,
    user1,
    treasuryAddress,
    ZERO_ADDRESS,
    1
  );

  //-------------------------------------------------------------

  const collateralManager = await deployLendingPoolCollateralManager();
  await waitForTx(
    await addressesProvider.setLendingPoolCollateralManager(
      collateralManager.address
    )
  );
  await deployMockFlashLoanReceiver(addressesProvider.address);

  const mockUniswapRouter = await deployMockUniswapRouter();

  const adapterParams: [string, string, string] = [
    addressesProvider.address,
    mockUniswapRouter.address,
    mockTokens.WETH.address,
  ];

  await deployUniswapLiquiditySwapAdapter(adapterParams);
  await deployUniswapRepayAdapter(adapterParams);
  await deployFlashLiquidationAdapter(adapterParams);

  const augustus = await deployMockParaSwapAugustus();

  const augustusRegistry = await deployMockParaSwapAugustusRegistry([
    augustus.address,
  ]);

  await deployParaSwapLiquiditySwapAdapter([
    addressesProvider.address,
    augustusRegistry.address,
  ]);

  await deployWalletBalancerProvider();

  const gateWay = await deployWETHGateway([mockTokens.WETH.address]);
  await authorizeWETHGateway(gateWay.address, lendingPoolAddress);

  // TODO: mock the curve pool (needs deposit function), convex booster, sushiswap
  // right now the tend() function for strategies is unusable in hardhat tests
  // deploy tricrypto2 strategy
  // if (isHardhatTestingStrategies) {
  //   const baseRewardPool = await deployConvexBaseRewardPool();
  //   console.log("DEPLOYED baserewardpool at address", baseRewardPool.address);

  //   const booster = await deployConvexBooster();
  //   console.log("DEPLOYED booster at address", booster.address);

  //   const tricrypto2Strategy = await deployTricrypto2Strategy();
  //   console.log(
  //     "DEPLOYED tricrypto Strat at address",
  //     tricrypto2Strategy.address
  //   );

  //   const pid = 38;
  //   const numTokensInPool = 0;
  //   const tranche = 1;

  //   await waitForTx(
  //     await booster.addPool(pid.toString(), baseRewardPool.address)
  //   );
  //   console.log("Finished booster add pool");

  //   // have to comment out cvx, crv, underlying token allow all inside CrvLpStrategy.sol in order for this to work
  //   await waitForTx(
  //     await tricrypto2Strategy.initialize(
  //       addressesProvider.address,
  //       allReservesAddresses["Tricrypto2"],
  //       tranche,
  //       pid,
  //       numTokensInPool,
  //       "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46", // address of tricrypto2 pool, will not work for hardhat test, do not tend
  //       booster.address
  //     )
  //   );
  //   console.log("Finished strategy initialize");

  //   // admin grants strategy access to all funds
  //   await waitForTx(
  //     await lendingPoolConfiguratorProxy.addStrategy(
  //       allReservesAddresses["Tricrypto2"],
  //       1,
  //       tricrypto2Strategy.address
  //     )
  //   );

  //   console.log("deployed strategies");
  // }

  console.timeEnd("setup");
};

before(async () => {
  await rawBRE.run("set-DRE");
  const [deployer, secondaryWallet] = await getEthersSigners();
  const FORK = process.env.FORK;

  if (FORK) {
    await rawBRE.run("aave:mainnet", { skipRegistry: true });
  } else {
    console.log("-> Deploying test environment...");
    await buildTestEnv(deployer);
  }

  await initializeMakeSuite();
  console.log("\n***************");
  console.log("Setup and snapshot finished");
  console.log("***************\n");
});
