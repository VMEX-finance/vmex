
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

import AaveConfig from "../markets/aave";
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
    "yearn and curve oracle test ",
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
         const curvePools = [
          '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46',//tricrypto, needs read reentrancy protection
          '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',//threepool
          '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',//stetheth, needs read reentrancy protection
          '0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2',//frax usdc
          '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',//frax 3crv
       ];

       const curveSize = [
        3,//tricrypto
        3,//threepool
        2,//stetheth
        2,//frax usdc
        2,//frax 3crv
     ];
        const CurveTokenAddabi = [
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
        const CurvePoolAbi = [
          `function add_liquidity(uint256[2] calldata amounts,uint256 min_mint_amount) external payable`,
          `function add_liquidity(uint256[3] calldata amounts,uint256 min_mint_amount) external payable`,
          `function coins(uint256 arg0) external view returns (address out)`,
          `function get_virtual_price() external view returns (uint256 out)`,
          `function claim_admin_fees() external`,
          `function withdraw_admin_fees() external`,
          `function owner() external view returns(address)`,
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
      
      const oracleAbi = [
          "function getAssetPrice(address asset) public view returns (uint256)"
      ]

          it("test pricing", async () => {
            var signer = await contractGetters.getFirstSigner();
            


            const addProv = await contractGetters.getLendingPoolAddressesProvider();

            const oracleAdd = await addProv.connect(signer).getPriceOracle();



            const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi);

            for(let i =0;i<curveAssets.length;i++){
                const CurveToken = new DRE.ethers.Contract(curveAssets[i],CurveTokenAddabi)
                const CurvePool = new DRE.ethers.Contract(curvePools[i],CurvePoolAbi)
                const yearnVault = new DRE.ethers.Contract(yvAddr[i],yvAbi)
                console.log("Pricing ",curveAssets[i])
                const pricePerCurveToken = await oracle.connect(signer).callStatic.getAssetPrice(CurveToken.address);
                console.log("pricePerCurveToken: ",pricePerCurveToken)
                var cumProduct = 1;
                if(i==0)
                  await CurvePool.connect(signer).claim_admin_fees();
                
                if(i==2){
                  const ownerContract = new DRE.ethers.Contract(await CurvePool.connect(signer).owner(), CurvePoolAbi)
                  await ownerContract.connect(signer).withdraw_admin_fees();
                }
                const vp = await CurvePool.connect(signer).get_virtual_price()
                var expectedPrice;
                for(let j = 0;j<curveSize[i];j++) {
                  var tokenAddr = await CurvePool.connect(signer).coins(j);
                  if(tokenAddr == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"){
                    tokenAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
                  }
                  const tokenPrice = await oracle.connect(signer).callStatic.getAssetPrice(tokenAddr);
                  cumProduct *= Number(ethers.utils.formatUnits(tokenPrice, 18))
                }
                
                if(i==0) {//v2 
                  expectedPrice = curveSize[i] * Math.pow(cumProduct, 1/curveSize[i]) * vp

                  
                }
                else if(i==2) { //steth
                  expectedPrice = BigNumber.from("1056989069481669153");
                }
                else {
                  expectedPrice = BigNumber.from("667353628135763");
                }
                console.log("expected curve price: ",expectedPrice)
                const diff = Math.abs(Number(expectedPrice) - Number(pricePerCurveToken))/expectedPrice
                expect(
                  diff
                ).to.be.lte(0.03, "Curve prices do not match");

                const pricePerYearnToken = await oracle.connect(signer).callStatic.getAssetPrice(yearnVault.address);
                const pricePerShare = await yearnVault.connect(signer).pricePerShare();
                
                console.log("pricePerYearnToken: ",pricePerYearnToken)

                var expectedYearnPrice = BigNumber.from(pricePerCurveToken.toString()).mul(BigNumber.from(pricePerShare.toString())).div(DRE.ethers.utils.parseEther("1"));
                expect(
                    pricePerYearnToken.toString()
                ).to.be.bignumber.equal(expectedYearnPrice.toString(), "Prices do not match");
            }

            
          });
  
    }
)

