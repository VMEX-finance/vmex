import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  deployAaveOracle,
  deployCurveV1Oracle,
  deployCurveV2Oracle,
  deployCurveOracleWrapper,
  deployLendingRateOracle,
  deployUniswapOracle,
} from "../../helpers/contracts-deployments";
import { setInitialMarketRatesInRatesOracleByHelper } from "../../helpers/oracles-helpers";
import { ICommonConfiguration, eNetwork, SymbolMap } from "../../helpers/types";
import { waitForTx, notFalsyOrZeroAddress } from "../../helpers/misc-utils";
import {
  ConfigNames,
  loadPoolConfig,
  getGenesisPoolAdmin,
  getLendingRateOracles,
  getQuoteCurrency,
} from "../../helpers/configuration";
import {
  getAaveOracle,
  getLendingPoolAddressesProvider,
  getLendingRateOracle,
  getPairsTokenAggregator,
} from "../../helpers/contracts-getters";
import {
  getUniswapAddress,
} from "../../helpers/get-uniswap-data";
import { AaveOracle, LendingRateOracle, BaseUniswapOracle } from "../../types";

task("full:deploy-oracles", "Deploy oracles for dev enviroment")
  .addFlag("verify", "Verify contracts at Etherscan")
  .addParam(
    "pool",
    `Pool name to retrieve configuration, supported: ${Object.values(
      ConfigNames
    )}`
  )
  .setAction(async ({ verify, pool }, DRE) => {
    try {
      await DRE.run("set-DRE");
      const network = <eNetwork>DRE.network.name;
      const poolConfig = loadPoolConfig(pool);
      const {
        ProtocolGlobalParams: { UsdAddress },
        ReserveAssets,
        FallbackOracle,
        ChainlinkAggregator,
      } = poolConfig as ICommonConfiguration;
      const lendingRateOracles = getLendingRateOracles(poolConfig);
      const addressesProvider = await getLendingPoolAddressesProvider();
      const admin = await getGenesisPoolAdmin(poolConfig);
      const aaveOracleAddress = getParamPerNetwork(
        poolConfig.AaveOracle,
        network
      );
      const lendingRateOracleAddress = getParamPerNetwork(
        poolConfig.LendingRateOracle,
        network
      );
      // const fallbackOracleAddress = await getParamPerNetwork(
      //   FallbackOracle,
      //   network
      // );
      const reserveAssets = await getParamPerNetwork(ReserveAssets, network);

      const chainlinkAggregators = await getParamPerNetwork(
        ChainlinkAggregator,
        network
      );

      const tokensToWatch: SymbolMap<string> = {
        ...reserveAssets,
        USD: UsdAddress,
      };
      const [tokens, aggregators] = getPairsTokenAggregator(
        tokensToWatch,
        chainlinkAggregators,
        poolConfig.OracleQuoteCurrency
      );

      let uniswapOracle: BaseUniswapOracle;

      // for(let [tokenSymbol, tokenAddress] of Object.entries(reserveAssets)) {
      //   await (await getUniswapAddress(tokenAddress, tokenSymbol))
      // }

      const uniswapPools = await Promise.all(Object.entries(reserveAssets).map(([tokenSymbol, tokenAddress]) => getUniswapAddress(tokenAddress, tokenSymbol)))
      // if (notFalsyOrZeroAddress(fallbackOracleAddress)) {
      //   uniswapOracle = await getAaveOracle(fallbackOracleAddress);
      //   await waitForTx(await aaveOracle.setAssetSources(tokens, aggregators));
      // } else {
        const uniswapAddresses = uniswapPools.map((el) => el.poolAddress);
        const uniswapTokenToPrice = uniswapPools.map((el) => el.tokenToPrice);
        console.log("uniswapAddresses: ",uniswapAddresses)
        console.log("uniswapTokenToPrice: ",uniswapTokenToPrice)
        uniswapOracle = await deployUniswapOracle(
          [
            tokens,
            uniswapAddresses,
            uniswapTokenToPrice,
          ],
          verify
        );
        // await waitForTx(await uniswapOracle.setAssetSources(tokens, aggregators));
      // }

      console.log("Uniswap oracle deployed at: ", uniswapOracle.address)

      let aaveOracle: AaveOracle;
      let lendingRateOracle: LendingRateOracle;

      if (notFalsyOrZeroAddress(aaveOracleAddress)) {
        aaveOracle = await getAaveOracle(aaveOracleAddress);
        await waitForTx(await aaveOracle.setAssetSources(tokens, aggregators));
      } else {
        aaveOracle = await deployAaveOracle(
          [
            tokens,
            aggregators,
            uniswapOracle.address,
            await getQuoteCurrency(poolConfig),
            poolConfig.OracleQuoteUnit,
          ],
          verify
        );
        await waitForTx(await aaveOracle.setAssetSources(tokens, aggregators));
      }

      if (notFalsyOrZeroAddress(lendingRateOracleAddress)) {
        lendingRateOracle = await getLendingRateOracle(
          lendingRateOracleAddress
        );
      } else {
        lendingRateOracle = await deployLendingRateOracle(verify);
        const { USD, ...tokensAddressesWithoutUsd } = tokensToWatch;
        await setInitialMarketRatesInRatesOracleByHelper(
          lendingRateOracles,
          tokensAddressesWithoutUsd,
          lendingRateOracle,
          admin
        );
      }

      console.log("Aave Oracle: %s", aaveOracle.address);
      console.log("Lending Rate Oracle: %s", lendingRateOracle.address);

      // Register the proxy price provider on the addressesProvider
      await waitForTx(
        await addressesProvider.setAavePriceOracle(aaveOracle.address)
      );
      await waitForTx(
        await addressesProvider.setLendingRateOracle(lendingRateOracle.address)
      );

      //Now, we don't use this anymore. Outdated: Also add Curve provider to our aave address provider so we can get_registry to have access to function that converts lp token address to pool address
      // await waitForTx(
      //   await addressesProvider.setCurveAddressProvider(
      //     "0x0000000022D53366457F9d5E68Ec105046FC4383"
      //   ) //this will always be address provider for curve
      // );

      //Also deploy CurveOracleV2 contract and add that contract to the aave address provider
      const curveOracle = await deployCurveV1Oracle(verify);

      if (!notFalsyOrZeroAddress(curveOracle.address)) {
        //bad address
        throw "deploying curve oracle v1 error, address is falsy or zero";
      } else {
        console.log("Curve oracle deployed at ", curveOracle.address);
      }

      await waitForTx(
        await addressesProvider.setCurvePriceOracle(curveOracle.address, 1)
      );

      const curveV2Oracle = await deployCurveV2Oracle(verify);

      if (!notFalsyOrZeroAddress(curveV2Oracle.address)) {
        //bad address
        throw "deploying curve oracle v2 error, address is falsy or zero";
      } else {
        console.log("Curve oracle v2 deployed at ", curveV2Oracle.address);
      }

      await waitForTx(
        await addressesProvider.setCurvePriceOracle(curveV2Oracle.address, 2)
      );

      //Also deploy CurveOracleV2 wrapper contract and add that contract to the aave address provider
      const curveOracleWrapper = await deployCurveOracleWrapper(
        addressesProvider.address,
        aaveOracle.address, //TODO: there is no fallback oracle for the curve oracles
        await getQuoteCurrency(poolConfig),
        poolConfig.OracleQuoteUnit,
        verify
      );

      if (!notFalsyOrZeroAddress(curveOracleWrapper.address)) {
        //bad address
        throw "deploying curve oracle wrapper error, address is falsy or zero";
      } else {
        console.log(
          "Curve oracle wrapper deployed at ",
          curveOracleWrapper.address
        );
      }

      await waitForTx(
        await addressesProvider.setCurvePriceOracleWrapper(
          curveOracleWrapper.address
        )
      );

      //TODO: deploy the other LP token contracts
    } catch (error) {
      if (DRE.network.name.includes("tenderly")) {
        const transactionLink = `https://dashboard.tenderly.co/${
          DRE.config.tenderly.username
        }/${DRE.config.tenderly.project}/fork/${DRE.tenderly
          .network()
          .getFork()}/simulation/${DRE.tenderly.network().getHead()}`;
        console.error("Check tx error:", transactionLink);
      }
      throw error;
    }
  });
