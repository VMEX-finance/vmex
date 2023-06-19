
import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { eOptimismNetwork, IChainlinkInternal, ICommonConfiguration, ProtocolErrors } from '../helpers/types';
import {getCurvePrice} from "./helpers/curve-calculation";
import {UserAccountData} from "./interfaces/index";
import {almostEqualOrEqual} from "./helpers/almostEqual";
import {calculateExpectedInterest, calculateUserStake, calculateAdminInterest} from "./helpers/strategy-interest";

import OptimismConfig from "../markets/optimism";
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { getPairsTokenAggregator } from "../helpers/contracts-getters";
const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json")

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
    "velodrome oracle test ",
    () => {
    const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
    const fs = require('fs');
    const contractGetters = require('../helpers/contracts-getters.ts');
    // const lendingPool = await contractGetters.getLendingPool();
    // Load the first signer
     const VeloAbi = [
        "function allowance(address owner, address spender) external view returns (uint256 remaining)",
        "function approve(address spender, uint256 value) external returns (bool success)",
        "function balanceOf(address owner) external view returns (uint256 balance)",
        "function decimals() external view returns (uint8 decimalPlaces)",
        "function name() external view returns (string memory tokenName)",
        "function symbol() external view returns (string memory tokenSymbol)",
        "function totalSupply() external view returns (uint256 totalTokensIssued)",
        "function transfer(address to, uint256 value) external returns (bool success)",
        "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
        "function tokens() external returns (address, address)",
        "function metadata() external view returns (uint dec0, uint dec1, uint r0, uint r1, bool st, address t0, address t1)"
    ];
    const BeethovenAbi = [
       "function allowance(address owner, address spender) external view returns (uint256 remaining)",
       "function approve(address spender, uint256 value) external returns (bool success)",
       "function balanceOf(address owner) external view returns (uint256 balance)",
       "function decimals() external view returns (uint8 decimalPlaces)",
       "function name() external view returns (string memory tokenName)",
       "function symbol() external view returns (string memory tokenSymbol)",
       "function totalSupply() external view returns (uint256 totalTokensIssued)",
       "function transfer(address to, uint256 value) external returns (bool success)",
       "function getPoolId() external returns (bytes32 poolID)",
       "function getVault() external returns (IVault vaultAddress)",
       "function getRate() external view returns (uint256)"
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

    it("set heartbeat higher", async () => {
        var signer = await contractGetters.getFirstSigner();
        const addProv = await contractGetters.getLendingPoolAddressesProvider();

        const oracleAdd = await addProv.connect(signer).getPriceOracle();
        const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi.abi);

        const network = "optimism" as any
        const {
          ProtocolGlobalParams: { UsdAddress },
          ReserveAssets,
          ChainlinkAggregator,
          SequencerUptimeFeed,
          ProviderId
        } = OptimismConfig as ICommonConfiguration;
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
          OptimismConfig.OracleQuoteCurrency
        );

        const ag2:IChainlinkInternal[] = aggregators.map((el:IChainlinkInternal)=>
        {
          return {
            feed: el.feed,
            heartbeat: 86400
          }
        })

        await oracle.connect(signer).setAssetSources(tokens2, ag2);
      });


    it("test pricing", async () => {
        var signer = await contractGetters.getFirstSigner();
        const {ReserveAssets, ReservesConfig} = OptimismConfig
        const reserveAssets = await getParamPerNetwork(ReserveAssets, eOptimismNetwork.optimism);
        if(!reserveAssets){
            throw "reserveAssets not defined"
        }
        const addProv = await contractGetters.getLendingPoolAddressesProvider();

        const oracleAdd = await addProv.connect(signer).getPriceOracle();



        const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi.abi);

        for(let [symbol, strat] of Object.entries(ReservesConfig)) {
            const currentAsset = reserveAssets[symbol];
            console.log("Pricing ",symbol)
            const price = await oracle.connect(signer).callStatic.getAssetPrice(currentAsset);
            console.log("Price: ", price)
            let expectedPrice;
            // skip curve tokens too cause we test that separately
            if(strat.assetType==0 || strat.assetType == 1 || strat.assetType == 2) {
                continue;
            }
            else if(strat.assetType==4) { //beefy
                const beefyVault = new DRE.ethers.Contract(currentAsset, beefyAbi)
                const pricePerUnderlying = await oracle.connect(signer).callStatic.getAssetPrice(beefyVault.connect(signer).want());
                const pricePerShare = await beefyVault.connect(signer).getPricePerFullShare();
                //decimals will be the decimals in chainlink aggregator (8 for USD, 18 for ETH)
                expectedPrice = Number(pricePerUnderlying) * Number(pricePerShare.toString()) / Math.pow(10,18); 
            }
            else if(strat.assetType==5) {
                const vel = new DRE.ethers.Contract(currentAsset, VeloAbi)

                const met = await vel.connect(signer).metadata();
                const dec = await vel.connect(signer).decimals();
                const totalSupply = await vel.connect(signer).totalSupply();
                // console.log("metadata: ", met);
                const factor1 = Math.pow(10,Number(dec))/ Number(met.dec0) 
                const factor2 = Math.pow(10,Number(dec)) / Number(met.dec1)
                const a = Math.sqrt(Number(met.r0) * Number(met.r1) * factor1 * factor2);
                console.log("a: ",a)
                const price0 = await oracle.connect(signer).callStatic.getAssetPrice(met.t0)
                const price1 = await oracle.connect(signer).callStatic.getAssetPrice(met.t1)
                const b = Math.sqrt(Number(price0) * Number(price1) )
                console.log("b: ",b)
                console.log("totalSupply: ", totalSupply)
                expectedPrice = 2 * a * b / Number(totalSupply);
            }
            else if(strat.assetType == 6) { //beethoven
                const beet = new DRE.ethers.Contract(currentAsset, BeethovenAbi);
                const rate = await beet.connect(signer).getRate()
                if(currentAsset == "0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2") {
                    const price0 = await oracle.connect(signer).callStatic.getAssetPrice("0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb")
                    const price1 = await oracle.connect(signer).callStatic.getAssetPrice("0x4200000000000000000000000000000000000006")
                    expectedPrice = 182078032735
                }
                if(currentAsset == "0x4Fd63966879300caFafBB35D157dC5229278Ed23") {
                  //rETH pool
                  expectedPrice = 182977401490 //should be around the same as wstETH
                }
            }
            else if(strat.assetType == 7) { //rETH
              expectedPrice = 193565765145
            }
            else {
                continue
            }
            console.log("Expected price: ", expectedPrice)
            const diff = Math.abs(expectedPrice-Number(price));
            const percentDiff = diff/expectedPrice
            console.log("percentDiff: ",percentDiff)
            expect(percentDiff).to.be.lte(1/1e8) // 8 most significant digits are accurate
            console.log("_____________________")
        }
    });
  
    }
)

