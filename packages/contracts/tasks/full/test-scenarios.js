"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const process_1 = require("process");
const actions_1 = require("../../test-suites/test-aave/helpers/actions");
const calculations_1 = require("../../test-suites/test-aave/helpers/utils/calculations");
const fs_1 = __importDefault(require("fs"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const make_suite_1 = require("../../test-suites/test-aave/helpers/make-suite");
const configuration_1 = require("../../helpers/configuration");
const types_1 = require("../../helpers/types");
const scenario_engine_1 = require("../../test-suites/test-aave/helpers/scenario-engine");
(0, config_1.task)("full:test-scenarios", "test-scenarios")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addFlag("skipRegistry", "Skip addresses provider registration at Addresses Provider Registry")
    .setAction(async ({ verify, skipRegistry }, DRE) => {
    try {
        console.log("Network name initial: ", DRE.network.name);
        await DRE.run("set-DRE");
        const scenarioFolder = "./test-suites/test-aave/helpers/scenarios/curve";
        const selectedScenarios = [];
        fs_1.default.readdirSync(scenarioFolder).forEach((file) => {
            if (selectedScenarios.length > 0 && !selectedScenarios.includes(file))
                return;
            const scenario = require(`../../test-suites/test-aave/helpers/scenarios/curve/${file}`);
            (0, make_suite_1.makeSuite)(scenario.title, async (testEnv) => {
                //each file resets the state before moving on to the next file. I don't think each story within a file will revert state
                before("Initializing configuration", async () => {
                    // Sets BigNumber for this suite, instead of globally
                    bignumber_js_1.default.config({
                        DECIMAL_PLACES: 0,
                        ROUNDING_MODE: bignumber_js_1.default.ROUND_DOWN,
                    });
                    actions_1.configuration.skipIntegrityCheck = false; //set this to true to execute solidity-coverage
                    calculations_1.configuration.reservesParams = (0, configuration_1.getReservesConfigByPool)(types_1.AavePools.proto);
                });
                after("Reset", () => {
                    // Reset BigNumber
                    bignumber_js_1.default.config({
                        DECIMAL_PLACES: 20,
                        ROUNDING_MODE: bignumber_js_1.default.ROUND_HALF_UP,
                    });
                });
                for (const story of scenario.stories) {
                    it(story.description, async function () {
                        // Retry the test scenarios up to 4 times if an error happens, due erratic HEVM network errors
                        //this.retries(4);
                        await (0, scenario_engine_1.executeStory)(story, testEnv);
                    });
                }
            });
        });
    }
    catch (err) {
        console.error(err);
        (0, process_1.exit)(1);
    }
});
//# sourceMappingURL=test-scenarios.js.map