
import rawBRE from "hardhat";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { IChainlinkInternal, ICommonConfiguration, ProtocolErrors } from '../helpers/types';
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { toBytes32, setStorageAt } from "../helpers/token-fork";
import { getPairsTokenAggregator } from "../helpers/contracts-getters";
import { ConfigNames, loadPoolConfig } from "../helpers/configuration";
const contractGetters = require('../helpers/contracts-getters.ts');
const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json")

const network = process.env.FORK
if(!network) throw "No fork"
const poolConfig = loadPoolConfig(network as ConfigNames);
before(async () => {
    await rawBRE.run("set-DRE");

    console.log("\n***************");
    console.log("DRE finished");
    console.log("***************\n");
  });

  before("set heartbeat higher", async () => {
    var signer = await contractGetters.getFirstSigner();
    const addProv = await contractGetters.getLendingPoolAddressesProvider();

    const oracleAdd = await addProv.connect(signer).getPriceOracle();
    const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi.abi);

    const {
      ProtocolGlobalParams: { UsdAddress },
      ReserveAssets,
      ChainlinkAggregator,
      SequencerUptimeFeed,
      ProviderId
    } = poolConfig as ICommonConfiguration;
    const reserveAssets = await getParamPerNetwork(ReserveAssets, network);

    const chainlinkAggregators = await getParamPerNetwork(
      ChainlinkAggregator,
      network
    );
    let tokensToWatch = {
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

    const ag2:IChainlinkInternal[] = aggregators.map((el:IChainlinkInternal)=>
    {
      return {
        feed: el.feed,
        heartbeat: 86400000
      }
    })

    await oracle.connect(signer).setAssetSources(tokens2, ag2, false);
  });
