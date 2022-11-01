import { task } from "hardhat/config";
import { exit } from "process";

import { configuration as actionsConfiguration } from "../../test-suites/test-aave/helpers/actions";
import { configuration as calculationsConfiguration } from "../../test-suites/test-aave/helpers/utils/calculations";

import fs from "fs";
import BigNumber from "bignumber.js";
import { makeSuite } from "../../test-suites/test-aave/helpers/make-suite";
import { getReservesConfigByPool } from "../../helpers/configuration";
import {
  AavePools,
  iAavePoolAssets,
  IReserveParams,
} from "../../helpers/types";
import { executeStory } from "../../test-suites/test-aave/helpers/scenario-engine";

task("full:test-scenarios", "test-scenarios")
  .addFlag("verify", "Verify contracts at Etherscan")
  .addFlag(
    "skipRegistry",
    "Skip addresses provider registration at Addresses Provider Registry"
  )
  .setAction(async ({ verify, skipRegistry }, DRE) => {
    try {
      console.log("Network name initial: ", DRE.network.name);
      await DRE.run("set-DRE");

      const scenarioFolder = "./test-suites/test-aave/helpers/scenarios/curve";

      const selectedScenarios: string[] = [];

      fs.readdirSync(scenarioFolder).forEach((file) => {
        if (selectedScenarios.length > 0 && !selectedScenarios.includes(file))
          return;

        const scenario = require(`../../test-suites/test-aave/helpers/scenarios/curve/${file}`);

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
          });
          after("Reset", () => {
            // Reset BigNumber
            BigNumber.config({
              DECIMAL_PLACES: 20,
              ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
            });
          });

          for (const story of scenario.stories) {
            it(story.description, async function () {
              // Retry the test scenarios up to 4 times if an error happens, due erratic HEVM network errors
              //this.retries(4);
              await executeStory(story, testEnv);
            });
          }
        });
      });
    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
