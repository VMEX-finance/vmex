
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
    "curve oracle test ",
    () => {
        const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
        const fs = require('fs');
        const contractGetters = require('../helpers/contracts-getters.ts');
        // const lendingPool = await contractGetters.getLendingPool();
        // Load the first signer
        const curveAssets = [
            '0x061b87122Ed14b9526A813209C8a59a633257bAb',//susd 3crv
            '0xEfDE221f306152971D8e9f181bFe998447975810',//wsteth eth
         ];
         const curvePools = [
          '0x061b87122Ed14b9526A813209C8a59a633257bAb',//susd 3crv, withdraw admin fees
          '0xB90B9B1F91a01Ea22A182CD84C1E22222e39B415',//wsteth eth, withdraw admin fees
       ];

       const curveSize = [
        2,//tricrypto
        2,//threepool
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
        const beefyAddr = [
             '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF',
             '0x0892a178c363b4739e5Ac89E9155B9c30214C0c0',
            ]
        const beefyAbi = [
          "function totalAssets() external view returns(uint256)", 
	        "function totalSupply() external view returns(uint256)", 
	        "function getPricePerFullShare() external view returns(uint256)",
	        "function want() external view returns(address)",
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

            const mappings = await contractGetters.getAssetMappings();
            await mappings.setCurveMetadata([curveAssets[1]],[{
              _reentrancyType: 4, 
              _poolSize: '2',
              _curvePool: '0xB90B9B1F91a01Ea22A182CD84C1E22222e39B415'
            }])

            for(let i =0;i<curveAssets.length;i++){
                const CurveToken = new DRE.ethers.Contract(curveAssets[i],CurveTokenAddabi)
                const CurvePool = new DRE.ethers.Contract(curvePools[i],CurvePoolAbi)
                const beefyVault = new DRE.ethers.Contract(beefyAddr[i],beefyAbi)
                console.log("Pricing ",curveAssets[i])
                const pricePerCurveToken = await oracle.connect(signer).callStatic.getAssetPrice(CurveToken.address);
                console.log("pricePerCurveToken: ",pricePerCurveToken)
                var cumProduct = 1;
                var minAmount = ethers.constants.MaxUint256
                // if(i==1){
                //   const ownerContract = new DRE.ethers.Contract(await CurvePool.connect(signer).owner(), CurvePoolAbi)
                //   await ownerContract.connect(signer).withdraw_admin_fees();
                // }
                const vp = await CurvePool.connect(signer).get_virtual_price()
                var expectedPrice;
                if(i==0)
                  expectedPrice = "101530212"
                else if(i==1)
                  expectedPrice = "196400072983"
                
                console.log("expected curve price: ",expectedPrice)
                const diff = (Math.abs(Number(expectedPrice) - Number(pricePerCurveToken)))/Number(expectedPrice)
                expect(
                  diff
                ).to.be.lte(0.01, "Curve prices do not match");
            }

            
          });
  
    }
)

