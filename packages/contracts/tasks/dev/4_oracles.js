"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const oracles_helpers_1 = require("../../helpers/oracles-helpers");
const types_1 = require("../../helpers/types");
const misc_utils_1 = require("../../helpers/misc-utils");
const mock_helpers_1 = require("../../helpers/mock-helpers");
const configuration_1 = require("../../helpers/configuration");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
(0, config_1.task)('dev:deploy-oracles', 'Deploy oracles for dev environment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const { Mocks: { AllAssetsInitialPrices }, ProtocolGlobalParams: { UsdAddress, MockUsdPriceInWei }, OracleQuoteCurrency, OracleQuoteUnit, } = poolConfig;
    const defaultTokenList = {
        ...Object.fromEntries(Object.keys(types_1.TokenContractId).map((symbol) => [symbol, ''])),
        USD: UsdAddress,
    };
    const mockTokens = await (0, contracts_getters_1.getAllMockedTokens)();
    const mockTokensAddress = Object.keys(mockTokens).reduce((prev, curr) => {
        prev[curr] = mockTokens[curr].address;
        return prev;
    }, defaultTokenList);
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const admin = await addressesProvider.getGlobalAdmin();
    const fallbackOracle = await (0, contracts_deployments_1.deployPriceOracle)(verify);
    await (0, misc_utils_1.waitForTx)(await fallbackOracle.setEthUsdPrice(MockUsdPriceInWei));
    await (0, oracles_helpers_1.setInitialAssetPricesInOracle)(AllAssetsInitialPrices, mockTokensAddress, fallbackOracle);
    const mockAggregators = await (0, oracles_helpers_1.deployAllMockAggregators)(AllAssetsInitialPrices, verify);
    const allTokenAddresses = (0, mock_helpers_1.getAllTokenAddresses)(mockTokens);
    const allAggregatorsAddresses = (0, mock_helpers_1.getAllAggregatorsAddresses)(mockAggregators);
    const [tokens, aggregators] = (0, contracts_getters_1.getPairsTokenAggregator)(allTokenAddresses, allAggregatorsAddresses, OracleQuoteCurrency);
    const vmexOracleImpl = await (0, contracts_deployments_1.deployVMEXOracle)(verify);
    // Register the proxy price provider on the addressesProvider
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setPriceOracle(vmexOracleImpl.address));
    const VMEXOracleProxy = await (0, contracts_getters_1.getVMEXOracle)(await addressesProvider.getPriceOracle());
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.VMEXOracle, VMEXOracleProxy.address);
    await (0, misc_utils_1.waitForTx)(await VMEXOracleProxy.setBaseCurrency(await (0, configuration_1.getQuoteCurrency)(poolConfig), poolConfig.OracleQuoteUnit));
    await (0, misc_utils_1.waitForTx)(await VMEXOracleProxy.setAssetSources(tokens, aggregators));
    await (0, misc_utils_1.waitForTx)(await VMEXOracleProxy.setFallbackOracle(fallbackOracle.address));
});
//# sourceMappingURL=4_oracles.js.map