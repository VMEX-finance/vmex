"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const make_suite_1 = require("./helpers/make-suite");
const types_1 = require("../../helpers/types");
const constants_1 = require("../../helpers/constants");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
(0, make_suite_1.makeSuite)('Upgradeability', (testEnv) => {
    const { CALLER_NOT_POOL_ADMIN } = types_1.ProtocolErrors;
    let newATokenAddress;
    let newStableTokenAddress;
    let newVariableTokenAddress;
    before('deploying instances', async () => {
        const { dai, pool } = testEnv;
        const aTokenInstance = await (0, contracts_deployments_1.deployMockAToken)([
            pool.address,
            dai.address,
            constants_1.ZERO_ADDRESS,
            constants_1.ZERO_ADDRESS,
            'Aave Interest bearing DAI updated',
            'aDAI',
            '0x10'
        ]);
        const stableDebtTokenInstance = await (0, contracts_deployments_1.deployMockStableDebtToken)([
            pool.address,
            dai.address,
            constants_1.ZERO_ADDRESS,
            'Aave stable debt bearing DAI updated',
            'stableDebtDAI',
            '0x10'
        ]);
        const variableDebtTokenInstance = await (0, contracts_deployments_1.deployMockVariableDebtToken)([
            pool.address,
            dai.address,
            constants_1.ZERO_ADDRESS,
            'Aave variable debt bearing DAI updated',
            'variableDebtDAI',
            '0x10'
        ]);
        newATokenAddress = aTokenInstance.address;
        newVariableTokenAddress = variableDebtTokenInstance.address;
        newStableTokenAddress = stableDebtTokenInstance.address;
    });
    it('Tries to update the DAI Atoken implementation with a different address than the lendingPoolManager', async () => {
        const { dai, configurator, users } = testEnv;
        const name = await (await (0, contracts_getters_1.getAToken)(newATokenAddress)).name();
        const symbol = await (await (0, contracts_getters_1.getAToken)(newATokenAddress)).symbol();
        const updateATokenInputParams = {
            asset: dai.address,
            treasury: constants_1.ZERO_ADDRESS,
            incentivesController: constants_1.ZERO_ADDRESS,
            name: name,
            symbol: symbol,
            implementation: newATokenAddress,
            params: "0x10"
        };
        await (0, chai_1.expect)(configurator.connect(users[1].signer).updateAToken(updateATokenInputParams)).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
    });
    it('Upgrades the DAI Atoken implementation ', async () => {
        const { dai, configurator, aDai } = testEnv;
        const name = await (await (0, contracts_getters_1.getAToken)(newATokenAddress)).name();
        const symbol = await (await (0, contracts_getters_1.getAToken)(newATokenAddress)).symbol();
        const updateATokenInputParams = {
            asset: dai.address,
            treasury: constants_1.ZERO_ADDRESS,
            incentivesController: constants_1.ZERO_ADDRESS,
            name: name,
            symbol: symbol,
            implementation: newATokenAddress,
            params: "0x10"
        };
        await configurator.updateAToken(updateATokenInputParams);
        const tokenName = await aDai.name();
        (0, chai_1.expect)(tokenName).to.be.eq('Aave Interest bearing DAI updated', 'Invalid token name');
    });
    it('Tries to update the DAI Stable debt token implementation with a different address than the lendingPoolManager', async () => {
        const { dai, configurator, users } = testEnv;
        const name = await (await (0, contracts_getters_1.getStableDebtToken)(newStableTokenAddress)).name();
        const symbol = await (await (0, contracts_getters_1.getStableDebtToken)(newStableTokenAddress)).symbol();
        const updateDebtTokenInput = {
            asset: dai.address,
            incentivesController: constants_1.ZERO_ADDRESS,
            name: name,
            symbol: symbol,
            implementation: newStableTokenAddress,
            params: '0x10'
        };
        await (0, chai_1.expect)(configurator
            .connect(users[1].signer)
            .updateStableDebtToken(updateDebtTokenInput)).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
    });
    it('Upgrades the DAI stable debt token implementation ', async () => {
        const { dai, configurator, pool, helpersContract } = testEnv;
        const name = await (await (0, contracts_getters_1.getStableDebtToken)(newStableTokenAddress)).name();
        const symbol = await (await (0, contracts_getters_1.getStableDebtToken)(newStableTokenAddress)).symbol();
        const updateDebtTokenInput = {
            asset: dai.address,
            incentivesController: constants_1.ZERO_ADDRESS,
            name: name,
            symbol: symbol,
            implementation: newStableTokenAddress,
            params: '0x10'
        };
        await configurator.updateStableDebtToken(updateDebtTokenInput);
        const { stableDebtTokenAddress } = await helpersContract.getReserveTokensAddresses(dai.address);
        const debtToken = await (0, contracts_getters_1.getMockStableDebtToken)(stableDebtTokenAddress);
        const tokenName = await debtToken.name();
        (0, chai_1.expect)(tokenName).to.be.eq('Aave stable debt bearing DAI updated', 'Invalid token name');
    });
    it('Tries to update the DAI variable debt token implementation with a different address than the lendingPoolManager', async () => {
        const { dai, configurator, users } = testEnv;
        const name = await (await (0, contracts_getters_1.getVariableDebtToken)(newVariableTokenAddress)).name();
        const symbol = await (await (0, contracts_getters_1.getVariableDebtToken)(newVariableTokenAddress)).symbol();
        const updateDebtTokenInput = {
            asset: dai.address,
            incentivesController: constants_1.ZERO_ADDRESS,
            name: name,
            symbol: symbol,
            implementation: newVariableTokenAddress,
            params: '0x10'
        };
        await (0, chai_1.expect)(configurator
            .connect(users[1].signer)
            .updateVariableDebtToken(updateDebtTokenInput)).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
    });
    it('Upgrades the DAI variable debt token implementation ', async () => {
        const { dai, configurator, pool, helpersContract } = testEnv;
        const name = await (await (0, contracts_getters_1.getVariableDebtToken)(newVariableTokenAddress)).name();
        const symbol = await (await (0, contracts_getters_1.getVariableDebtToken)(newVariableTokenAddress)).symbol();
        const updateDebtTokenInput = {
            asset: dai.address,
            incentivesController: constants_1.ZERO_ADDRESS,
            name: name,
            symbol: symbol,
            implementation: newVariableTokenAddress,
            params: '0x10'
        };
        //const name = await (await getAToken(newATokenAddress)).name();
        await configurator.updateVariableDebtToken(updateDebtTokenInput);
        const { variableDebtTokenAddress } = await helpersContract.getReserveTokensAddresses(dai.address);
        const debtToken = await (0, contracts_getters_1.getMockVariableDebtToken)(variableDebtTokenAddress);
        const tokenName = await debtToken.name();
        (0, chai_1.expect)(tokenName).to.be.eq('Aave variable debt bearing DAI updated', 'Invalid token name');
    });
});
