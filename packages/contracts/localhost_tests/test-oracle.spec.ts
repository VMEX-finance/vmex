import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { eNetwork, IChainlinkInternal, ICommonConfiguration, ProtocolErrors, tEthereumAddress } from '../helpers/types';
import {UserAccountData} from "../localhost_tests_utils/interfaces/index";
import {almostEqualOrEqual} from "../localhost_tests_utils/helpers/almostEqual";

import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { setBalance } from "../localhost_tests_utils/helpers/mint-tokens";
import { MAX_UINT_AMOUNT } from "../helpers/constants";
import { ConfigNames, loadPoolConfig } from "../helpers/configuration";
const oracleAbi = require("../artifacts/contracts/protocol/oracles/VMEXOracle.sol/VMEXOracle.json")
const camelotAbi = require("../artifacts/contracts/interfaces/ICamelotPair.sol/ICamelotPair.json")

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

interface Route {
  from: tEthereumAddress;
  to: tEthereumAddress;
  stable: boolean;
  factory: tEthereumAddress;
}
interface SingleSwap {
   poolId;
   kind;
   assetIn;
   assetOut;
   amount;
   userData;
}

interface FundManagement {
  sender;
  fromInternalBalance;
  recipient;
  toInternalBalance;
}

const network = process.env.FORK
if(!network) throw "No fork"
const poolConfig = loadPoolConfig(network as ConfigNames);

makeSuite(
    "general oracle test ",
    () => {

    const testSwapping = false;


    const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
    const fs = require('fs');
    const contractGetters = require('../helpers/contracts-getters.ts');
    // const lendingPool = await contractGetters.getLendingPool();
    // Load the first signer

  const VELO_ROUTER_ADDRESS = "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858"
  const VELO_ROUTER_ABI = fs.readFileSync("./localhost_tests_utils/abis/velo_v2.json").toString()
  const BALANCER_POOL_ABI = fs.readFileSync("./localhost_tests_utils/abis/balancer_pool.json").toString()
  const BALANCER_VAULT_ADDRESS = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  const BALANCER_VAULT_ABI = fs.readFileSync("./localhost_tests_utils/abis/balancer_vault.json").toString()

     const VeloAbi = [
        "function allowance(address owner, address spender) external view returns (uint256 remaining)",
        "function approve(address spender, uint256 value) external returns (bool success)",
        "function balanceOf(address owner) external view returns (uint256 balance)", "function decimals() external view returns (uint8 decimalPlaces)",
        "function name() external view returns (string memory tokenName)",
        "function symbol() external view returns (string memory tokenSymbol)",
        "function totalSupply() external view returns (uint256 totalTokensIssued)",
        "function transfer(address to, uint256 value) external returns (bool success)",
        "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
        "function tokens() external returns (address, address)",
        "function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external",
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
    const ERC20abi = [
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
  
  var deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  const testLTVs = {
    '0x4200000000000000000000000000000000000006': 0.8, //weth
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607': 0.8, //usdc
    '0x4200000000000000000000000000000000000042': 0.3, //OP
    '0xc40F949F8a4e094D1b49a23ea9241D289B7b2819': 0.6 //LUSD
  }

    it("test pricing", async () => {
      const tokens = await getParamPerNetwork(poolConfig.ReserveAssets, network as eNetwork);
       var signer = await contractGetters.getFirstSigner();
       const {ReserveAssets, ReservesConfig} = poolConfig
       const reserveAssets = await getParamPerNetwork(ReserveAssets, network as eNetwork);
       if(!reserveAssets){
           throw "reserveAssets not defined"
       }
       const addProv = await contractGetters.getLendingPoolAddressesProvider();

       const oracleAdd = await addProv.connect(signer).getPriceOracle();


       const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi.abi);

       for(let [symbol, strat] of Object.entries(ReservesConfig)) {
           const currentAsset = reserveAssets[symbol];
           console.log("currentAsset: ", currentAsset)
           if(!currentAsset) continue;
           console.log("Pricing ",symbol)
           const price = await oracle.connect(signer).callStatic.getAssetPrice(currentAsset);
           console.log("Price: ", price)
           let expectedPrice;
           // skip curve tokens too cause we test that separately
          //  if(symbol!="velo_USDTUSDC") continue;
          //  if( strat.assetType != 5) continue;

           if(strat.assetType==0) {
               continue;
           }
           else if(strat.assetType == 1) {
            if(currentAsset == "0x061b87122Ed14b9526A813209C8a59a633257bAb"){ 
              expectedPrice = "101555626"
            }
            if(currentAsset == "0xEfDE221f306152971D8e9f181bFe998447975810"){ 
              expectedPrice = "193750835389"
            }
            if(currentAsset =="0x7f90122BF0700F9E7e1F688fe926940E8839F353") expectedPrice="101417786"
            if(currentAsset =="0xDbcD16e622c95AcB2650b38eC799f76BFC557a0b") expectedPrice="172134021460"
            if(currentAsset =="0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5") expectedPrice="100972742"
            if(currentAsset == "0x1337BedC9D22ecbe766dF105c9623922A27963EC") expectedPrice="101870436"
           }
           else if(strat.assetType == 2) {
            if(currentAsset == "0x98244d93d42b42ab3e3a4d12a5dc0b3e7f8f32f9") expectedPrice="414221316402"
           }
           else if(strat.assetType==3) { //yearn
             const yVault = new DRE.ethers.Contract(currentAsset, yvAbi)
             const pricePerUnderlying = await oracle.connect(signer).callStatic.getAssetPrice(yVault.connect(signer).token());
             const pricePerShare = await yVault.connect(signer).pricePerShare();
             //decimals will be the decimals in chainlink aggregator (8 for USD, 18 for ETH)
             expectedPrice = Number(pricePerUnderlying) * Number(pricePerShare.toString()) / Math.pow(10,Number(await yVault.connect(signer).decimals())); 
         }
           else if(strat.assetType==4) { //beefy
               const beefyVault = new DRE.ethers.Contract(currentAsset, beefyAbi)
               const pricePerUnderlying = await oracle.connect(signer).callStatic.getAssetPrice(beefyVault.connect(signer).want());
               const pricePerShare = await beefyVault.connect(signer).getPricePerFullShare();
               //decimals will be the decimals in chainlink aggregator (8 for USD, 18 for ETH)
               expectedPrice = Number(pricePerUnderlying) * Number(pricePerShare.toString()) / Math.pow(10,18); 
           }
           else if(strat.assetType==5) { //velodrome
               const vel = new DRE.ethers.Contract(currentAsset, VeloAbi)

               let met = await vel.connect(signer).metadata();
               const dec = await vel.connect(signer).decimals();
               const totalSupply = await vel.connect(signer).totalSupply();
               // console.log("metadata: ", met);
              const price0 = await oracle.connect(signer).callStatic.getAssetPrice(met.t0)
              const price1 = await oracle.connect(signer).callStatic.getAssetPrice(met.t1)
              console.log("price0: ",price0)
              console.log("price1: ",price1)

              const token0 = new DRE.ethers.Contract(met.t0, ERC20abi)
              const token1 = new DRE.ethers.Contract(met.t1, ERC20abi)
              const factor1 = Math.pow(10,Number(dec))/ Number(met.dec0) 
              const factor2 = Math.pow(10,Number(dec)) / Number(met.dec1) //convert to same num decimals as total supply
              const tvl = (Number(met.r0) * factor1 * Number(price0) + Number(met.r1) * factor2 * Number(price1))
              const tvlReadable = tvl/Number(ethers.utils.parseUnits("1",18+8))
              console.log("TVL in USD: ", tvlReadable)
              expect(tvlReadable).gte(50000) //make sure tvl is greater than 50k
              let naivePrice = Math.round(tvl / Number(totalSupply));

              let percentDiff = Math.abs(Number(naivePrice) - Number(price))/Number(price)
              console.log("Naive pricing: ", naivePrice)
              console.log("percent diff: ",percentDiff)
              expect(percentDiff).lte(1e-4, "velo token price not consistent with naive pricing (mainly decimals issue)");
              expect((Number(price)-naivePrice)/naivePrice).lte(1e-4, "naive price should always be higher than fair reserves price");

              await token0.connect(signer).approve(VELO_ROUTER_ADDRESS, MAX_UINT_AMOUNT)
              await token1.connect(signer).approve(VELO_ROUTER_ADDRESS, MAX_UINT_AMOUNT)
              const checkExpectedPrice = async(met): Promise<[Number,Number]> =>{
                console.log('metadata: ', met)
                const totalSupply = await vel.connect(signer).totalSupply();
                console.log("totalSupply: ", totalSupply)
                let expectedPriceLocal = 0;
                let k = 0;
                if(met.st==false) {
                  console.log("volatile")
                  const a = Math.sqrt(Number(met.r0) * Number(met.r1) * factor1 * factor2);
                  // console.log("a: ",a)
                  const b = Math.sqrt(Number(price0) * Number(price1) )
                  // console.log("b: ",b)
                  // console.log("totalSupply: ", totalSupply)
                  k = Number(met.r0) * Number(met.r1) * factor1 * factor2
                  expectedPriceLocal = 2 * a * b / Number(totalSupply);

                  
                  const LPvalue = 2* Math.sqrt(k/1e36 * testLTVs[met.t0]/testLTVs[met.t1]) * b/1e8
                  const holdValue = (Number(met.r0)/ Number(met.dec0) *Number(price0)/1e8 *testLTVs[met.t0] + Number(met.r1)/ Number(met.dec1) *Number(price1)/1e8 /testLTVs[met.t1])
                  const impermanentLoss =  LPvalue/ holdValue 
                    
                  console.log("LPvalue: ",LPvalue)
                  console.log("holdValue: ",holdValue)
                  
                  console.log("impermanentLoss: ",impermanentLoss)
                 }
                 else { //stable
                  console.log("stable")
                    let r0 = Number(met[2]) * 1e18 / Number(met[0]); 
                    let r1 = Number(met[3]) * 1e18 / Number(met[1]); 
                    let p0 = price0; 
                    let p1 = price1; 
                    
                    k = ((r0 ** 3) * r1) + ((r1 ** 3) * r0); 
                    let fair = (k * (p0 ** 3) * (p1 ** 3)) / ((p0 ** 2) + (p1 ** 2));
                    expectedPriceLocal = 2 * Math.pow(fair, 1/4) / totalSupply; 
                    // console.log("exepected price", price / 1e18); 
                 }
                 console.log("Expected price: ", expectedPriceLocal)
                 console.log("K: ",k/1e36)

                  // const diff = Math.abs(expectedPriceLocal-Number(price));
                  // const percentDiff = diff/expectedPriceLocal
                  // console.log("percentDiff math: ",percentDiff)
                  // expect(percentDiff).to.be.lte(1e-5) // 8 most significant digits are accurate
                 return [expectedPriceLocal, k]
              }
              let beginningK;
              [expectedPrice, beginningK] = await checkExpectedPrice(met)
               

           }
           else if(strat.assetType == 6) { //beethoven
               const beet = new DRE.ethers.Contract(currentAsset, BeethovenAbi);
               const rate = await beet.connect(signer).getRate()
               if(currentAsset == "0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2") {
                   const price0 = await oracle.connect(signer).callStatic.getAssetPrice("0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb")
                   const price1 = await oracle.connect(signer).callStatic.getAssetPrice("0x4200000000000000000000000000000000000006")
                   expectedPrice = 187822760000
               }
               if(currentAsset == "0x4Fd63966879300caFafBB35D157dC5229278Ed23") {
                 //rETH pool
                 expectedPrice = 187822760000 //should be around the same as wstETH
               }
               if(currentAsset == "0x39965c9dAb5448482Cf7e002F583c812Ceb53046") {
                expectedPrice = 2363882259;
               }
               if(currentAsset == "0xFb4C2E6E6e27B5b4a07a36360C89EDE29bB3c9B6") {
                expectedPrice = 201980122461;
               }
               if(currentAsset == "0xC771c1a5905420DAEc317b154EB13e4198BA97D0") {
                expectedPrice = 202544254059;
               }
           }
           else if(strat.assetType == 7) { //rETH
             expectedPrice = 202185432577
           } else if(strat.assetType == 9) { //camelot
              const cam = new DRE.ethers.Contract(currentAsset, camelotAbi.abi)

              const met = await cam.connect(signer).getReserves()
               const dec = 18;
               const totalSupply = await cam.connect(signer).totalSupply();
              const token0 = await cam.connect(signer).token0()
              const token1 = await cam.connect(signer).token1()
              const price0 = await oracle.connect(signer).callStatic.getAssetPrice(token0)
              const price1 = await oracle.connect(signer).callStatic.getAssetPrice(token1)
              console.log("price0: ",price0)
              console.log("price1: ",price1)

              const factor1 = Math.pow(10,Number(dec))/ Number(await cam.connect(signer).precisionMultiplier0()) 
              const factor2 = Math.pow(10,Number(dec)) / Number(await cam.connect(signer).precisionMultiplier1()) //convert to same num decimals as total supply
              console.log("factor1: ",factor1)
              console.log("factor2: ",factor2)
              const tvl = (Number(met.reserve0) * factor1 * Number(price0) + Number(met.reserve1) * factor2 * Number(price1))
              const tvlReadable = tvl/Number(ethers.utils.parseUnits("1",18+8))
              console.log("TVL in USD: ", tvlReadable)
              expect(tvlReadable).gte(100000) //make sure tvl is greater than 100k
              let naivePrice = Math.round(tvl / Number(totalSupply));

              let percentDiff = Math.abs(Number(naivePrice) - Number(price))/Number(price)
              console.log("Naive pricing: ", naivePrice)
              console.log("percent diff: ",percentDiff)
              expect(percentDiff).lte(2e-2, "camelot token price not consistent with naive pricing (mainly decimals issue)");
              expect((Number(price)-naivePrice)/naivePrice).lte(2e-2, "naive price should always be higher than fair reserves price");
              continue
           }
           else {
               continue
           }
           console.log("Expected price: ", expectedPrice)
           const diff = Math.abs(expectedPrice-Number(price));
           const percentDiff = diff/expectedPrice
           console.log("percentDiff: ",percentDiff)
           expect(percentDiff).to.be.lte(1/1e2) // 99% accurate
           console.log("_____________________")
           console.log("*********************")
           console.log("_____________________")
       }

    });
    }
)

