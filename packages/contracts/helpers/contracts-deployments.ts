import { BigNumberish, Contract, Signer } from "ethers";
import { DRE, notFalsyOrZeroAddress, waitForTx } from "./misc-utils";
import {
  tEthereumAddress,
  eContractid,
  tStringTokenSmallUnits,
  AavePools,
  TokenContractId,
  iMultiPoolsAssets,
  IReserveParams,
  PoolConfiguration,
  eEthereumNetwork,
} from "./types";
import { MintableERC20 } from "../types/MintableERC20";
import { MockContract } from "ethereum-waffle";
import {
  ConfigNames,
  getReservesConfigByPool,
  loadPoolConfig,
} from "./configuration";
import {
  getAaveProtocolDataProvider,
  getAllMockedTokens,
  getAssetMappings,
  getAToken,
  getDbEntry,
  getEmergencyAdminT0,
  getTrancheAdminT1,
  getFirstSigner,
  getLendingPool,
  getLendingPoolAddressesProvider,
  getLendingPoolAddressesProviderRegistry,
  getLendingPoolCollateralManager,
  getLendingPoolConfiguratorProxy,
  getPairsTokenAggregator,
  getPriceOracle,
  getVMEXOracle,
  getvStrategyHelper,
  getWETHGateway,
  getMintableERC20,
  getIncentivesControllerProxy,
} from "./contracts-getters";
import {
  AssetMappingsFactory,
  AaveProtocolDataProviderFactory,
  ATokenFactory,
  // ATokensAndRatesHelperFactory,
  VMEXOracleFactory,
  DefaultReserveInterestRateStrategyFactory,
  DelegationAwareATokenFactory,
  // CurveOracleV2Factory,
  // CurveWrapperFactory,
  InitializableAdminUpgradeabilityProxyFactory,
  LendingPoolAddressesProviderFactory,
  LendingPoolAddressesProviderRegistryFactory,
  LendingPoolCollateralManagerFactory,
  LendingPoolConfiguratorFactory,
  LendingPoolFactory,
  MintableDelegationERC20Factory,
  MintableERC20Factory,
  MockAggregatorFactory,
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
  BaseRewardPoolFactory,
  LendingPoolAddressesProvider,
  // CurveOracleV1Factory,
  BaseUniswapOracleFactory,
  YearnTokenMockedFactory,
  WETH9Mocked,
  ATokenBeaconFactory,
  VariableDebtTokenBeaconFactory,
  UpgradeableBeacon,
  UpgradeableBeaconFactory,
  SequencerUptimeFeedFactory,
  IncentivesControllerFactory,
  ATokenMockFactory,
  VmexTokenFactory,
  ERC20,
  DoubleTransferHelper,
  StakingRewardsMockFactory,
} from "../types";
import { CrvLpStrategyLibraryAddresses } from "../types/CrvLpStrategyFactory";
import {
  withSaveAndVerify,
  registerContractInJsonDb,
  linkBytecode,
  insertContractAddressInDb,
  deployContract,
  verifyContract,
  getOptionalParamAddressPerNetwork,
  getEthersSignersAddresses,
  getContractAddressWithJsonFallback,
  getParamPerNetwork,
  getEthersSigners,
  convertToCurrencyDecimals,
  // getContractAddressWithJsonFallback,
} from "./contracts-helpers";
import { MintableDelegationERC20 } from "../types/MintableDelegationERC20";
import { readArtifact as buidlerReadArtifact } from "@nomiclabs/buidler/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { LendingPoolLibraryAddresses } from "../types/LendingPoolFactory";
import { LendingPoolConfiguratorLibraryAddresses } from "../types/LendingPoolConfiguratorFactory";
import { eNetwork } from "./types";
import AaveConfig from "../markets/aave";
import {
  claimTrancheId,
  getTranche0MockedData,
  getTranche1MockedData,
  initAssetData,
  initReservesByHelper,
} from "./init-helpers";
import { MAX_UINT_AMOUNT, MOCK_USD_PRICE_IN_WEI, oneEther, ZERO_ADDRESS } from "./constants";
import {
  deployAllMockAggregators,
  setInitialAssetPricesInOracle,
} from "./oracles-helpers";

//dev: overwrite boolean if true means we want to overwrite the implememtations, rather than upgrade them. by default it is false
export const buildTestEnv = async (deployer: Signer, overwrite?: boolean) => {
  console.time("setup");

  const network = DRE.network.name;
  const aaveAdmin = await deployer.getAddress();
  var config = loadPoolConfig(ConfigNames.Aave);
  let mockTokens: {
    [symbol: string]: MockContract | MintableERC20 | WETH9Mocked;
  };
  if (network == "localhost" || network == "hardhat") {
    console.log("deploying mock tokens");
    mockTokens = {
      ...(await deployAllMockTokens()),
    };
  }

  mockTokens = await getAllMockedTokens();
  if (!notFalsyOrZeroAddress(mockTokens["USDC"].address)) {
    console.log("deploying mock tokens");
    mockTokens = {
      ...(await deployAllMockTokens()),
    };
  }

  console.log("mockTokens[USDC]: ", mockTokens["USDC"].address);
  let addressesProvider;
  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.LendingPoolAddressesProvider)) === undefined
  )
    addressesProvider = await deployLendingPoolAddressesProvider(
      AaveConfig.MarketId
    );
  else addressesProvider = await getLendingPoolAddressesProvider();

  await waitForTx(
    await addressesProvider.setVMEXTreasury(
      "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49"
    )
  );
  console.log(
    "set vmex treasury to be",
    await addressesProvider.getVMEXTreasury()
  );
  await waitForTx(await addressesProvider.setGlobalAdmin(aaveAdmin));
  await waitForTx(await addressesProvider.setEmergencyAdmin(aaveAdmin));

  //setting users[1] as emergency admin, which is in position 2 in the DRE addresses list
  const addressList = await getEthersSignersAddresses();

  //await waitForTx(await addressesProvider.setEmergencyAdmin(addressList[2]));

  let addressesProviderRegistry;

  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.LendingPoolAddressesProviderRegistry)) ===
      undefined
  ) {
    addressesProviderRegistry =
      await deployLendingPoolAddressesProviderRegistry();
    await waitForTx(
      await addressesProviderRegistry.registerAddressesProvider(
        addressesProvider.address,
        1
      )
    );
  } else {
    addressesProviderRegistry = await getLendingPoolAddressesProviderRegistry();
  }

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

  let testHelpers;

  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.AaveProtocolDataProvider)) === undefined
  ) {
    testHelpers = await deployAaveProtocolDataProvider(
      addressesProvider.address
    );
  } else {
    testHelpers = await getAaveProtocolDataProvider();
  }

  const admin = await DRE.ethers.getSigner(
    await (await getEmergencyAdminT0()).getAddress()
  );

  var treasuryAddress = admin.address;

  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.AssetMappings)) === undefined
  ) {
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

    await initAssetData(reservesParams, allReservesAddresses, admin, false);
  }

  let lendingPoolProxy;
  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.LendingPool)) === undefined
  ) {
    const lendingPoolImpl = await deployLendingPool();

    if (overwrite) {
      await waitForTx(
        //hard replace existing proxy address with 0x0 so it can
        await addressesProvider.setAddress("LENDING_POOL", ZERO_ADDRESS)
      );
    }

    await waitForTx(
      await addressesProvider.setLendingPoolImpl(lendingPoolImpl.address)
    );

    const lendingPoolAddress = await addressesProvider.getLendingPool();
    lendingPoolProxy = await getLendingPool(lendingPoolAddress);

    await insertContractAddressInDb(
      eContractid.LendingPool,
      lendingPoolProxy.address
    );
  } else {
    const lendingPoolAddress = await addressesProvider.getLendingPool();
    lendingPoolProxy = await getLendingPool(lendingPoolAddress);
  }

  let lendingPoolConfiguratorProxy;

  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.LendingPoolConfigurator)) === undefined
  ) {
    const lendingPoolConfiguratorImpl = await deployLendingPoolConfigurator();

    if (overwrite) {
      await waitForTx(
        //hard replace existing proxy address with 0x0 so it can
        await addressesProvider.setAddress(
          "LENDING_POOL_CONFIGURATOR",
          ZERO_ADDRESS
        )
      );
    }
    await waitForTx(
      await addressesProvider.setLendingPoolConfiguratorImpl(
        lendingPoolConfiguratorImpl.address
      )
    );

    lendingPoolConfiguratorProxy = await getLendingPoolConfiguratorProxy(
      await addressesProvider.getLendingPoolConfigurator()
    );
    await insertContractAddressInDb(
      eContractid.LendingPoolConfigurator,
      lendingPoolConfiguratorProxy.address
    );
  } else {
    lendingPoolConfiguratorProxy = await getLendingPoolConfiguratorProxy(
      await addressesProvider.getLendingPoolConfigurator()
    );
  }

  let VMEXOracleProxy; //assuming fallback oracle succeeded if vmex oracle succeeded

  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.VMEXOracle)) === undefined
  ) {
    const MOCK_USD_PRICE_IN_WEI =
      AaveConfig.ProtocolGlobalParams.MockUsdPriceInWei;
    const ALL_ASSETS_INITIAL_PRICES = AaveConfig.Mocks.AllAssetsInitialPrices;
    const USD_ADDRESS = AaveConfig.ProtocolGlobalParams.UsdAddress;

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
        YFI: mockTokens.YFI.address,
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
        ThreeCRV: ZERO_ADDRESS,
        StethEth: mockTokens.StethEth.address,
        Steth: mockTokens.Steth.address,
        FraxUSDC: mockTokens.FraxUSDC.address,
        Frax3Crv: mockTokens.Frax3Crv.address,
        FRAX: mockTokens.FRAX.address,
        BAL: mockTokens.BAL.address,
        CRV: mockTokens.CRV.address,
        CVX: mockTokens.CVX.address,
        BADGER: mockTokens.BADGER.address,
        LDO: mockTokens.LDO.address,
        ALCX: mockTokens.ALCX.address,
        Oneinch: mockTokens.Oneinch.address,
        yvTricrypto2: mockTokens.yvTricrypto2.address,
        yvThreePool: mockTokens.yvThreePool.address,
        yvStethEth: mockTokens.yvStethEth.address,
        yvFraxUSDC: mockTokens.yvFraxUSDC.address,
        yvFrax3Crv: mockTokens.yvFrax3Crv.address,
        wstETH: ZERO_ADDRESS,
        wstETHCRV: ZERO_ADDRESS,
        sUSD3CRV: ZERO_ADDRESS,
        OP: ZERO_ADDRESS,
        mooCurveFsUSD: ZERO_ADDRESS,
        mooCurveWSTETH: ZERO_ADDRESS,
        velo_wstETHWETH: ZERO_ADDRESS,
        moo_velo_wstETHWETH: ZERO_ADDRESS,
        velo_USDCsUSD: ZERO_ADDRESS,
        moo_velo_USDCsUSD: ZERO_ADDRESS,
        velo_ETHUSDC: ZERO_ADDRESS,
        moo_velo_ETHUSDC: ZERO_ADDRESS,
        velo_OPETH: ZERO_ADDRESS,
        moo_velo_OPETH: ZERO_ADDRESS,
        velo_ETHSNX: ZERO_ADDRESS,
        moo_velo_ETHSNX: ZERO_ADDRESS,
        velo_OPUSDC: ZERO_ADDRESS,
        moo_velo_OPUSDC: ZERO_ADDRESS,
        velo_DAIUSDC: ZERO_ADDRESS,
        moo_velo_DAIUSDC: ZERO_ADDRESS,
        velo_FRAXUSDC: ZERO_ADDRESS,
        moo_velo_FRAXUSDC: ZERO_ADDRESS,
        velo_USDTUSDC: ZERO_ADDRESS,
        moo_velo_USDTUSDC: ZERO_ADDRESS,
        beethoven_USDCDAI: ZERO_ADDRESS,
        beethoven_wstETHETH: ZERO_ADDRESS,
        rETH: ZERO_ADDRESS,
        beethoven_rETHETH: ZERO_ADDRESS,
        yvUSDC: ZERO_ADDRESS,
        yvUSDT: ZERO_ADDRESS,
        yvDAI: ZERO_ADDRESS,
        yvWETH: ZERO_ADDRESS,
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
    VMEXOracleProxy = await getVMEXOracle(VMEXOracleAddress);

    await insertContractAddressInDb(
      eContractid.VMEXOracle,
      VMEXOracleProxy.address
    );

    console.log("Set addresses provider price oracle as vmex oracle");

    await waitForTx(
      await VMEXOracleProxy.connect(admin).setBaseCurrency(
        mockTokens.WETH.address,
        18,
        oneEther.toString(),
        "ETH"
      )
    );

    console.log("Set vmex oracle base currency");
    await waitForTx(
      await VMEXOracleProxy.connect(admin).setFallbackOracle(
        fallbackOracle.address
      )
    );

    console.log("Set vmex oracle fallback oracle");


    console.log("WETH addr: ",mockTokens["WETH"].address)
    await waitForTx(await VMEXOracleProxy.setWETH(mockTokens["WETH"].address));

    //we want to use the fallback oracle, so don't set aggregators
    // await waitForTx(
    //   await VMEXOracleProxy.connect(admin).setAssetSources(
    //     tokens,
    //     aggregators
    //     )
    // );

    // console.log("Set vmex oracle aggregators")
  }

  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.AToken)) === undefined
  ) {
    console.log("Deploying atoken implementations");
    await deployATokenImplementations(ConfigNames.Aave, reservesParams, false);
    const aTokenImplAddress = await getContractAddressWithJsonFallback(
      eContractid.AToken, //this is implementation contract
      ConfigNames.Aave
    );
    const varDebtTokenImplAddress = await getContractAddressWithJsonFallback(
      eContractid.VariableDebtToken,
      ConfigNames.Aave
    );
    await waitForTx(await addressesProvider.setATokenImpl(aTokenImplAddress));

    await waitForTx(
      await addressesProvider.setVariableDebtToken(varDebtTokenImplAddress)
    );

    const aTokenBeacon = await deployATokenBeacon([aTokenImplAddress], false);

    await waitForTx(
      await addressesProvider.setATokenBeacon(aTokenBeacon.address)
    );

    const variableDebtBeacon = await deployVariableDebtTokenBeacon(
      [varDebtTokenImplAddress],
      false
    );

    await waitForTx(
      await addressesProvider.setVariableDebtTokenBeacon(
        variableDebtBeacon.address
      )
    );
  }

  if (network == "localhost" || network == "hardhat") {
    console.log("Adding whitelisted addresses");
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
  } else {
    console.log("Setting permissionless tranches");
    await waitForTx(await addressesProvider.setPermissionlessTranches(true));
  }

  //-------------------------------------------------------------
  //deploy tranche 0
  // config = await loadCustomAavePoolConfig("0");
  // reservesParams = {
  //   ...config.ReservesConfig,
  // };
  console.log("Before init reserves");
  //reset tranches admins 0 and 1 (the other tranche admins will be overwritten)
  if (overwrite) {
    await addressesProvider.setTrancheAdmin(ZERO_ADDRESS, "0");
    await addressesProvider.setTrancheAdmin(ZERO_ADDRESS, "1");
  }

  if (
    network == "localhost" ||
    network == "hardhat" ||
    !notFalsyOrZeroAddress(await addressesProvider.getTrancheAdmin("0"))
  ) {
    console.log("Claiming and deploying tranche 0");
    await claimTrancheId("Vmex tranche 0", admin);

    let [
      assets0,
      reserveFactors0,
      forceDisabledBorrow0,
      forceDisabledCollateral0,
    ] = getTranche0MockedData(allReservesAddresses);

    await initReservesByHelper(
      assets0,
      reserveFactors0,
      forceDisabledBorrow0,
      forceDisabledCollateral0,
      admin,
      treasuryAddress,
      0
    );
  }

  //-------------------------------------------------------------

  //-------------------------------------------------------------
  //deploy tranche 1 with tricrypto

  const user1 = await DRE.ethers.getSigner(
    await (await getTrancheAdminT1(network)).getAddress()
  );
  if (
    network == "localhost" ||
    network == "hardhat" ||
    !notFalsyOrZeroAddress(await addressesProvider.getTrancheAdmin("1"))
  ) {
    await claimTrancheId("Vmex tranche 1", user1);
    treasuryAddress = user1.address;

    let [
      assets1,
      reserveFactors1,
      forceDisabledBorrow1,
      forceDisabledCollateral1,
    ] = getTranche1MockedData(allReservesAddresses);
    console.log("Start init reserves");
    await initReservesByHelper(
      assets1,
      reserveFactors1,
      forceDisabledBorrow1,
      forceDisabledCollateral1,
      user1,
      treasuryAddress,
      1
    );
  }

  //-------------------------------------------------------------
  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.LendingPoolCollateralManager)) === undefined
  ) {
    const collateralManager = await deployLendingPoolCollateralManager();
    await waitForTx(
      await addressesProvider.setLendingPoolCollateralManager(
        collateralManager.address
      )
    );
    const lendingPoolCMProxy =
      await addressesProvider.getLendingPoolCollateralManager();

    await insertContractAddressInDb(
      eContractid.LendingPoolCollateralManager,
      lendingPoolCMProxy
    );
  }

  if (
    network == "localhost" ||
    network == "hardhat" ||
    (await getDbEntry(eContractid.WETHGateway)) === undefined
  ) {
    const gateWay = await deployWETHGateway([mockTokens.WETH.address]);
    await authorizeWETHGateway(gateWay.address, lendingPoolProxy.address);
  }

  //-------------------------------------------------------------
  // Deploy Vmex Token

  const vmexToken = await deployVmexToken();

  // Deploy Incentives Controller
  const signers = await getEthersSigners();
  const vaultOfRewards = signers[3];
  const rewardToken = await getMintableERC20(mockTokens.USDC.address);

  // give the vault reward tokens to distribute
  await rewardToken.connect(vaultOfRewards).mint(await convertToCurrencyDecimals(mockTokens.USDC.address,"1000000000000000.0"));
  console.log(`minted USDC ${await rewardToken.balanceOf(await vaultOfRewards.getAddress())}`)

  const proxyAdmin = signers[4];
  const vmexIncentivesControllerProxy = await setupVmexIncentives(
    await vaultOfRewards.getAddress()
  );

  const rewardTokens = [rewardToken, vmexToken];
  for (const token of rewardTokens) {
    await waitForTx(
      await token
        .connect(vaultOfRewards)
        .approve(vmexIncentivesControllerProxy.address, MAX_UINT_AMOUNT)
    );
  }

  const aDai = await deployATokenMock(vmexIncentivesControllerProxy.address, addressesProvider.address, "aDai");
  const aAave = await deployATokenMock(vmexIncentivesControllerProxy.address, addressesProvider.address, "aAave");
  const aBusd = await deployATokenMock(vmexIncentivesControllerProxy.address, addressesProvider.address, "aBusd");
  const aUsdt = await deployATokenMock(vmexIncentivesControllerProxy.address, addressesProvider.address, "aUsdt");
  const aWeth = await deployATokenMock(vmexIncentivesControllerProxy.address, addressesProvider.address, "aWeth");

  // need mocks used for linking external rewards to link to 'real' tokens
  await aDai.setUnderlying(mockTokens["DAI"].address)
  await aBusd.setUnderlying(mockTokens["BUSD"].address)
  await aAave.setUnderlying(mockTokens["AAVE"].address)
  await aUsdt.setUnderlying(mockTokens["USDT"].address)
  await aWeth.setUnderlying(mockTokens["WETH"].address)

  // deploy and fund test staking contracts
  const stakingA = await deployStakingRewardsMock([rewardToken.address, mockTokens["DAI"].address], "yaDai");
  const stakingB = await deployStakingRewardsMock([rewardToken.address, mockTokens["DAI"].address], "yaDaiCp");
  const stakingC = await deployStakingRewardsMock([rewardToken.address, mockTokens["BUSD"].address], "yaBusd");
  const stakingD = await deployStakingRewardsMock([rewardToken.address, mockTokens["AAVE"].address], "yaAave");
  const stakingE = await deployStakingRewardsMock([rewardToken.address, mockTokens["USDT"].address], "yaUsdt");
  const stakingF = await deployStakingRewardsMock([rewardToken.address, mockTokens["WETH"].address], "yaWeth");
  const stakingG = await deployStakingRewardsMock([rewardToken.address, mockTokens["yvTricrypto2"].address], "yayvTricrypto2");

  await rewardToken.connect(vaultOfRewards).transfer(stakingA.address, await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  console.log(`staking A received USDC ${await rewardToken.balanceOf(stakingA.address)}`)
  await stakingA.notifyRewardAmount(await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  console.log('first notifyReward succeeded')

  await rewardToken.connect(vaultOfRewards).transfer(stakingB.address, await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await stakingB.notifyRewardAmount(await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));

  await rewardToken.connect(vaultOfRewards).transfer(stakingC.address, await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await stakingC.notifyRewardAmount(await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await rewardToken.connect(vaultOfRewards).transfer(stakingD.address, await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await stakingD.notifyRewardAmount(await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await rewardToken.connect(vaultOfRewards).transfer(stakingE.address, await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await stakingE.notifyRewardAmount(await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await rewardToken.connect(vaultOfRewards).transfer(stakingF.address, await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await stakingF.notifyRewardAmount(await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await rewardToken.connect(vaultOfRewards).transfer(stakingG.address, await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));
  await stakingG.notifyRewardAmount(await convertToCurrencyDecimals(mockTokens.USDC.address,"100000000000000.0"));

  // const ic = await getIncentivesControllerProxy();
  // await ic.batchAddStakingRewards(
  //   [aDai.address, aBusd.address, aAave.address, aUsdt.address],
  //   [stakingA.address, stakingC.address, stakingD.address, stakingE.address],
  //   [rewardToken.address, rewardToken.address, rewardToken.address, rewardToken.address]
  // )

  console.timeEnd("setup");
};

const readArtifact = async (id: string) => {
  if (DRE.network.name === eEthereumNetwork.buidlerevm) {
    return buidlerReadArtifact(DRE.config.paths.artifacts, id);
  }
  return (DRE as HardhatRuntimeEnvironment).artifacts.readArtifact(id);
};

export const deployLendingPoolAddressesProvider = async (
  marketId: string,
  verify?: boolean
) =>
  withSaveAndVerify(
    await new LendingPoolAddressesProviderFactory(
      await getFirstSigner()
    ).deploy(marketId),
    eContractid.LendingPoolAddressesProvider,
    [marketId],
    verify
  );

export const deployLendingPoolAddressesProviderRegistry = async (
  verify?: boolean
) =>
  withSaveAndVerify(
    await new LendingPoolAddressesProviderRegistryFactory(
      await getFirstSigner()
    ).deploy(),
    eContractid.LendingPoolAddressesProviderRegistry,
    [],
    verify
  );

export const deployLendingPoolConfigurator = async (verify?: boolean) => {
  const lendingPoolConfiguratorImpl = await new LendingPoolConfiguratorFactory(
    await getFirstSigner()
  ).deploy();
  await insertContractAddressInDb(
    eContractid.LendingPoolConfiguratorImpl,
    lendingPoolConfiguratorImpl.address
  );
  return withSaveAndVerify(
    lendingPoolConfiguratorImpl,
    eContractid.LendingPoolConfigurator,
    [],
    verify
  );
};

export const deployReserveLogicLibrary = async (verify?: boolean) =>
  withSaveAndVerify(
    await new ReserveLogicFactory(await getFirstSigner()).deploy(),
    eContractid.ReserveLogic,
    [],
    verify
  );

export const deployGenericLogic = async (
  reserveLogic: Contract,
  verify?: boolean
) => {
  const genericLogicArtifact = await readArtifact(eContractid.GenericLogic);

  const linkedGenericLogicByteCode = linkBytecode(genericLogicArtifact, {
    [eContractid.ReserveLogic]: reserveLogic.address,
  });

  const genericLogicFactory = await DRE.ethers.getContractFactory(
    genericLogicArtifact.abi,
    linkedGenericLogicByteCode
  );

  const genericLogic = await (
    await genericLogicFactory.connect(await getFirstSigner()).deploy()
  ).deployed();
  return withSaveAndVerify(genericLogic, eContractid.GenericLogic, [], verify);
};

export const deployValidationLogic = async (
  reserveLogic: Contract,
  genericLogic: Contract,
  verify?: boolean
) => {
  const validationLogicArtifact = await readArtifact(
    eContractid.ValidationLogic
  );

  const linkedValidationLogicByteCode = linkBytecode(validationLogicArtifact, {
    [eContractid.ReserveLogic]: reserveLogic.address,
    [eContractid.GenericLogic]: genericLogic.address,
  });

  const validationLogicFactory = await DRE.ethers.getContractFactory(
    validationLogicArtifact.abi,
    linkedValidationLogicByteCode
  );

  const validationLogic = await (
    await validationLogicFactory.connect(await getFirstSigner()).deploy()
  ).deployed();

  return withSaveAndVerify(
    validationLogic,
    eContractid.ValidationLogic,
    [],
    verify
  );
};

export const deployDepositWithdrawLogic = async (
  reserveLogic: Contract,
  genericLogic: Contract,
  validationLogic: Contract,
  verify?: boolean
) => {
  const depositWithdrawLogicArtifact = await readArtifact(
    eContractid.DepositWithdrawLogic
  );

  const linkedValidationLogicByteCode = linkBytecode(
    depositWithdrawLogicArtifact,
    {
      [eContractid.ReserveLogic]: reserveLogic.address,
      [eContractid.GenericLogic]: genericLogic.address,
      [eContractid.ValidationLogic]: validationLogic.address,
    }
  );

  const depositWithdrawLogicFactory = await DRE.ethers.getContractFactory(
    depositWithdrawLogicArtifact.abi,
    linkedValidationLogicByteCode
  );

  const depositWithdrawLogic = await (
    await depositWithdrawLogicFactory.connect(await getFirstSigner()).deploy()
  ).deployed();

  return withSaveAndVerify(
    depositWithdrawLogic,
    eContractid.DepositWithdrawLogic,
    [],
    verify
  );
};

export const deployAaveLibraries = async (
  verify?: boolean
): Promise<LendingPoolLibraryAddresses> => {
  const reserveLogic = await deployReserveLogicLibrary(verify);
  const genericLogic = await deployGenericLogic(reserveLogic, verify);
  const validationLogic = await deployValidationLogic(
    reserveLogic,
    genericLogic,
    verify
  );
  const depositWithdrawLogic = await deployDepositWithdrawLogic(
    reserveLogic,
    genericLogic,
    validationLogic,
    verify
  );

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

export const deployLendingPool = async (verify?: boolean) => {
  const libraries = await deployAaveLibraries(verify);
  const lendingPoolImpl = await new LendingPoolFactory(
    libraries,
    await getFirstSigner()
  ).deploy();
  await insertContractAddressInDb(
    eContractid.LendingPoolImpl,
    lendingPoolImpl.address
  );
  return withSaveAndVerify(
    lendingPoolImpl,
    eContractid.LendingPool,
    [],
    verify
  );
};

export const deployPriceOracle = async (verify?: boolean) =>
  withSaveAndVerify(
    await new PriceOracleFactory(await getFirstSigner()).deploy(),
    eContractid.PriceOracle,
    [],
    verify
  );

export const deployMockAggregator = async (
  price: tStringTokenSmallUnits,
  verify?: boolean
) =>
  withSaveAndVerify(
    await new MockAggregatorFactory(await getFirstSigner()).deploy(price),
    eContractid.MockAggregator,
    [price],
    verify
  );

export const deployVMEXOracle = async (verify?: boolean) =>
  withSaveAndVerify(
    await new VMEXOracleFactory(await getFirstSigner()).deploy(),
    eContractid.VMEXOracle,
    [],
    verify
  );

export const deploySequencerUptimeFeed = async (verify?: boolean) =>
  withSaveAndVerify(
    await new SequencerUptimeFeedFactory(await getFirstSigner()).deploy(),
    eContractid.SequencerUptimeFeed,
    [],
    verify
  );

export const deployUniswapOracle = async (verify?: boolean) =>
  withSaveAndVerify(
    await new BaseUniswapOracleFactory(await getFirstSigner()).deploy(),
    eContractid.BaseUniswapOracle,
    [],
    verify
  );
export const deployLendingPoolCollateralManager = async (verify?: boolean) => {
  const collateralManagerImpl = await new LendingPoolCollateralManagerFactory(
    await getFirstSigner()
  ).deploy();
  await insertContractAddressInDb(
    eContractid.LendingPoolCollateralManagerImpl,
    collateralManagerImpl.address
  );
  return withSaveAndVerify(
    collateralManagerImpl,
    eContractid.LendingPoolCollateralManager,
    [],
    verify
  );
};

export const deployInitializableAdminUpgradeabilityProxy = async (
  verify?: boolean
) =>
  withSaveAndVerify(
    await new InitializableAdminUpgradeabilityProxyFactory(
      await getFirstSigner()
    ).deploy(),
    eContractid.InitializableAdminUpgradeabilityProxy,
    [],
    verify
  );

export const deployWalletBalancerProvider = async (verify?: boolean) =>
  withSaveAndVerify(
    await new WalletBalanceProviderFactory(await getFirstSigner()).deploy(),
    eContractid.WalletBalanceProvider,
    [],
    verify
  );

export const deployAaveProtocolDataProvider = async (
  addressesProvider: tEthereumAddress,
  verify?: boolean
) =>
  withSaveAndVerify(
    await new AaveProtocolDataProviderFactory(await getFirstSigner()).deploy(
      addressesProvider
    ),
    eContractid.AaveProtocolDataProvider,
    [addressesProvider],
    verify
  );

export const deployMintableERC20 = async (
  args: [string, string, string],
  verify?: boolean
): Promise<MintableERC20> =>
  withSaveAndVerify(
    await new MintableERC20Factory(await getFirstSigner()).deploy(...args),
    eContractid.MintableERC20,
    args,
    verify
  );

export const deployMintableDelegationERC20 = async (
  args: [string, string, string],
  verify?: boolean
): Promise<MintableDelegationERC20> =>
  withSaveAndVerify(
    await new MintableDelegationERC20Factory(await getFirstSigner()).deploy(
      ...args
    ),
    eContractid.MintableDelegationERC20,
    args,
    verify
  );
export const deployDefaultReserveInterestRateStrategy = async (
  args: [tEthereumAddress, string, string, string, string],
  verify: boolean
) =>
  withSaveAndVerify(
    await new DefaultReserveInterestRateStrategyFactory(
      await getFirstSigner()
    ).deploy(...args),
    eContractid.DefaultReserveInterestRateStrategy,
    args,
    verify
  );

export const deployVariableDebtToken = async (
  args: [tEthereumAddress, tEthereumAddress, tEthereumAddress, string, string],
  verify: boolean
) => {
  const instance = await withSaveAndVerify(
    await new VariableDebtTokenFactory(await getFirstSigner()).deploy(),
    eContractid.VariableDebtToken,
    [],
    verify
  );

  await instance.initialize(
    args[0],
    args[1],
    0, //set tranche to zero for now
    args[2],
    "18",
    args[3],
    args[4],
    "0x10"
  );

  return instance;
};

export const deployGenericVariableDebtToken = async (verify?: boolean) =>
  withSaveAndVerify(
    await new VariableDebtTokenFactory(await getFirstSigner()).deploy(),
    eContractid.VariableDebtToken,
    [],
    verify
  );

export const deployGenericAToken = async (
  [
    poolAddress,
    underlyingAssetAddress,
    treasuryAddress,
    incentivesController,
    name,
    symbol,
  ]: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string
  ],
  verify: boolean
) => {
  const instance = await withSaveAndVerify(
    await new ATokenFactory(await getFirstSigner()).deploy(),
    eContractid.AToken,
    [],
    verify
  );

  await instance.initialize(
    poolAddress,
    {
      treasury: treasuryAddress,
      underlyingAsset: underlyingAssetAddress,
      tranche: 0,
    }, //set tranche to zero for now
    incentivesController,
    "18",
    name,
    symbol,
    "0x10"
  );

  return instance;
};

export const deployGenericATokenImpl = async (verify: boolean) =>
  withSaveAndVerify(
    await new ATokenFactory(await getFirstSigner()).deploy(),
    eContractid.AToken,
    [],
    verify
  );

export const deployDelegationAwareATokenImpl = async (verify: boolean) =>
  withSaveAndVerify(
    await new DelegationAwareATokenFactory(await getFirstSigner()).deploy(),
    eContractid.DelegationAwareAToken,
    [],
    verify
  );

export const deployAllMockTokens = async (verify?: boolean) => {
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

    if (
      tokenSymbol === "yvTricrypto2" ||
      tokenSymbol === "yvThreePool" ||
      tokenSymbol === "yvStethEth" ||
      tokenSymbol === "yvFraxUSDC" ||
      tokenSymbol === "yvFrax3Crv"
    ) {
      tokens[tokenSymbol] = await deployYearnTokenMocked([
        tokenSymbol,
        tokenSymbol,
        configData ? configData.reserveDecimals : 18,
        tokens[tokenSymbol.substring(2)].address,
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

export const deployMockTokens = async (
  config: PoolConfiguration,
  verify?: boolean
) => {
  const tokens: { [symbol: string]: MockContract | MintableERC20 } = {};
  const defaultDecimals = 18;

  const configData = config.ReservesConfig;

  for (const tokenSymbol of Object.keys(configData)) {
    tokens[tokenSymbol] = await deployMintableERC20(
      [
        tokenSymbol,
        tokenSymbol,
        configData[tokenSymbol as keyof iMultiPoolsAssets<IReserveParams>]
          .reserveDecimals || defaultDecimals.toString(),
      ],
      verify
    );
    await registerContractInJsonDb(
      tokenSymbol.toUpperCase(),
      tokens[tokenSymbol]
    );
  }
  return tokens;
};

export const deployWETHGateway = async (
  args: [tEthereumAddress],
  verify?: boolean
) =>
  withSaveAndVerify(
    await new WETHGatewayFactory(await getFirstSigner()).deploy(...args),
    eContractid.WETHGateway,
    args,
    verify
  );

export const authorizeWETHGateway = async (
  wethGateWay: tEthereumAddress,
  lendingPool: tEthereumAddress
) =>
  await new WETHGatewayFactory(await getFirstSigner())
    .attach(wethGateWay)
    .authorizeLendingPool(lendingPool);

export const deployWETHMocked = async (verify?: boolean) =>
  withSaveAndVerify(
    await new WETH9MockedFactory(await getFirstSigner()).deploy(),
    eContractid.WETHMocked,
    [],
    verify
  );

export const deployYearnTokenMocked = async (
  args: [string, string, string, string],
  verify?: boolean
) =>
  withSaveAndVerify(
    await new YearnTokenMockedFactory(await getFirstSigner()).deploy(...args),
    eContractid.YearnTokenMocked,
    [],
    verify
  );

export const deployMockVariableDebtToken = async (
  args: [tEthereumAddress, tEthereumAddress, tEthereumAddress],
  verify?: boolean
) => {
  const instance = await withSaveAndVerify(
    await new MockVariableDebtTokenFactory(await getFirstSigner()).deploy(),
    eContractid.MockVariableDebtToken,
    [],
    verify
  );

  await instance.initialize(args[0], args[1], 0, args[2]);

  return instance;
};

export const deployMockAToken = async (
  [pool, configurator, addressesProvider, underlyingAssetAddress, tranche]: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    string,
    string
  ],
  verify?: boolean
) => {
  const instance = await withSaveAndVerify(
    await new MockATokenFactory(await getFirstSigner()).deploy(),
    eContractid.MockAToken,
    [],
    verify
  );

  await instance.initialize(pool, {
    underlyingAsset: underlyingAssetAddress,
    trancheId: tranche,
    lendingPoolConfigurator: configurator,
    addressesProvider: addressesProvider,
  });

  return instance;
};

export const deploySelfdestructTransferMock = async (verify?: boolean) =>
  withSaveAndVerify(
    await new SelfdestructTransferFactory(await getFirstSigner()).deploy(),
    eContractid.SelfdestructTransferMock,
    [],
    verify
  );

export const chooseATokenDeployment = (id: eContractid) => {
  switch (id) {
    case eContractid.AToken:
      return deployGenericATokenImpl;
    case eContractid.DelegationAwareAToken:
      return deployDelegationAwareATokenImpl;
    default:
      throw Error(`Missing aToken implementation deployment script for: ${id}`);
  }
};

export const deployATokenImplementations = async (
  pool: ConfigNames,
  reservesConfig: { [key: string]: IReserveParams },
  // addressesProvider: LendingPoolAddressesProvider,
  verify = false
) => {
  const poolConfig = loadPoolConfig(pool);
  const network = <eNetwork>DRE.network.name;

  // Obtain the different AToken implementations of all reserves inside the Market config
  const aTokenImplementations = [
    ...Object.entries(reservesConfig).reduce<Set<eContractid>>(
      (acc, [, entry]) => {
        acc.add(entry.aTokenImpl);
        return acc;
      },
      new Set<eContractid>()
    ),
  ];

  for (let x = 0; x < aTokenImplementations.length; x++) {
    const aTokenAddress = getOptionalParamAddressPerNetwork(
      poolConfig[aTokenImplementations[x].toString()],
      network
    );
    if (!notFalsyOrZeroAddress(aTokenAddress)) {
      const deployImplementationMethod = chooseATokenDeployment(
        aTokenImplementations[x]
      );
      console.log(`Deploying implementation`, aTokenImplementations[x]);
      await deployImplementationMethod(verify);
      // if(aTokenImplementations[x] == eContractid.AToken){
      //   await waitForTx(
      //     await addressesProvider.setATokenImpl(

      //     )
      //   );
      // }
    }
  }

  // Debt tokens, for now all Market configs follows same implementations
  const geneticVariableDebtTokenAddress = getOptionalParamAddressPerNetwork(
    poolConfig.VariableDebtTokenImplementation,
    network
  );

  if (!notFalsyOrZeroAddress(geneticVariableDebtTokenAddress)) {
    await deployGenericVariableDebtToken(verify);
  }
};

export const deployATokenBeacon = async (
  args: [tEthereumAddress],
  verify: boolean
) =>
  withSaveAndVerify(
    await new UpgradeableBeaconFactory(await getFirstSigner()).deploy(...args),
    eContractid.ATokenBeacon,
    [],
    verify
  );

export const deployVariableDebtTokenBeacon = async (
  args: [tEthereumAddress],
  verify: boolean
) =>
  withSaveAndVerify(
    await new UpgradeableBeaconFactory(await getFirstSigner()).deploy(...args),
    eContractid.VariableDebtTokenBeacon,
    [],
    verify
  );

export const deployRateStrategy = async (
  strategyName: string,
  args: [tEthereumAddress, string, string, string, string],
  verify: boolean
): Promise<tEthereumAddress> => {
  switch (strategyName) {
    default:
      return await (
        await deployDefaultReserveInterestRateStrategy(args, verify)
      ).address;
  }
};
export const deployAssetMapping = async (verify?: boolean) =>
  withSaveAndVerify(
    await new AssetMappingsFactory(await getFirstSigner()).deploy(),
    eContractid.AssetMappings,
    [],
    verify
  );

export const deployIncentivesController = async (
  verify?: boolean
) =>
  withSaveAndVerify(
    await new IncentivesControllerFactory(await getFirstSigner()).deploy(),
    eContractid.IncentivesControllerImpl,
    [],
    verify
  );

export const deployATokenMock = async (
  aicAddress: tEthereumAddress,
  addressProvAddress: tEthereumAddress,
  id?: string,
  verify?: boolean
) =>
  withSaveAndVerify(
    await new ATokenMockFactory(await getFirstSigner()).deploy(aicAddress, addressProvAddress),
    id || eContractid.ATokenMock,
    [],
    verify
  );

export const deployVmexToken = async (
  verify?: boolean
) =>
  withSaveAndVerify(
    await new VmexTokenFactory(await getFirstSigner()).deploy(),
    eContractid.VmexToken,
    [],
    verify
  );

export const deployStakingRewardsMock = async (
  args: [tEthereumAddress, tEthereumAddress],
  id?: string,
  verify?: boolean
) =>
  withSaveAndVerify(
    await new StakingRewardsMockFactory(await getFirstSigner()).deploy(
      ...args
    ),
    id || eContractid.StakingRewardsMock,
    [],
    verify
  );

export const setupVmexIncentives = async (
  vaultOfRewards: tEthereumAddress,
  verify?: boolean
) => {
  const addressesProvider = await getLendingPoolAddressesProvider();

  const vmexIncentivesControllerImplementation =
    await deployIncentivesController();

  await addressesProvider.setIncentivesController(vmexIncentivesControllerImplementation.address);

  const vmexIncentivesControllerProxy = await getIncentivesControllerProxy(await addressesProvider.getIncentivesController());

  await insertContractAddressInDb(
    eContractid.IncentivesControllerProxy,
    vmexIncentivesControllerProxy.address
  );

  console.log("Done set incentives controller in addresses provider")

  await vmexIncentivesControllerProxy.setRewardsVault(vaultOfRewards);

  return vmexIncentivesControllerProxy;
};

export const deployDoubleTransferHelper = async (aaveToken: tEthereumAddress, verify?: boolean) => {
  const id = eContractid.DoubleTransferHelper;
  const args = [aaveToken];
  const instance = await deployContract<DoubleTransferHelper>(id, args);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(id, instance, args);
  }
  return instance;
};
