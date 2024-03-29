import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  deployLendingPoolCollateralManager,
  authorizeWETHGateway,
} from "../../helpers/contracts-deployments";
import {
  loadPoolConfig,
  ConfigNames,
  getEmergencyAdmin,
} from "../../helpers/configuration";
import { eNetwork, ICommonConfiguration } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
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
      const poolConfig = loadPoolConfig(pool);//await loadCustomAavePoolConfig("0"); //this is only for mainnet
      const {
        LendingPoolCollateralManager,
        WethGateway,
      } = poolConfig as ICommonConfiguration;



      const addressesProvider = await getLendingPoolAddressesProvider();

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
          collateralManagerAddress || ""
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

      const lendingPoolAddress = await addressesProvider.getLendingPool();

      let gateWay = getParamPerNetwork(WethGateway, network);
      if (!notFalsyOrZeroAddress(gateWay) || network.includes("localhost")) {
        gateWay = (await getWETHGateway()).address;
      }
      console.log("GATEWAY", gateWay);
      await authorizeWETHGateway(gateWay, lendingPoolAddress);

    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
