"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVerification = exports.runTaskWithRetry = exports.verifyEtherscanContract = exports.SUPPORTED_ETHERSCAN_NETWORKS = void 0;
const process_1 = require("process");
const fs_1 = __importDefault(require("fs"));
const tmp_promise_1 = require("tmp-promise");
const misc_utils_1 = require("./misc-utils");
const fatalErrors = [
    `The address provided as argument contains a contract, but its bytecode`,
    `Daily limit of 100 source code submissions reached`,
    `has no bytecode. Is the contract deployed to this network`,
    `The constructor for`,
];
const okErrors = [`Contract source code already verified`];
const unableVerifyError = "Fail - Unable to verify";
exports.SUPPORTED_ETHERSCAN_NETWORKS = [
    "main",
    "ropsten",
    "kovan",
    "matic",
    "mumbai",
];
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const verifyEtherscanContract = async (address, constructorArguments, libraries) => {
    const currentNetwork = misc_utils_1.DRE.network.name;
    if (!process.env.ETHERSCAN_KEY) {
        throw Error("Missing process.env.ETHERSCAN_KEY.");
    }
    if (!exports.SUPPORTED_ETHERSCAN_NETWORKS.includes(currentNetwork)) {
        throw Error(`Current network ${currentNetwork} not supported. Please change to one of the next networks: ${exports.SUPPORTED_ETHERSCAN_NETWORKS.toString()}`);
    }
    try {
        console.log("[ETHERSCAN][WARNING] Delaying Etherscan verification due their API can not find newly deployed contracts");
        const msDelay = 3000;
        const times = 4;
        // Write a temporal file to host complex parameters for buidler-etherscan https://github.com/nomiclabs/buidler/tree/development/packages/buidler-etherscan#complex-arguments
        const { fd, path, cleanup } = await (0, tmp_promise_1.file)({
            prefix: "verify-params-",
            postfix: ".js",
        });
        fs_1.default.writeSync(fd, `module.exports = ${JSON.stringify([...constructorArguments])};`);
        const params = {
            address: address,
            libraries,
            constructorArgs: path,
            relatedSources: true,
        };
        await (0, exports.runTaskWithRetry)("verify", params, times, msDelay, cleanup);
    }
    catch (error) { }
};
exports.verifyEtherscanContract = verifyEtherscanContract;
const runTaskWithRetry = async (task, params, times, msDelay, cleanup) => {
    let counter = times;
    await delay(msDelay);
    try {
        if (times > 1) {
            await misc_utils_1.DRE.run(task, params);
            cleanup();
        }
        else if (times === 1) {
            console.log("[ETHERSCAN][WARNING] Trying to verify via uploading all sources.");
            delete params.relatedSources;
            await misc_utils_1.DRE.run(task, params);
            cleanup();
        }
        else {
            cleanup();
            console.error("[ETHERSCAN][ERROR] Errors after all the retries, check the logs for more information.");
        }
    }
    catch (error) {
        counter--;
        if (okErrors.some((okReason) => error.message.includes(okReason))) {
            console.info("[ETHERSCAN][INFO] Skipping due OK response: ", error.message);
            return;
        }
        if (fatalErrors.some((fatalError) => error.message.includes(fatalError))) {
            console.error("[ETHERSCAN][ERROR] Fatal error detected, skip retries and resume deployment.", error.message);
            return;
        }
        console.error("[ETHERSCAN][ERROR]", error.message);
        console.log();
        console.info(`[ETHERSCAN][[INFO] Retrying attemps: ${counter}.`);
        if (error.message.includes(unableVerifyError)) {
            console.log("[ETHERSCAN][WARNING] Trying to verify via uploading all sources.");
            delete params.relatedSources;
        }
        await (0, exports.runTaskWithRetry)(task, params, counter, msDelay, cleanup);
    }
};
exports.runTaskWithRetry = runTaskWithRetry;
const checkVerification = () => {
    const currentNetwork = misc_utils_1.DRE.network.name;
    if (!process.env.ETHERSCAN_KEY) {
        console.error("Missing process.env.ETHERSCAN_KEY.");
        (0, process_1.exit)(3);
    }
    if (!exports.SUPPORTED_ETHERSCAN_NETWORKS.includes(currentNetwork)) {
        console.error(`Current network ${currentNetwork} not supported. Please change to one of the next networks: ${exports.SUPPORTED_ETHERSCAN_NETWORKS.toString()}`);
        (0, process_1.exit)(5);
    }
};
exports.checkVerification = checkVerification;
//# sourceMappingURL=etherscan-verification.js.map