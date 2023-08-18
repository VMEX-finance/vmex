import { configuration as actionsConfiguration } from "./helpers/actions";
import { configuration as calculationsConfiguration } from "./helpers/utils/calculations";
import { evmRevert, evmSnapshot, DRE } from "../../helpers/misc-utils";

import fs from "fs";
import BigNumber from "bignumber.js";
import { makeSuite } from "./helpers/make-suite";
import { getReservesConfigByPool } from "../../helpers/configuration";
import {
  AavePools,
  iAavePoolAssets,
  IReserveParams,
} from "../../helpers/types";
import { executeStory } from "./helpers/scenario-engine";

// let buidlerevmSnapshotId: string = "0x1";
// const setBuidlerevmSnapshotId = (id: string) => {
//   buidlerevmSnapshotId = id;
// };

// const setSnapshot = async () => {
//   setBuidlerevmSnapshotId(await evmSnapshot());
// };

// const revertHead = async () => {
//   await evmRevert(buidlerevmSnapshotId);
// };

const scenarioFolder = "./test-suites/test-aave/helpers/scenarios";

const selectedScenarios: string[] = [];

fs.readdirSync(scenarioFolder).forEach((file) => {
  if (selectedScenarios.length > 0 && !selectedScenarios.includes(file)) return;

  const scenario = require(`./helpers/scenarios/${file}`);

  makeSuite(scenario.title, async (testEnv) => {
    //each file resets the state before moving on to the next file. I don't think each story within a file will revert state
    before("Initializing configuration", async () => {
      // Sets BigNumber for this suite, instead of globally
      BigNumber.config({
        DECIMAL_PLACES: 0,
        ROUNDING_MODE: BigNumber.ROUND_DOWN,
      });

      actionsConfiguration.skipIntegrityCheck = false; //set this to true to execute solidity-coverage

      calculationsConfiguration.reservesParams = <
        iAavePoolAssets<IReserveParams>
      >getReservesConfigByPool(AavePools.proto);

      const { incentivesController, stakingContracts, rewardTokens, addressesProvider, assetMappings, yvTricrypto2, ayvTricrypto2 } = testEnv; 
      // await addressesProvider.setIncentivesController(incentivesController.address);
      // const tricrypto21dat = await pool.getReserveData(tricrypto2.address,1);

      // need to ensure the following for the tests to pass (Expected behavior)
      // 1. atoken with the reward (arg0) must not be borrowable (so can't set DAI or WETH)
      // 2. staking contract (arg1) must have the underlying match the token with the reward (arg0). Ex: if weth is used as the reward token then staking contract must be [4]: await getStakingRewardsMock({ slug: 'yaWeth'})
      // 3. the token chosen as the rewardToken (arg2) must be given to the staking contract so it has enough funds to distribute. This is done in contracts-deployments.ts, everything uses USDC
      // 4. Make sure the atoken with the reward is actually used in the scenario tests (ex: if aweth from tranche 0 is used, but the scenarios only use aweth from tranche 1, then this is useless)
      
      await incentivesController.setStakingType([stakingContracts[6].address],[1]);
      await incentivesController.beginStakingReward(ayvTricrypto2.address, stakingContracts[6].address);

      console.log("successfully set staking for yvTricrypto");

      // make it use the chainlink aggregator for this tests
      // await assetMappings.setAssetType(yvTricrypto2.address, 0);
    });
    after("Reset", async () => {
      // Reset BigNumber
      BigNumber.config({
        DECIMAL_PLACES: 20,
        ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
      });


      const {  assetMappings, yvTricrypto2 } = testEnv; 
      // await assetMappings.setAssetType(yvTricrypto2.address, 3);
    });

    for (const story of scenario.stories) {
      it(story.description, async function () {
        // Retry the test scenarios up to 4 times if an error happens, due erratic HEVM network errors
        // this.retries(4);
        await executeStory(story, testEnv);
      });
    }
  });
});
