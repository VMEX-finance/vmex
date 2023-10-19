import { task } from "hardhat/config";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import { ICommonConfiguration, eNetwork, SymbolMap, IOptimismConfiguration, IChainlinkInternal } from "../../helpers/types";
import { notFalsyOrZeroAddress, waitForTx } from "../../helpers/misc-utils";
import {
  ConfigNames,
  loadPoolConfig,
} from "../../helpers/configuration";
import {
  getVMEXOracle,
  getLendingPoolAddressesProvider,
  getPairsTokenAggregator,
} from "../../helpers/contracts-getters";
import { ZERO_ADDRESS } from "../../helpers/constants";

task("add:deploy-oracles", "Add oracles given existing deployment")
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

      const VMEXOracleProxy =
        await getVMEXOracle(
          await addressesProvider.getPriceOracle()
        );

      let tokensToProcess: string[] = []
      let aggregatorsToProcess: IChainlinkInternal[] = []

      for(let i = 0; i< tokens2.length; i++) {
        const aggInContract = await VMEXOracleProxy.getSourceOfAsset(tokens2[i])
        if(aggInContract == ZERO_ADDRESS) {
          tokensToProcess.push(tokens2[i])
          aggregatorsToProcess.push(aggregators[i])
        }
      }

      console.log("processing ", tokensToProcess)
      console.log("chainlink data ", aggregatorsToProcess)

    } catch (error) {
      throw error;
    }
  });
