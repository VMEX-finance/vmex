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
import { eNetwork } from "../../helpers/types";

task(`full-beginStaking`, `setup staking and begin staking for tranche 0`)
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
    console.log("Current incentives controller", await addressesProvider.getIncentivesController());
    // await addressesProvider.setIncentivesController(incentivesController.address);
    // console.log("New incentives controller", await addressesProvider.getIncentivesController());

    await incentivesController.setStakingType(
      Object.values(stakingContracts).map((el)=>el.address), 
      Object.values(stakingContracts).map((el)=>el.type)
    );

    console.log("finished setting staking type")

    for(let [symbol, externalRewardsData] of Object.entries(stakingContracts)) {
      console.log("attempting setting rewards for", symbol)
      const yvUSDCDat = await lendingPool.getReserveData(tokens[symbol], 0);

      await incentivesController.beginStakingReward(yvUSDCDat.aTokenAddress, externalRewardsData.address);
    }
  });
