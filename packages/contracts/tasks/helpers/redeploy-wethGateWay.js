"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const configuration_1 = require("../../helpers/configuration");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const CONTRACT_NAME = 'WETHGateway';
(0, config_1.task)(`full-redeploy-weth-gateway`, `Redeploys the ${CONTRACT_NAME} contract`)
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .addFlag('verify', `Verify ${CONTRACT_NAME} contract via Etherscan API.`)
    .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const Weth = await (0, configuration_1.getWrappedNativeTokenAddress)(poolConfig);
    if (!localBRE.network.config.chainId) {
        throw new Error('INVALID_CHAIN_ID');
    }
    const wethGateWay = await (0, contracts_deployments_1.deployWETHGateway)([Weth], verify);
    console.log(`${CONTRACT_NAME}.address`, wethGateWay.address);
    console.log(`\tFinished ${CONTRACT_NAME} deployment`);
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const lendingPoolAddress = await addressesProvider.getLendingPool();
    await (0, contracts_deployments_1.authorizeWETHGateway)(wethGateWay.address, lendingPoolAddress);
});
//# sourceMappingURL=redeploy-wethGateWay.js.map