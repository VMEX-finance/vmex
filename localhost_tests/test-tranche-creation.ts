

    // Load the HRE into helpers to access signers
    const fs = require('fs');
    await run("set-DRE")

    // Import getters to instance any Aave contract
    const contractGetters = require('./helpers/contracts-getters');
    const contractHelpers = require('./helpers/contracts-helpers');
    const initHelpers = require('./helpers/init-helpers');

    const lendingPool = await contractGetters.getLendingPool();


// Load the first signer
var signer = await contractGetters.getFirstSigner();

const emergency = (await ethers.getSigners())[1]


/************************************************************************************/
/****************** unpause lending pools **********************/ 
/************************************************************************************/
const lendingPoolConfig = await contractGetters.getLendingPoolConfiguratorProxy()

await lendingPoolConfig.connect(admin).setPoolPause(false,0)

const mytypes = require( "./helpers/types");

const network = <mytypes.eNetwork>DRE.network.name;
      const poolConfig = loadPoolConfig(pool);
      const {
        ATokenNamePrefix,
        StableDebtTokenNamePrefix,
        VariableDebtTokenNamePrefix,
        SymbolPrefix,
        ReserveAssets,
        ReservesConfig,
        ReservesConfigTranche1,
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
      const emergAdmin = await DRE.ethers.getSigner(await getEmergencyAdmin(poolConfig));
      // const oracle = await addressesProvider.getPriceOracle();

      if (!reserveAssets) {
        throw "Reserve assets is undefined. Check ReserveAssets configuration at config directory";
      }

      const treasuryAddress = await getTreasuryAddress(poolConfig);
      console.log("before initReservesByHelper");

      await claimTrancheId(0, admin, admin);

      // Pause market during deployment
      await waitForTx(await lendingPoolConfiguratorProxy.connect(admin).setPoolPause(true,0));

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