import { task } from "hardhat/config";
import {
  setupVmexIncentives,
} from "../../helpers/contracts-deployments";
import {
  getLendingPoolAddressesProvider,
} from "../../helpers/contracts-getters";

const CONTRACT_NAME = 'IncentivesController';

task(`deploy-${CONTRACT_NAME}`, `Deploy and initialize ${CONTRACT_NAME}`)
  .addFlag("verify", "Verify contracts at Etherscan")
  // .addParam("vaultOfRewards", "The address of the vault of rewards")
  .setAction(async ({ verify }, DRE) => {

    await DRE.run("set-DRE");

    if (!DRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }

    console.log(`\n- ${CONTRACT_NAME} deployment`);

    const addressesProvider = await getLendingPoolAddressesProvider();
    const admin = await addressesProvider.getGlobalAdmin();
    const emissionsManager = admin;
    const vmexIncentivesProxy = await setupVmexIncentives(
        emissionsManager,
        emissionsManager,   // the vault of rewards is the same as the emissions manager which is the same as the global admin
        admin,
        verify
    );

    // await addressesProvider.setIncentivesController(vmexIncentivesProxy.address);

    console.log(`Finished deployment, ${CONTRACT_NAME}.address`, vmexIncentivesProxy.address);
  });
