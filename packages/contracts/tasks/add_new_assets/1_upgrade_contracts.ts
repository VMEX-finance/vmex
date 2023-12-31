import { task } from "hardhat/config";
import {
  getParamPerNetwork,
  insertContractAddressInDb,
} from "../../helpers/contracts-helpers";
import {
  deployAssetMapping,
} from "../../helpers/contracts-deployments";
import {
  loadPoolConfig,
  ConfigNames,
} from "../../helpers/configuration";
import {
  eNetwork,
  ICommonConfiguration,
  eContractid,
} from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import { initAssetData } from "../../helpers/init-helpers";
import {
  getLendingPoolAddressesProvider,
  getAssetMappings,
  getFirstSigner,
  getLendingPoolAddressesProviderRegistry,
  getProxy,
} from "../../helpers/contracts-getters";
import { NETWORKS_RPC_URL } from "../../helper-hardhat-config";
import { ethers } from "ethers";

const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

async function getContractBytecode(address, provider) {
  const code = await provider.getCode(address);
  return ethers.utils.hexlify(code);
}

async function exploreStorageSlots(provider, proxyAddress) {
  console.log("exploring storage slots for ",proxyAddress)
  const storageSlotsCount = 30; // Adjust based on your contract

  for (let i = 0; i < storageSlotsCount; i++) {
    try {
      const slotValue = await provider.getStorageAt(proxyAddress, ethers.utils.hexValue(i));
      console.log(`Slot ${i}: ${slotValue}`);
    } catch (error) {
      // Ignore errors (e.g., if the slot is not readable)
      console.error(`Error reading slot ${i}:`, error.message);
    }
  }
}

function convert256ToAddress(implementationSlotValue) {
  // Extract the rightmost 40 characters (20 bytes) of the 256-bit value
  return "0x" + implementationSlotValue.substring(26);
}

task("add:upgrade-contracts", "Check if impl contract bytecode matches prod, if not upgrade")
  .addFlag("verify", "Verify contracts at Etherscan")
  .addParam(
    "pool",
    `Pool name to retrieve configuration, supported: ${Object.values(
      ConfigNames
    )}`
  )
  .setAction(async ({ verify, pool, skipRegistry }, DRE) => {
    await DRE.run("set-DRE");
    const network = DRE.network.name as eNetwork;
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

    const provider = new ethers.providers.JsonRpcProvider(NETWORKS_RPC_URL[network]);

    
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
    const assetMappings = await addressesProvider.getAssetMappings();
    const assetMappingsImpl = convert256ToAddress(await provider.getStorageAt(assetMappings, implementationSlot));
    const assetMappingsBytecodeDeployed = await getContractBytecode(assetMappingsImpl, provider)
    const localAssetMappingsBytecode = require("../../artifacts/contracts/protocol/lendingpool/AssetMappings.sol/AssetMappings.json")

    const lendingPoolImpl = convert256ToAddress(await provider.getStorageAt(lendingPoolAddress, implementationSlot));
    const lendingPoolBytecodeDeployed = await getContractBytecode(lendingPoolImpl, provider)
    const localLendingPoolBytecode = require("../../artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json")
    

    const lendingPoolCollateralManagerImpl = convert256ToAddress(await provider.getStorageAt(lendingPoolCollateralManagerAddress, implementationSlot));
    const lendingPoolCollateralManagerBytecodeDeployed = await getContractBytecode(lendingPoolCollateralManagerImpl, provider)
    const localLendingPoolCollateralManagerBytecode = require("../../artifacts/contracts/protocol/lendingpool/LendingPoolCollateralManager.sol/LendingPoolCollateralManager.json")
    console.log("lendingPoolCollateralManagerBytecodeDeployed: ",lendingPoolCollateralManagerBytecodeDeployed)

    if(lendingPoolBytecodeDeployed != localLendingPoolBytecode.bytecode) {
      console.log("upgrading lendingpool")
    }
    if(lendingPoolCollateralManagerBytecodeDeployed != localLendingPoolCollateralManagerBytecode.bytecode) {
      console.log("upgrading collateral manager")
    }
  });
