"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const oracles_helpers_1 = require("../../helpers/oracles-helpers");
const misc_utils_1 = require("../../helpers/misc-utils");
const configuration_1 = require("../../helpers/configuration");
const contracts_getters_1 = require("../../helpers/contracts-getters");
(0, config_1.task)('full:deploy-oracles', 'Deploy oracles for dev enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, DRE) => {
    try {
        await DRE.run('set-DRE');
        const network = DRE.network.name;
        const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
        const { ProtocolGlobalParams: { UsdAddress }, ReserveAssets, FallbackOracle, ChainlinkAggregator, } = poolConfig;
        const lendingRateOracles = (0, configuration_1.getLendingRateOracles)(poolConfig);
        const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
        const admin = await (0, configuration_1.getGenesisPoolAdmin)(poolConfig);
        const aaveOracleAddress = (0, contracts_helpers_1.getParamPerNetwork)(poolConfig.AaveOracle, network);
        const lendingRateOracleAddress = (0, contracts_helpers_1.getParamPerNetwork)(poolConfig.LendingRateOracle, network);
        const fallbackOracleAddress = await (0, contracts_helpers_1.getParamPerNetwork)(FallbackOracle, network);
        const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
        const chainlinkAggregators = await (0, contracts_helpers_1.getParamPerNetwork)(ChainlinkAggregator, network);
        const tokensToWatch = {
            ...reserveAssets,
            USD: UsdAddress,
        };
        const [tokens, aggregators] = (0, contracts_getters_1.getPairsTokenAggregator)(tokensToWatch, chainlinkAggregators, poolConfig.OracleQuoteCurrency);
        let aaveOracle;
        let lendingRateOracle;
        if ((0, misc_utils_1.notFalsyOrZeroAddress)(aaveOracleAddress)) {
            aaveOracle = await await (0, contracts_getters_1.getAaveOracle)(aaveOracleAddress);
            await (0, misc_utils_1.waitForTx)(await aaveOracle.setAssetSources(tokens, aggregators));
        }
        else {
            aaveOracle = await (0, contracts_deployments_1.deployAaveOracle)([
                tokens,
                aggregators,
                fallbackOracleAddress,
                await (0, configuration_1.getQuoteCurrency)(poolConfig),
                poolConfig.OracleQuoteUnit,
            ], verify);
            await (0, misc_utils_1.waitForTx)(await aaveOracle.setAssetSources(tokens, aggregators));
        }
        if ((0, misc_utils_1.notFalsyOrZeroAddress)(lendingRateOracleAddress)) {
            lendingRateOracle = await (0, contracts_getters_1.getLendingRateOracle)(lendingRateOracleAddress);
        }
        else {
            lendingRateOracle = await (0, contracts_deployments_1.deployLendingRateOracle)(verify);
            const { USD, ...tokensAddressesWithoutUsd } = tokensToWatch;
            await (0, oracles_helpers_1.setInitialMarketRatesInRatesOracleByHelper)(lendingRateOracles, tokensAddressesWithoutUsd, lendingRateOracle, admin);
        }
        console.log('Aave Oracle: %s', aaveOracle.address);
        console.log('Lending Rate Oracle: %s', lendingRateOracle.address);
        // Register the proxy price provider on the addressesProvider
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setPriceOracle(aaveOracle.address));
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setLendingRateOracle(lendingRateOracle.address));
    }
    catch (error) {
        if (DRE.network.name.includes('tenderly')) {
            const transactionLink = `https://dashboard.tenderly.co/${DRE.config.tenderly.username}/${DRE.config.tenderly.project}/fork/${DRE.tenderly.network().getFork()}/simulation/${DRE.tenderly.network().getHead()}`;
            console.error('Check tx error:', transactionLink);
        }
        throw error;
    }
});
