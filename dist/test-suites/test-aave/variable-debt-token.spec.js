"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const make_suite_1 = require("./helpers/make-suite");
const types_1 = require("../../helpers/types");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, make_suite_1.makeSuite)('Variable debt token tests', (testEnv) => {
    const { CT_CALLER_MUST_BE_LENDING_POOL } = types_1.ProtocolErrors;
    it('Tries to invoke mint not being the LendingPool', async () => {
        const { deployer, pool, dai, helpersContract } = testEnv;
        const daiVariableDebtTokenAddress = (await helpersContract.getReserveTokensAddresses(dai.address)).variableDebtTokenAddress;
        const variableDebtContract = await (0, contracts_getters_1.getVariableDebtToken)(daiVariableDebtTokenAddress);
        await (0, chai_1.expect)(variableDebtContract.mint(deployer.address, deployer.address, '1', '1')).to.be.revertedWith(CT_CALLER_MUST_BE_LENDING_POOL);
    });
    it('Tries to invoke burn not being the LendingPool', async () => {
        const { deployer, pool, dai, helpersContract } = testEnv;
        const daiVariableDebtTokenAddress = (await helpersContract.getReserveTokensAddresses(dai.address)).variableDebtTokenAddress;
        const variableDebtContract = await (0, contracts_getters_1.getVariableDebtToken)(daiVariableDebtTokenAddress);
        await (0, chai_1.expect)(variableDebtContract.burn(deployer.address, '1', '1')).to.be.revertedWith(CT_CALLER_MUST_BE_LENDING_POOL);
    });
});
