
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
    "yearn oracle test ",
    () => {
        const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
        const fs = require('fs');
        const contractGetters = require('../helpers/contracts-getters.ts');
        // const lendingPool = await contractGetters.getLendingPool();
        // Load the first signer
        const curveAssets = [
            '0xc4AD29ba4B3c580e6D59105FFf484999997675Ff',//tricrypto
            '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',//threepool
            '0x06325440D014e39736583c165C2963BA99fAf14E',//stetheth
            '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',//frax usdc
            '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',//frax 3crv
         ];
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
        const yvAddr = [
             '0x8078198Fc424986ae89Ce4a910Fc109587b6aBF3',
             '0x84E13785B5a27879921D6F685f041421C7F482dA',
             '0x5B8C556B8b2a78696F0B9B830B3d67623122E270',
             '0x1A5ebfF0E881Aec34837845e4D0EB430a1B4b737',
             '0xb37094c1B5614Bd6EcE40AFb295C26F4377069d3',
            ]
        const yvAbi = [
          "function totalAssets() external view returns(uint256)", 
	        "function totalSupply() external view returns(uint256)", 
	        "function pricePerShare() external view returns(uint256)",
	        "function token() external view returns(address)",
	        "function decimals() external view returns(uint256)",
	        "function balanceOf(address owner) external view returns (uint256 balance)",
	        "function deposit() external returns(uint256)",
          "function approve(address spender, uint256 value) external returns (bool success)",
      ];
      
      const curveOracleAbi = [
          "function getAssetPrice(address asset) public view returns (uint256)"
      ]

          it("test pricing", async () => {
            var signer = await contractGetters.getFirstSigner();
            


            const addProv = await contractGetters.getLendingPoolAddressesProvider();

            const curveOracleAdd = await addProv.connect(signer).getPriceOracle();



            const curveOracle = new DRE.ethers.Contract(curveOracleAdd,curveOracleAbi);

            for(let i =0;i<curveAssets.length;i++){
                const CurveToken = new DRE.ethers.Contract(curveAssets[i],CurveTokenAddabi)
                const yearnVault = new DRE.ethers.Contract(yvAddr[i],yvAbi)
                const pricePerCurveToken = await curveOracle.connect(signer).getAssetPrice(CurveToken.address);

                const pricePerYearnToken = await curveOracle.connect(signer).getAssetPrice(yearnVault.address);
                const pricePerShare = await yearnVault.connect(signer).pricePerShare();
                console.log("pricePerCurveToken: ",pricePerCurveToken)
                console.log("pricePerYearnToken: ",pricePerYearnToken)

                var expectedYearnPrice = BigNumber.from(pricePerCurveToken.toString()).mul(BigNumber.from(pricePerShare.toString())).div(DRE.ethers.utils.parseEther("1"));
                expect(
                    pricePerYearnToken.toString()
                ).to.be.bignumber.equal(expectedYearnPrice.toString(), "Prices do not match");
            }

            
          });
  
    }
)

