import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  deployLendingPoolCollateralManager,
  deployWalletBalancerProvider,
  authorizeWETHGateway,
  deployUiPoolDataProviderV2,
  deployAssetMapping
} from "../../helpers/contracts-deployments";
import {
  loadPoolConfig,
  loadCustomAavePoolConfig,
  ConfigNames,
  getEmergencyAdmin,
} from "../../helpers/configuration";
import { getWETHGateway } from "../../helpers/contracts-getters";
import { eNetwork, ICommonConfiguration } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  claimTrancheId,
  initReservesByHelper,
  configureReservesByHelper,
} from "../../helpers/init-helpers";
import { exit } from "process";
import {
  getAaveProtocolDataProvider,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
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
      const poolConfig = await loadCustomAavePoolConfig("0"); //this is only for mainnet
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
      //deploy AssetMappings
      await deployAssetMapping(addressesProvider.address);
      
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

      await claimTrancheId("Vmex tranche 0", admin, admin);

      // Pause market during deployment
      await waitForTx(
        await lendingPoolConfiguratorProxy.connect(admin).setPoolPause(true, 0)
      );

      await initReservesByHelper(
        ReservesConfig,
        reserveAssets,
        ATokenNamePrefix,
        StableDebtTokenNamePrefix,
        VariableDebtTokenNamePrefix,
        SymbolPrefix,
        admin,
        treasuryAddress,
        incentivesController,
        pool,
        0, //tranche id
        verify
      );
      await configureReservesByHelper(
        ReservesConfig,
        reserveAssets,
        testHelpers,
        0,
        admin.address
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
    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
