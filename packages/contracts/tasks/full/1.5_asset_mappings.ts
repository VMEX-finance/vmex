import { task } from "hardhat/config";
import { deployLendingPoolAddressesProvider } from "../../helpers/contracts-deployments";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  deployLendingPoolCollateralManager,
  deployWalletBalancerProvider,
  authorizeWETHGateway,
  deployUiPoolDataProviderV2,
  deployAssetMapping,
  deployStrategies,
} from "../../helpers/contracts-deployments";
import {
  loadPoolConfig,
  ConfigNames,
  getEmergencyAdmin,
} from "../../helpers/configuration";
import { eNetwork, ICommonConfiguration } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  initAssetData,
} from "../../helpers/init-helpers";
import { exit } from "process";
import {
  getAaveProtocolDataProvider,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
  getAssetMappings,
  getWETHGateway
} from "../../helpers/contracts-getters";

task(
  "full:deploy-asset-mappings",
  "Deploy address provider, registry and fee provider for dev enviroment"
)
  .addFlag("verify", "Verify contracts at Etherscan")
  .addParam(
    "pool",
    `Pool name to retrieve configuration, supported: ${Object.values(
      ConfigNames
    )}`
  )
  .setAction(async ({ verify, pool, skipRegistry }, DRE) => {
    await DRE.run("set-DRE");
    const network = <eNetwork>DRE.network.name;
      const poolConfig = loadPoolConfig(ConfigNames.Aave);//await loadCustomAavePoolConfig("0"); //this is only for mainnet
      const {
        ATokenNamePrefix,
        StableDebtTokenNamePrefix,
        VariableDebtTokenNamePrefix,
        SymbolPrefix,
        ReserveAssets,
        ReservesConfig,
        LendingPoolCollateralManager,
        WethGateway,
        IncentivesController,
      } = poolConfig as ICommonConfiguration;

      const reserveAssets = await getParamPerNetwork(ReserveAssets, network);

      const addressesProvider = await getLendingPoolAddressesProvider();

      const admin = await DRE.ethers.getSigner(
        await addressesProvider.getGlobalAdmin()
      );

      // const oracle = await addressesProvider.getPriceOracle();

      if (!reserveAssets) {
        throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
      }

      console.log("before initReservesByHelper");

      //deploy AssetMappings
  const AssetMapping = await deployAssetMapping(addressesProvider.address);

  await waitForTx(
    await addressesProvider.setAssetMappings(AssetMapping.address)
  );

  const assetMappings = await getAssetMappings();

  await initAssetData(
    ReservesConfig,
    reserveAssets,
    ATokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
    admin,
    false
  );

  // deploy strategies
  const [CrvLpStrategy,CrvLpEthStrategy, CvxStrategy] = await deployStrategies();

  console.log(
    "DEPLOYED CrvLp Strat at address",
    CrvLpStrategy.address
  );

  await waitForTx(
    await assetMappings.
    connect(admin).
    addCurveStrategyAddress(//tricrypto uses this
      "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff",
      CrvLpStrategy.address
    ) 
  ); //0 is default strategy

  await waitForTx(
    await assetMappings.connect(admin).addCurveStrategyAddress("0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",CrvLpStrategy.address) //threepool uses this
  ); //0 is default strategy


  await waitForTx(
    await assetMappings.
    connect(admin).
    addCurveStrategyAddress(//steth uses eth
      "0x06325440D014e39736583c165C2963BA99fAf14E",
      CrvLpEthStrategy.address
    ) 
  ); //0 is default strategy
  await waitForTx(
    await assetMappings.
    connect(admin).
    addCurveStrategyAddress(//fraxusdc uses this
      "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC",
      CrvLpStrategy.address
    ) 
  ); //0 is default strategy
  await waitForTx(
    await assetMappings.
    connect(admin).
    addCurveStrategyAddress(//frax3crv uses this
      "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
      CrvLpStrategy.address
    ) 
  ); //0 is default strategy

  await waitForTx(
    await assetMappings.
    connect(admin).
    addCurveStrategyAddress(//cvx uses this
      "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
      CvxStrategy.address
    ) 
  ); //0 is default strategy
  });
