"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const misc_utils_1 = require("../../helpers/misc-utils");
const configuration_1 = require("../../helpers/configuration");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_helpers_2 = require("../../helpers/contracts-helpers");
const types_1 = require("../../helpers/types");
(0, config_1.task)("full:deploy-oracles", "Deploy oracles for dev enviroment")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, DRE) => {
    try {
        await DRE.run("set-DRE");
        const network = DRE.network.name;
        const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
        const { ProtocolGlobalParams: { UsdAddress }, ReserveAssets, ChainlinkAggregator, SequencerUptimeFeed, RETHOracle, ProviderId } = poolConfig;
        const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
        // const fallbackOracleAddress = await getParamPerNetwork(
        //   FallbackOracle,
        //   network
        // );
        const reserveAssets = await (0, contracts_helpers_1.getParamPerNetwork)(ReserveAssets, network);
        let tokensToWatch = {
            ...reserveAssets,
            // USD: UsdAddress,
        };
        let uniswapOracle;
        uniswapOracle = await (0, contracts_deployments_1.deployUniswapOracle)(verify);
        console.log("Uniswap oracle deployed at: ", uniswapOracle.address);
        const chainlinkAggregators = await (0, contracts_helpers_1.getParamPerNetwork)(ChainlinkAggregator, network);
        tokensToWatch = {
            ...reserveAssets,
            USD: UsdAddress,
        };
        if (!chainlinkAggregators) {
            throw "chainlinkAggregators is undefined. Check configuration at config directory";
        }
        const [tokens2, aggregators] = (0, contracts_getters_1.getPairsTokenAggregator)(tokensToWatch, chainlinkAggregators, poolConfig.OracleQuoteCurrency);
        const vmexOracleImpl = await (0, contracts_deployments_1.deployVMEXOracle)(verify);
        // Register the proxy price provider on the addressesProvider
        await (0, misc_utils_1.waitForTx)(await addressesProvider.setPriceOracle(vmexOracleImpl.address));
        const VMEXOracleProxy = await (0, contracts_getters_1.getVMEXOracle)(await addressesProvider.getPriceOracle());
        await (0, contracts_helpers_2.insertContractAddressInDb)(types_1.eContractid.VMEXOracle, VMEXOracleProxy.address);
        await (0, misc_utils_1.waitForTx)(await VMEXOracleProxy.setBaseCurrency(await (0, configuration_1.getQuoteCurrency)(poolConfig), poolConfig.OracleQuoteDecimals, poolConfig.OracleQuoteUnit, poolConfig.OracleQuoteCurrency));
        await (0, misc_utils_1.waitForTx)(await VMEXOracleProxy.setAssetSources(tokens2, aggregators));
        await (0, misc_utils_1.waitForTx)(await VMEXOracleProxy.setFallbackOracle(uniswapOracle.address));
        console.log("WETH addr: ", tokensToWatch["WETH"]);
        await (0, misc_utils_1.waitForTx)(await VMEXOracleProxy.setWETH(tokensToWatch["WETH"]));
        const rETHOracle = (0, contracts_helpers_1.getParamPerNetwork)(RETHOracle, network);
        if (rETHOracle && (0, misc_utils_1.notFalsyOrZeroAddress)(rETHOracle)) {
            console.log("setting up rETHOracle");
            await VMEXOracleProxy.setRETHOracle(rETHOracle);
        }
        const seqUpFeed = (0, contracts_helpers_1.getParamPerNetwork)(SequencerUptimeFeed, network);
        //link sequencer uptime oracle for applicable markets
        if (seqUpFeed && (0, misc_utils_1.notFalsyOrZeroAddress)(seqUpFeed)) {
            console.log("setting up sequencer uptime feed for chainid: ", ProviderId);
            await (0, misc_utils_1.waitForTx)(await VMEXOracleProxy.setSequencerUptimeFeed(ProviderId, seqUpFeed));
        }
    }
    catch (error) {
        // if (DRE.network.name.includes("tenderly")) {
        //   const transactionLink = `https://dashboard.tenderly.co/${
        //     DRE.config.tenderly.username
        //   }/${DRE.config.tenderly.project}/fork/${DRE.tenderly
        //     .network()
        //     .getFork()}/simulation/${DRE.tenderly.network().getHead()}`;
        //   console.error("Check tx error:", transactionLink);
        // }
        throw error;
    }
});
//# sourceMappingURL=3_oracles.js.map