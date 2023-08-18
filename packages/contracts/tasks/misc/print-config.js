"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const configuration_1 = require("../../helpers/configuration");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
(0, config_1.task)("print-config", "Inits the DRE, to have access to all the plugins")
    .addParam("dataProvider", "Address of AaveProtocolDataProvider")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ pool, dataProvider }, localBRE) => {
    await localBRE.run("set-DRE");
    const network = process.env.FORK
        ? process.env.FORK
        : localBRE.network.name;
    console.log(network);
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const providerRegistryAddress = (0, contracts_helpers_1.getParamPerNetwork)(poolConfig.ProviderRegistry, network);
    const providerRegistry = await (0, contracts_getters_1.getLendingPoolAddressesProviderRegistry)(providerRegistryAddress);
    const providers = await providerRegistry.getAddressesProvidersList();
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)(providers[0]); // Checks first provider
    console.log("Addresses Providers", providers.join(", "));
    console.log("Market Id: ", await addressesProvider.getMarketId());
    console.log("LendingPool Proxy:", await addressesProvider.getLendingPool());
    console.log("Lending Pool Collateral Manager", await addressesProvider.getLendingPoolCollateralManager());
    console.log("Lending Pool Configurator proxy", await addressesProvider.getLendingPoolConfigurator());
    console.log("Global admin", await addressesProvider.getGlobalAdmin());
    console.log("Tranche 0 admin", await addressesProvider.getTrancheAdmin(0));
    console.log("Emergency admin", await addressesProvider.getEmergencyAdmin());
    console.log("Price Oracle", await addressesProvider.getPriceOracle());
    console.log("Lending Pool Data Provider", dataProvider);
    const protocolDataProvider = await (0, contracts_getters_1.getAaveProtocolDataProvider)(dataProvider);
    const fields = [
        "decimals",
        "ltv",
        "liquidationThreshold",
        "liquidationBonus",
        "reserveFactor",
        "usageAsCollateralEnabled",
        "borrowingEnabled",
        "stableBorrowRateEnabled",
        "isActive",
        "isFrozen",
    ];
    const tokensFields = ["aToken", "stableDebtToken", "variableDebtToken"];
    for (const [symbol, address] of Object.entries((0, contracts_helpers_1.getParamPerNetwork)(poolConfig.ReserveAssets, network))) {
        console.log(`- ${symbol} asset config`);
        console.log(`  - reserve address: ${address}`);
        const reserveData = await protocolDataProvider.getReserveConfigurationData(address, 0);
        const tokensAddresses = await protocolDataProvider.getReserveTokensAddresses(address, 0);
        fields.forEach((field, index) => {
            console.log(`  - ${field}:`, reserveData[field].toString());
        });
        tokensFields.forEach((field, index) => {
            console.log(`  - ${field}:`, tokensAddresses[index]);
        });
    }
});
//# sourceMappingURL=print-config.js.map