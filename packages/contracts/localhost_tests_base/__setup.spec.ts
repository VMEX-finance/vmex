
import rawBRE from "hardhat";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { IChainlinkInternal, ICommonConfiguration, ProtocolErrors } from '../helpers/types';
import { MAX_UINT_AMOUNT } from "../helpers/constants";
import {BaseConfig} from "../markets/base"
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { toBytes32, setStorageAt } from "../helpers/token-fork";
import { getPairsTokenAggregator } from "../helpers/contracts-getters";
const contractGetters = require('../helpers/contracts-getters.ts');
const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json")
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

    const network = "base" as any
    const {
      ProtocolGlobalParams: { UsdAddress },
      ReserveAssets,
      ChainlinkAggregator,
      SequencerUptimeFeed,
      ProviderId
    } = BaseConfig as ICommonConfiguration;
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
      BaseConfig.OracleQuoteCurrency
    );

    const ag2:IChainlinkInternal[] = aggregators.map((el:IChainlinkInternal)=>
    {
      return {
        feed: el.feed,
        heartbeat: 86400000
      }
    })

    await oracle.connect(signer).setAssetSources(tokens2, ag2);
  });
