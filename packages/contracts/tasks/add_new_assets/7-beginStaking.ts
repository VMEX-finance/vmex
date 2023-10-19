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

task(`add-beginStaking`, `setup staking and begin staking for tranche 0`)
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

    const addressesProvider = await getLendingPoolAddressesProvider();
    const admin = await addressesProvider.getGlobalAdmin();
    const incentivesController = await getIncentivesControllerProxy();
    var signer = await getFirstSigner();
    const lendingPool = await getLendingPool();

    const stakingContractValues = Object.values(stakingContracts)
    const stakingToProcess: ExternalRewardsAddress[] = []
    const symbolsToProcess: string[] = []
    for(let i = 0; i<stakingContractValues.length;i++) {
      const dat = await incentivesController.stakingTypes(stakingContractValues[i].address);
      if(!dat || dat==0) {
        stakingToProcess.push(stakingContractValues[i])
        symbolsToProcess.push(Object.keys(stakingContracts)[i])
      }
    }

    console.log("stakingToProcess: ", stakingToProcess)
    console.log("symbolsToProcess: ", symbolsToProcess)


    for(let i = 0; i<stakingToProcess.length;i++) {
      const token = await lendingPool.getReserveData(tokens[symbolsToProcess[i]], 0);

      console.log("token.aTokenAddress: ",token.aTokenAddress)
      console.log("stakingToProcess[i].address: ", stakingToProcess[i].address)
    }
  });
