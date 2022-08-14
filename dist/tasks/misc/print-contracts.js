"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const misc_utils_1 = require("../../helpers/misc-utils");
(0, config_1.task)('print-contracts', 'Inits the DRE, to have access to all the plugins').setAction(async ({}, localBRE) => {
    await localBRE.run('set-DRE');
    (0, misc_utils_1.printContracts)();
});
