"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_uniswap_data_1 = require("../../helpers/get-uniswap-data");
const config_1 = require("hardhat/config");
const configuration_1 = require("../../helpers/configuration");
(0, config_1.task)('get-uniswap-data', 'Gets uniswap data')
    .addFlag("verify", "Verify contracts at Etherscan")
    .addFlag("skipRegistry", "Skip addresses provider registration at Addresses Provider Registry")
    .setAction(async ({ verify, skipRegistry }, DRE) => {
    try {
        const pool = configuration_1.ConfigNames.Aave;
        await DRE.run("set-DRE");
        const network = DRE.network.name;
        // console.log("network: ",network)
        const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
        const { ProtocolGlobalParams: { UsdAddress }, ReserveAssets, FallbackOracle, ChainlinkAggregator, } = poolConfig;
        // console.log("ReserveAssets: ",ReserveAssets)
        // const fallbackOracleAddress = await getParamPerNetwork(
        //   FallbackOracle,
        //   network
        // );
        const { main } = ReserveAssets; //await getParamPerNetwork(ReserveAssets, network);
        const reserveAssets = main;
        // console.log("reserveAssets: ",reserveAssets)
        const uniswapPools = await Promise.all(Object.entries(reserveAssets).map(([tokenSymbol, tokenAddress]) => (0, get_uniswap_data_1.getUniswapAddress)(tokenAddress, tokenSymbol)));
        // if (notFalsyOrZeroAddress(fallbackOracleAddress)) {
        //   uniswapOracle = await getAaveOracle(fallbackOracleAddress);
        //   await waitForTx(await aaveOracle.setAssetSources(tokens, aggregators));
        // } else {
        const uniswapAddresses = uniswapPools.map((el) => el.poolAddress);
        const uniswapTokenToPrice = uniswapPools.map((el) => el.tokenToPrice);
        console.log("uniswapAddresses: ", uniswapAddresses);
        console.log("uniswapTokenToPrice: ", uniswapTokenToPrice);
        let myUniswapAddr = {}; //new Map<string, AddressTarget>;
        let myUniswapTarget = {}; //new Map<string, AddressTarget>;
        let i = 0;
        for (let [tokenSymbol, tokenAddress] of Object.entries(reserveAssets)) {
            myUniswapAddr[tokenSymbol] = uniswapAddresses[i];
            myUniswapTarget[tokenSymbol] = uniswapTokenToPrice[i];
            i += 1;
        }
        console.log(myUniswapAddr);
        console.log(myUniswapTarget);
    }
    catch (err) {
        console.error(err);
    }
});
//# sourceMappingURL=get-uniswap-data.js.map