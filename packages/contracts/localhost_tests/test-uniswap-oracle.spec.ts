// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";
import rawBRE from "hardhat";
import { BigNumber, utils } from "ethers";
import { ProtocolErrors, iEthereumParamsPerNetwork } from '../helpers/types';
import {getCurvePrice} from "./helpers/curve-calculation";
import {UserAccountData} from "./interfaces/index";
import {almostEqualOrEqual} from "./helpers/almostEqual";
import {calculateExpectedInterest, calculateUserStake, calculateAdminInterest} from "./helpers/strategy-interest";
import AaveConfig from "../markets/aave";
import {reserveAssets} from "../helpers/constants";

makeSuite(
    "Uniswap oracles ",
    () => {
      const reserveFactor = BigNumber.from(1000);
      const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
        const fs = require('fs');
        const contractGetters = require('../helpers/contracts-getters.ts');
        // const lendingPool = await contractGetters.getLendingPool();
        // Load the first signer

        it("Test if uniswap oracle has same price as chainlink", async () => {
          var signer = await contractGetters.getFirstSigner();
          const uniswapOracle = await contractGetters.getBaseUniswapOracle();
          const chainlinkOracle = await contractGetters.getVMEXOracle();
            for(let [tokenSymbol, tokenAddress] of reserveAssets) {
                if(tokenSymbol == "SUSD"){
                    return; //skip this since uniswap doesn't support this apparently
                }
                // console.log("addr: ",tokenAddress)
                console.log("Token: ", tokenSymbol);
                let chainlinkPrice = await chainlinkOracle.getAssetPrice(tokenAddress);
                chainlinkPrice = chainlinkPrice.div("100000000000000").add(5).div(10)
                console.log("chainlinkPrice: ",chainlinkPrice);
                let uniPrice = await uniswapOracle.getAssetPrice(tokenAddress);
                uniPrice = uniPrice.div("100000000000000").add(5).div(10)
                console.log("uniPrice: ",uniPrice);
                console.log("----------------------------- ");

                expect(chainlinkPrice.sub(uniPrice).toNumber())
                .to.be.lessThan(2).and.greaterThan(-2);
            }
        });
    }
)

