import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import {
  deployVMEXOracle,
  deployUniswapOracle,
} from "../../helpers/contracts-deployments";
import { ICommonConfiguration, eNetwork, SymbolMap, IOptimismConfiguration } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  ConfigNames,
  loadPoolConfig,
  getQuoteCurrency,
} from "../../helpers/configuration";
import {
  getVMEXOracle,
  getLendingPoolAddressesProvider,
  getPairsTokenAggregator,
} from "../../helpers/contracts-getters";
import { BaseUniswapOracle } from "../../types";
import {
  insertContractAddressInDb,
} from "../../helpers/contracts-helpers";
import { eContractid } from "../../helpers/types";
import { exit } from "process";

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
      console.log("3: network: ", network)
      const poolConfig = loadPoolConfig(pool);
      const {
        ProtocolGlobalParams: { UsdAddress },
        ReserveAssets,
        ChainlinkAggregator,
        SequencerUptimeFeed,
        RETHOracle,
        ProviderId
      } = poolConfig as ICommonConfiguration;
      const addressesProvider = await getLendingPoolAddressesProvider();
      // const fallbackOracleAddress = await getParamPerNetwork(
      //   FallbackOracle,
      //   network
      // );
      const reserveAssets = getParamPerNetwork(ReserveAssets, network);

      let tokensToWatch: SymbolMap<string> = {
        ...reserveAssets,
        // USD: UsdAddress,
      };


      let uniswapOracle: BaseUniswapOracle;

        uniswapOracle = await deployUniswapOracle(
          verify
        );

      console.log("Uniswap oracle deployed at: ", uniswapOracle.address)

      const chainlinkAggregators = await getParamPerNetwork(
        ChainlinkAggregator,
        network
      );
      tokensToWatch = {
        ...reserveAssets,
        USD: UsdAddress,
      };
      
      if (!chainlinkAggregators) {
        throw "chainlinkAggregators is undefined. Check configuration at config directory";
      }
      const [tokens2, aggregators] = getPairsTokenAggregator(
        tokensToWatch,
        chainlinkAggregators,
        poolConfig.OracleQuoteCurrency
      );
      const vmexOracleImpl = await deployVMEXOracle(
        verify
      );

      // Register the proxy price provider on the addressesProvider
      await waitForTx(
        await addressesProvider.setPriceOracle(vmexOracleImpl.address)
      );

      const VMEXOracleProxy =
        await getVMEXOracle(
          await addressesProvider.getPriceOracle()
        );

      await insertContractAddressInDb(
        eContractid.VMEXOracle,
        VMEXOracleProxy.address
      );


      await waitForTx(await VMEXOracleProxy.setBaseCurrency(
        await getQuoteCurrency(poolConfig),
        poolConfig.OracleQuoteDecimals,
        poolConfig.OracleQuoteUnit,
        poolConfig.OracleQuoteCurrency
      ));
      await waitForTx(await VMEXOracleProxy.setAssetSources(tokens2, aggregators));
      await waitForTx(await VMEXOracleProxy.setFallbackOracle(uniswapOracle.address));
      console.log("WETH addr: ",tokensToWatch["WETH"])
      await waitForTx(await VMEXOracleProxy.setWETH(tokensToWatch["WETH"]));


      const rETHOracle = getParamPerNetwork(RETHOracle, network);
      if(rETHOracle && notFalsyOrZeroAddress(rETHOracle)) {
        console.log("setting up rETHOracle");
        await VMEXOracleProxy.setRETHOracle(rETHOracle);
      }
      
      

      const seqUpFeed = getParamPerNetwork(SequencerUptimeFeed, network);
      //link sequencer uptime oracle for applicable markets
      if(seqUpFeed && notFalsyOrZeroAddress(seqUpFeed)) {
        console.log("setting up sequencer uptime feed for chainid: ", ProviderId)
        await waitForTx(await VMEXOracleProxy.setSequencerUptimeFeed(ProviderId, seqUpFeed));
      }

      
    } catch (error) {
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
