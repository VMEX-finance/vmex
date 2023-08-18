// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { eEthereumNetwork, IChainlinkInternal, ICommonConfiguration, ProtocolErrors } from '../helpers/types';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from "../helpers/constants";
import {AaveConfig} from "../../src/markets/aave"
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { toBytes32, setStorageAt } from "../helpers/token-fork";
import { getAToken, getPairsTokenAggregator } from "../helpers/contracts-getters";

const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json")
makeSuite(
    "General testing of tokens",
    () => {
        const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW, VL_BORROWING_NOT_ENABLED } = ProtocolErrors;
        const fs = require('fs');
        const contractGetters = require('../helpers/contracts-getters.ts');
        // const lendingPool = await contractGetters.getLendingPool();
        // Load the first signer
        
          it("Testing if symbol was set correctly", async () => {
            const tokens = await getParamPerNetwork(AaveConfig.ReserveAssets, eEthereumNetwork.main);
            const config = AaveConfig.ReservesConfig
            const WETHConfig = config["WETH"]
            if(!tokens || !WETHConfig){
              return
            }
            var dataProv = await contractGetters.getAaveProtocolDataProvider()
            var signer = await contractGetters.getFirstSigner();
            const addProv = await contractGetters.getLendingPoolAddressesProvider();
            const oracleAdd = await addProv.connect(signer).getPriceOracle();
            const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi.abi);
            const lendingPool = await contractGetters.getLendingPool();
            for(let [symbol, address] of Object.entries(tokens)){
                console.log("Testing ",symbol)
                const dat = await lendingPool.getReserveData(address,1);
                const addr = dat.aTokenAddress;
                console.log("address of atoken is ",addr);
                if(addr && addr!=ZERO_ADDRESS) {
                  const tok = await getAToken(addr);
                  console.log("aToken symbol: ",await tok.symbol())
                }
                
                console.log("-----------------------------------")
                console.log()
                console.log()
                console.log()
            }
          });

    }
)

