import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { ProtocolErrors } from '../helpers/types';
import {getCurvePrice} from "./helpers/curve-calculation";
import {UserAccountData} from "./interfaces/index";
import {almostEqualOrEqual} from "./helpers/almostEqual";
import {calculateExpectedInterest, calculateUserStake, calculateAdminInterest} from "./helpers/strategy-interest";
chai.use(function (chai: any, utils: any) {
  chai.Assertion.overwriteMethod(
    "almostEqualOrEqual",
    function (original: any) {
      return function (this: any, expected: UserAccountData) {
        const actual = <UserAccountData>this._obj;

        almostEqualOrEqual.apply(this, [expected, actual]);
      };
    }
  );
});


makeSuite(
    "flash liquidation ",
    () => {

		const fs = require('fs'); 	
		const contractGetters = require('../helpers/contracts-getters.ts'); 
			
		it("should make a deposit", async () => {
			
			const lendingPool = await contractGetters.getLendingPool(); 
			const userLiquidationLogc = await contractGetters.getUserLiquidationLogic(); 
			
			//impersonate signer with funds to deposit
			const impersonatedSigner = await DRE.ethers.getImpersonatedSigner("address");
			//await impersonatedSigner.sendTx..
			//
			//deposit to lending pool
			//borrow too much 
			//check that account can be liquidated
			//use performUpkeep to liquidate
		}); 
	}); 
