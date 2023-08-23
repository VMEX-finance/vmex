import { task } from 'hardhat/config';
import {
  loadPoolConfig,
  ConfigNames,
  getWrappedNativeTokenAddress,
} from '../../helpers/configuration';
import { ZERO_ADDRESS } from '../../helpers/constants';
import {
  getAaveProtocolDataProvider,
  getAddressById,
  getAssetMappingsImpl,
  getLendingPool,
  getLendingPoolAddressesProvider,
  getLendingPoolAddressesProviderRegistry,
  getLendingPoolCollateralManager,
  getLendingPoolCollateralManagerImpl,
  getLendingPoolConfiguratorImpl,
  getLendingPoolConfiguratorProxy,
  getLendingPoolImpl,
  getProxy,
  getWalletProvider,
  getWETHGateway,
} from '../../helpers/contracts-getters';
import { verifyContract, getParamPerNetwork } from '../../helpers/contracts-helpers';
import { notFalsyOrZeroAddress } from '../../helpers/misc-utils';
import { eContractid, eNetwork, ICommonConfiguration } from '../../helpers/types';

task('verify:general', 'Verify contracts at Etherscan')
  .addFlag('all', 'Verify all contracts at Etherscan')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ all, pool }, localDRE) => {
    await localDRE.run('set-DRE');
    const network = localDRE.network.name as eNetwork;
    const poolConfig = loadPoolConfig(pool);
    const {
      ReserveAssets,
      ReservesConfig,
      ProviderRegistry,
      MarketId,
      LendingPoolCollateralManager,
      LendingPoolConfigurator,
      LendingPool,
      WethGateway,
      AssetMappingsImpl
    } = poolConfig as ICommonConfiguration;

    const assetMappingsImplAddress = getParamPerNetwork(AssetMappingsImpl, network);
    const registryAddress = getParamPerNetwork(ProviderRegistry, network);
    const addressesProvider = await getLendingPoolAddressesProvider();
    const addressesProviderRegistry = notFalsyOrZeroAddress(registryAddress)
      ? await getLendingPoolAddressesProviderRegistry(registryAddress)
      : await getLendingPoolAddressesProviderRegistry();
      const vmexoracle = await addressesProvider.getPriceOracle();
    const lendingPoolAddress = await addressesProvider.getLendingPool();
    const lendingPoolConfiguratorAddress = await addressesProvider.getLendingPoolConfigurator(); //getLendingPoolConfiguratorProxy();
    const lendingPoolCollateralManagerAddress =
      await addressesProvider.getLendingPoolCollateralManager();

    const vmexoracleProxy = await getProxy(vmexoracle);
    const lendingPoolProxy = await getProxy(lendingPoolAddress);
    const lendingPoolConfiguratorProxy = await getProxy(lendingPoolConfiguratorAddress);
    const lendingPoolCollateralManagerProxy = await getProxy(lendingPoolCollateralManagerAddress);

    if (all) {
      const lendingPoolImplAddress = getParamPerNetwork(LendingPool, network);
      const lendingPoolImpl = notFalsyOrZeroAddress(lendingPoolImplAddress)
        ? await getLendingPoolImpl(lendingPoolImplAddress)
        : await getLendingPoolImpl();

      const lendingPoolConfiguratorImplAddress = getParamPerNetwork(
        LendingPoolConfigurator,
        network
      );
      const lendingPoolConfiguratorImpl = notFalsyOrZeroAddress(lendingPoolConfiguratorImplAddress)
        ? await getLendingPoolConfiguratorImpl(lendingPoolConfiguratorImplAddress)
        : await getLendingPoolConfiguratorImpl();

      const lendingPoolCollateralManagerImplAddress = getParamPerNetwork(
        LendingPoolCollateralManager,
        network
      );
      const lendingPoolCollateralManagerImpl = notFalsyOrZeroAddress(
        lendingPoolCollateralManagerImplAddress
      )
        ? await getLendingPoolCollateralManagerImpl(lendingPoolCollateralManagerImplAddress)
        : await getLendingPoolCollateralManagerImpl();

      const wethGatewayAddress = getParamPerNetwork(WethGateway, network);
      const wethGateway = notFalsyOrZeroAddress(wethGatewayAddress)
        ? await getWETHGateway(wethGatewayAddress)
        : await getWETHGateway();


      const assetMappingsImpl = notFalsyOrZeroAddress(assetMappingsImplAddress)
      ? await getAssetMappingsImpl(assetMappingsImplAddress)
      : await getAssetMappingsImpl();

      // Asset mappings
      console.log('\n- Verifying asset mappings impl...\n');
      await verifyContract(eContractid.AssetMappingsImpl, assetMappingsImpl, []);

      // Address Provider
      console.log('\n- Verifying address provider...\n');
      await verifyContract(eContractid.LendingPoolAddressesProvider, addressesProvider, [MarketId]);

      // Address Provider Registry
      console.log('\n- Verifying address provider registry...\n');
      await verifyContract(
        eContractid.LendingPoolAddressesProviderRegistry,
        addressesProviderRegistry,
        []
      );

      // Lending Pool implementation
      console.log('\n- Verifying LendingPool Implementation...\n');
      await verifyContract(eContractid.LendingPool, lendingPoolImpl, []);

      // Lending Pool Configurator implementation
      console.log('\n- Verifying LendingPool Configurator Implementation...\n');
      await verifyContract(eContractid.LendingPoolConfigurator, lendingPoolConfiguratorImpl, []);

      // Lending Pool Collateral Manager implementation
      console.log('\n- Verifying LendingPool Collateral Manager Implementation...\n');
      await verifyContract(
        eContractid.LendingPoolCollateralManager,
        lendingPoolCollateralManagerImpl,
        []
      );

      // WETHGateway
      console.log('\n- Verifying  WETHGateway...\n');
      await verifyContract(eContractid.WETHGateway, wethGateway, [
        await getWrappedNativeTokenAddress(poolConfig),
      ]);
    }
    // Lending Pool proxy
    console.log('\n- Verifying  Lending Pool Proxy...\n');
    await verifyContract(eContractid.InitializableAdminUpgradeabilityProxy, lendingPoolProxy, [
      addressesProvider.address,
    ]);

    // LendingPool Conf proxy
    console.log('\n- Verifying  Lending Pool Configurator Proxy...\n');
    await verifyContract(
      eContractid.InitializableAdminUpgradeabilityProxy,
      lendingPoolConfiguratorProxy,
      [addressesProvider.address]
    );

    // Proxy collateral manager
    console.log('\n- Verifying  Lending Pool Collateral Manager Proxy...\n');
    await verifyContract(
      eContractid.InitializableAdminUpgradeabilityProxy,
      lendingPoolCollateralManagerProxy,
      []
    );


    // Proxy vmex oracle
    console.log('\n- Verifying  vmex oracle Proxy...\n');
    await verifyContract(
      eContractid.VMEXOracle,
      vmexoracleProxy,
      []
    );

    // Proxy vmex oracle
    console.log('\n- Verifying  vmex oracle Proxy...\n');
    await verifyContract(
      eContractid.VMEXOracle,
      vmexoracleProxy,
      []
    );

    console.log('Finished verifications.');
  });
