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
import { ZERO_ADDRESS } from "@vmexfinance/sdk";

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
    const tokensList = Object.values(tokens)
    const symbolsList = Object.keys(tokens)

    const incentivesController = await getIncentivesControllerProxy(undefined, true);
    const lendingPool = await getLendingPool(undefined, true);

    for(let i = 0; i<tokensList.length;i++) {
      const token = await lendingPool.getReserveData(tokensList[i], 0);
      if(token.aTokenAddress!=ZERO_ADDRESS) {
        const stakingExists = await incentivesController.getStakingContract(token.aTokenAddress);
        if(stakingExists==ZERO_ADDRESS) { //staking did not yet begin
          if(stakingContracts[symbolsList[i]]) {
            console.log("token.aTokenAddress: ",token.aTokenAddress)
            console.log("staking contract address for ", symbolsList[i], ": ", stakingContracts[symbolsList[i]])
          }
        }
      }
    }
  });
