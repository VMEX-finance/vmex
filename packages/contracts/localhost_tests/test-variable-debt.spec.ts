// import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";
import rawBRE from "hardhat";
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
before(async () => {
    await rawBRE.run("set-DRE");

    console.log("\n***************");
    console.log("DRE finished");
    console.log("***************\n");
  });
makeSuite(
    "var debt ",
    () => {
      const reserveFactor = BigNumber.from(1000);
      const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
        const fs = require('fs');
        const contractGetters = require('../helpers/contracts-getters.ts');
        // const lendingPool = await contractGetters.getLendingPool();
        // Load the first signer

        const WETHadd = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        const WETHabi = [
            "function allowance(address owner, address spender) external view returns (uint256 remaining)",
            "function approve(address spender, uint256 value) external returns (bool success)",
            "function balanceOf(address owner) external view returns (uint256 balance)",
            "function decimals() external view returns (uint8 decimalPlaces)",
            "function name() external view returns (string memory tokenName)",
            "function symbol() external view returns (string memory tokenSymbol)",
            "function totalSupply() external view returns (uint256 totalTokensIssued)",
            "function transfer(address to, uint256 value) external returns (bool success)",
            "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
            "function deposit() public payable",
            "function withdraw(uint wad) public"
        ];

        var CurveTokenAdd = "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff"
        var CurveTokenAddabi = [
            "function allowance(address owner, address spender) external view returns (uint256 remaining)",
            "function approve(address spender, uint256 value) external returns (bool success)",
            "function balanceOf(address owner) external view returns (uint256 balance)",
            "function decimals() external view returns (uint8 decimalPlaces)",
            "function name() external view returns (string memory tokenName)",
            "function symbol() external view returns (string memory tokenSymbol)",
            "function totalSupply() external view returns (uint256 totalTokensIssued)",
            "function transfer(address to, uint256 value) external returns (bool success)",
            "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
            "function deposit() public payable",
            "function withdraw(uint wad) public"
        ];


        var triCryptoDepositAdd = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46" //0xD51a44d3FaE010294C616388b506AcdA1bfAAE46 this is the address given on curve.fi/contracts
        var triCryptoDepositAbi = fs.readFileSync("./localhost_tests/abis/tricrypto.json").toString()


        const DAIadd = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        const DAI_ABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()

        

        it("get var debt", async () => {
          const lendingPool = await contractGetters.getLendingPool();
          
          const signer = (await DRE.ethers.getSigners())[2]
          var usdc = new DRE.ethers.Contract(DAIadd,DAI_ABI)
          const dataProv = await contractGetters.getAaveProtocolDataProvider();

          const userReserveData = await dataProv.getUserReserveData(usdc.address, 0, signer.address);

          var userDatBefore:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,0,false)
          const tricrypto2Tranch1ATokenAddress =
            (await lendingPool.getReserveData(usdc.address, 0)).variableDebtTokenAddress;
          // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2

          const tricrypto2Tranch1AToken =
            await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);

          const aTokenBalance = await tricrypto2Tranch1AToken.balanceOf(signer.address);
          console.log("signer debt amount: ", aTokenBalance);

        });

    }
)

