"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const configuration_1 = require("../../helpers/configuration");
const constants_1 = require("../../helpers/constants");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const types_1 = require("../../helpers/types");
const types_2 = require("../../types");
(0, config_1.task)("verify:tokens", "Deploy oracles for dev enviroment")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, all, pool }, localDRE) => {
    await localDRE.run("set-DRE");
    const network = localDRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const { ReserveAssets, ReservesConfig } = poolConfig;
    const treasuryAddress = await (0, configuration_1.getTreasuryAddress)(poolConfig);
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const lendingPoolProxy = types_2.LendingPoolFactory.connect(await addressesProvider.getLendingPool(), await (0, contracts_getters_1.getFirstSigner)());
    const lendingPoolConfigurator = types_2.LendingPoolConfiguratorFactory.connect(await addressesProvider.getLendingPoolConfigurator(), await (0, contracts_getters_1.getFirstSigner)());
    const configs = Object.entries(ReservesConfig);
    for (let i = 0; i < 3; i++) {
        for (const entry of Object.entries((0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network))) {
            const [token, tokenAddress] = entry;
            console.log(`- Verifying ${token} token related contracts`);
            const { stableDebtTokenAddress, variableDebtTokenAddress, aTokenAddress, interestRateStrategyAddress, } = await lendingPoolProxy.getReserveData(tokenAddress, i);
            const tokenConfig = configs.find(([symbol]) => symbol === token);
            if (!tokenConfig) {
                throw `ReservesConfig not found for ${token} token`;
            }
            const { optimalUtilizationRate, baseVariableBorrowRate, variableRateSlope1, variableRateSlope2, stableRateSlope1, stableRateSlope2, } = tokenConfig[1].strategy;
            console.log;
            // Proxy Stable Debt
            console.log(`\n- Verifying Stable Debt Token proxy...\n`);
            await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.InitializableAdminUpgradeabilityProxy, await (0, contracts_getters_1.getProxy)(stableDebtTokenAddress), [lendingPoolConfigurator.address]);
            // Proxy Variable Debt
            console.log(`\n- Verifying  Debt Token proxy...\n`);
            await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.InitializableAdminUpgradeabilityProxy, await (0, contracts_getters_1.getProxy)(variableDebtTokenAddress), [lendingPoolConfigurator.address]);
            // Proxy aToken
            console.log("\n- Verifying aToken proxy...\n");
            await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.InitializableAdminUpgradeabilityProxy, await (0, contracts_getters_1.getProxy)(aTokenAddress), [lendingPoolConfigurator.address]);
            // Strategy Rate
            console.log(`\n- Verifying Strategy rate...\n`);
            await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.DefaultReserveInterestRateStrategy, await (0, contracts_getters_1.getInterestRateStrategy)(interestRateStrategyAddress), [
                addressesProvider.address,
                optimalUtilizationRate,
                baseVariableBorrowRate,
                variableRateSlope1,
                variableRateSlope2,
                stableRateSlope1,
                stableRateSlope2,
            ]);
            const stableDebt = await (0, contracts_getters_1.getAddressById)(`stableDebt${token}`);
            const variableDebt = await (0, contracts_getters_1.getAddressById)(`variableDebt${token}`);
            const aToken = await (0, contracts_getters_1.getAddressById)(`a${token}`);
            if (aToken) {
                console.log("\n- Verifying aToken...\n");
                await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.AToken, await (0, contracts_getters_1.getAToken)(aToken), [
                    lendingPoolProxy.address,
                    tokenAddress,
                    treasuryAddress,
                    `Aave interest bearing ${token}`,
                    `a${token}`,
                    constants_1.ZERO_ADDRESS,
                ]);
            }
            else {
                console.error(`Skipping aToken verify for ${token}. Missing address at JSON DB.`);
            }
            if (stableDebt) {
                console.log("\n- Verifying StableDebtToken...\n");
                await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.StableDebtToken, await (0, contracts_getters_1.getStableDebtToken)(stableDebt), [
                    lendingPoolProxy.address,
                    tokenAddress,
                    `Aave stable debt bearing ${token}`,
                    `stableDebt${token}`,
                    constants_1.ZERO_ADDRESS,
                ]);
            }
            else {
                console.error(`Skipping stable debt verify for ${token}. Missing address at JSON DB.`);
            }
            if (variableDebt) {
                console.log("\n- Verifying VariableDebtToken...\n");
                await (0, contracts_helpers_1.verifyContract)(types_1.eContractid.VariableDebtToken, await (0, contracts_getters_1.getVariableDebtToken)(variableDebt), [
                    lendingPoolProxy.address,
                    tokenAddress,
                    `Aave variable debt bearing ${token}`,
                    `variableDebt${token}`,
                    constants_1.ZERO_ADDRESS,
                ]);
            }
            else {
                console.error(`Skipping variable debt verify for ${token}. Missing address at JSON DB.`);
            }
        }
    }
});
