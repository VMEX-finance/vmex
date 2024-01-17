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
import { ExternalRewardsAddress, IExternalRewardsAddress, eNetwork } from "../../helpers/types";
import { waitForTx } from "../../helpers/misc-utils";

task(`add-setStakingTypes`, `setup staking and begin staking for tranche 0`)
.addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
.addFlag("verify", "Verify contracts at Etherscan")
  // .addParam("vaultOfRewards", "The address of the vault of rewards")
  .setAction(async ({ verify, pool }, DRE) => {

    await DRE.run("set-DRE");

    if (!DRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }


    const network = <eNetwork>DRE.network.name;
    const poolConfig = loadPoolConfig(pool);

    const { ExternalStakingContracts, ReserveAssets } = poolConfig;
    
    const stakingContracts = await getParamPerNetwork(ExternalStakingContracts, network);
    const tokens = await getParamPerNetwork(ReserveAssets, network);
    if(!stakingContracts || !tokens){
      throw "staking contracts not set"
    }
    const tokensList = Object.values(tokens)

    const addressesProvider = await getLendingPoolAddressesProvider();
    const admin = await addressesProvider.getGlobalAdmin();
    const incentivesController = await getIncentivesControllerProxy();
    var signer = await getFirstSigner();
    const lendingPool = await getLendingPool();

    const stakingContractValues = Object.values(stakingContracts)
    let stakingContracts1: string = "["
    let stakingTypes: string = "["
    for(let i = 0; i<stakingContractValues.length;i++) {
      const dat = await incentivesController.stakingTypes(stakingContractValues[i].address);
      if(!dat || dat==0) {
        stakingContracts1 += `"${stakingContractValues[i].address}",`
        stakingTypes +=  `"${stakingContractValues[i].type}",`
      }
    }
    console.log("incentives controller: ", incentivesController.address)

    console.log("staking contracts: ", stakingContracts1.substring(0,stakingContracts1.length-1)+"]")
    console.log("staking types: ", stakingTypes.substring(0,stakingTypes.length-1)+"]")
  });
