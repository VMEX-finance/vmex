import { task } from "hardhat/config";
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
  loadCustomAavePoolConfig,
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
import {
  chainlinkAggregatorProxy,
  chainlinkEthUsdAggregatorProxy,
} from "../../helpers/constants";

task(
  "full:initialize-lending-pool",
  "Initialize lending pool tranche 0 configuration."
)
  .addFlag("verify", "Verify contracts at Etherscan")
  .addParam(
    "pool",
    `Pool name to retrieve configuration, supported: ${Object.values(
      ConfigNames
    )}`
  )
  .setAction(async ({ verify, pool }, DRE) => {
    try {
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
      const incentivesController = await getParamPerNetwork(
        IncentivesController,
        network
      );
      const addressesProvider = await getLendingPoolAddressesProvider();

      const lendingPoolConfiguratorProxy =
        await getLendingPoolConfiguratorProxy(
          await addressesProvider.getLendingPoolConfigurator()
        );

      const testHelpers = await getAaveProtocolDataProvider();

      const admin = await DRE.ethers.getSigner(
        await addressesProvider.getGlobalAdmin()
      );
      const emergAdmin = await DRE.ethers.getSigner(
        await getEmergencyAdmin(poolConfig)
      );
      // const oracle = await addressesProvider.getPriceOracle();

      if (!reserveAssets) {
        throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
      }

      const treasuryAddress = admin.address; //treasury address can be the same address as the deployer
      //TODO: change vmex treasuryAddress to the same address as the global address
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

      let collateralManagerAddress = await getParamPerNetwork(
        LendingPoolCollateralManager,
        network
      );
      if (!notFalsyOrZeroAddress(collateralManagerAddress)) {
        const collateralManager = await deployLendingPoolCollateralManager(
          verify
        );
        collateralManagerAddress = collateralManager.address;
      }
      // Seems unnecessary to register the collateral manager in the JSON db

      console.log(
        "\tSetting lending pool collateral manager implementation with address",
        collateralManagerAddress
      );
      await waitForTx(
        await addressesProvider.setLendingPoolCollateralManager(
          collateralManagerAddress
        )
      );

      console.log(
        "\tSetting AaveProtocolDataProvider at AddressesProvider at id: 0x01",
        collateralManagerAddress
      );
      const aaveProtocolDataProvider = await getAaveProtocolDataProvider();
      await waitForTx(
        await addressesProvider.setAddress(
          "0x0100000000000000000000000000000000000000000000000000000000000000",
          aaveProtocolDataProvider.address
        )
      );

      const walletBalancerProvider = await deployWalletBalancerProvider(verify);

      console.log(
        "WalletBalancerProvider deployed at:",
        walletBalancerProvider.address
      );

      const uiPoolDataProvider = await deployUiPoolDataProviderV2(
        chainlinkAggregatorProxy[network],
        chainlinkEthUsdAggregatorProxy[network],
        verify
      );
      console.log(
        "UiPoolDataProvider deployed at:",
        uiPoolDataProvider.address
      );

      const lendingPoolAddress = await addressesProvider.getLendingPool();

      let gateWay = getParamPerNetwork(WethGateway, network);
      if (!notFalsyOrZeroAddress(gateWay)) {
        gateWay = (await getWETHGateway()).address;
      }
      console.log("GATEWAY", gateWay);
      await authorizeWETHGateway(gateWay, lendingPoolAddress);



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

      // var tricryptoParams: {
      //   _pid: string;
      //   _poolSize: string;
      //   _curvePool: string;
      //   _boosterAddr: string; 
      //   isAllowed: boolean; 
      // } = {
      //   _pid: "38",
      //   _poolSize: "3",
      //   _curvePool: "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46",
      //   _boosterAddr: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31"
      // }

      // await waitForTx(
      //   await assetMappings.connect(admin).setCurveMetadata("0xc4AD29ba4B3c580e6D59105FFf484999997675Ff",tricryptoParams)
      // ); //0 is default strategy

    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
