"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const etherscan_verification_1 = require("../../helpers/etherscan-verification");
(0, config_1.task)('verify-sc', 'Inits the DRE, to have access to all the plugins')
    .addParam('address', 'Ethereum address of the smart contract')
    .addOptionalParam('libraries', 'Stringified JSON object in format of {library1: "0x2956356cd2a2bf3202f771f50d3d14a367b48071"}')
    .addOptionalVariadicPositionalParam('constructorArguments', 'arguments for contract constructor', [])
    .setAction(async ({ address, constructorArguments = [], libraries }, localBRE) => {
    await localBRE.run('set-DRE');
    (0, etherscan_verification_1.checkVerification)();
    const result = await (0, etherscan_verification_1.verifyEtherscanContract)(address, constructorArguments, libraries);
    return result;
});
//# sourceMappingURL=verify-sc.js.map