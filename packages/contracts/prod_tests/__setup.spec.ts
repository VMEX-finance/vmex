
import rawBRE from "hardhat";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { IChainlinkInternal, ICommonConfiguration, ProtocolErrors, eContractid } from '../helpers/types';
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { toBytes32, setStorageAt } from "../helpers/token-fork";
import { getDbEntry, getPairsTokenAggregator } from "../helpers/contracts-getters";
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
