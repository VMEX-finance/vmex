import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  ConfigNames,
  getEmergencyAdmin,
  loadPoolConfig
} from "../../helpers/configuration";
import { getWETHGateway } from "../../helpers/contracts-getters";
import { eNetwork, ICommonConfiguration } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  claimTrancheId,
  initReservesByHelper,
  getTranche1MockedData,
} from "../../helpers/init-helpers";
import { exit } from "process";
import {
  getAaveProtocolDataProvider,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
} from "../../helpers/contracts-getters";

task('dev:initialize-tranche-2', 'Initialize lending pool configuration.')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');

    const network = <eNetwork>localBRE.network.name;
    const poolConfig = loadPoolConfig(ConfigNames.Aave);
    const {
      ATokenNamePrefix,
      StableDebtTokenNamePrefix,
      VariableDebtTokenNamePrefix,
      SymbolPrefix,
      ReserveAssets,
      ReservesConfig,
      LendingPoolCollateralManager,
      WethGateway,
    } = poolConfig as ICommonConfiguration;

    const reserveAssets = await getParamPerNetwork(ReserveAssets, network);
    const addressesProvider = await getLendingPoolAddressesProvider();

    const lendingPoolConfiguratorProxy =
      await getLendingPoolConfiguratorProxy(
        await addressesProvider.getLendingPoolConfigurator()
      );

    const testHelpers = await getAaveProtocolDataProvider();

    const admin = await localBRE.ethers.getSigner(
      await addressesProvider.getGlobalAdmin()
    );
    const emergAdmin = await localBRE.ethers.getSigner(
      await getEmergencyAdmin(poolConfig)
    );
    // const oracle = await addressesProvider.getPriceOracle();

    if (!reserveAssets) {
      throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
    }

    const treasuryAddress = emergAdmin.address;
    console.log("before initReservesByHelper");

    await claimTrancheId("Vmex tranche 1", emergAdmin);

    // Pause market during deployment
    await waitForTx(
      await lendingPoolConfiguratorProxy
        .connect(admin)
        .setPoolPause(true, 1)
    );

    let [assets0, reserveFactors0, canBorrow0, canBeCollateral0] = getTranche1MockedData(reserveAssets);
    await initReservesByHelper(
      assets0,
      reserveFactors0,
      canBorrow0,
      canBeCollateral0,
      emergAdmin,
      treasuryAddress,
      1
    );
    // Unpause market during deployment
    await waitForTx(
      await lendingPoolConfiguratorProxy
        .connect(admin)
        .setPoolPause(false, 0)
    );
    // Unpause market during deployment
    await waitForTx(
      await lendingPoolConfiguratorProxy
        .connect(admin)
        .setPoolPause(false, 1)
    );
  });
