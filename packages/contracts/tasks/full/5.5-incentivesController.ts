import { task } from "hardhat/config";
import { ConfigNames, loadPoolConfig } from "../../helpers/configuration";
import {
  setupVmexIncentives,
} from "../../helpers/contracts-deployments";
import {
  getFirstSigner,
  getIncentivesControllerProxy,
  getLendingPool,
  getLendingPoolAddressesProvider,
} from "../../helpers/contracts-getters";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import { eNetwork, ICommonConfiguration } from "../../helpers/types";

const CONTRACT_NAME = 'IncentivesController';

task(`full-deploy-${CONTRACT_NAME}`, `Deploy and initialize ${CONTRACT_NAME}`)
.addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
.addFlag("verify", "Verify contracts at Etherscan")
  // .addParam("vaultOfRewards", "The address of the vault of rewards")
  .setAction(async ({ verify, pool }, DRE) => {

    await DRE.run("set-DRE");

    if (!DRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }

    console.log(`\n- ${CONTRACT_NAME} deployment`);

    const network = <eNetwork>DRE.network.name;
    const poolConfig = loadPoolConfig(pool);
    const {
      VMEXRewardsVault
    } = poolConfig as ICommonConfiguration;

    const vaultOfRewards = getParamPerNetwork(VMEXRewardsVault, network);

    if(!vaultOfRewards) throw "vault of rewards not set"

    const vmexIncentivesProxy = await setupVmexIncentives(
        vaultOfRewards,   // the vault of rewards is the same as the emissions manager which is the same as the global admin
        verify
    );

    // await addressesProvider.setIncentivesController(vmexIncentivesProxy.address);

    console.log(`Finished deployment, ${CONTRACT_NAME}.address`, vmexIncentivesProxy.address);
  });
