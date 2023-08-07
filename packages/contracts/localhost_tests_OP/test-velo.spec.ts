import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { eOptimismNetwork, IChainlinkInternal, ICommonConfiguration, ProtocolErrors, tEthereumAddress } from '../helpers/types';
import {getCurvePrice} from "./helpers/curve-calculation";
import {UserAccountData} from "./interfaces/index";
import {almostEqualOrEqual} from "./helpers/almostEqual";
import {calculateExpectedInterest, calculateUserStake, calculateAdminInterest} from "./helpers/strategy-interest";

import OptimismConfig from "../markets/optimism";
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { getPairsTokenAggregator } from "../helpers/contracts-getters";
import { setBalance } from "./helpers/mint-tokens";
import { MAX_UINT_AMOUNT } from "../helpers/constants";
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

makeSuite(
    "general oracle test ",
    () => {
    const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
    const fs = require('fs');
    const contractGetters = require('../helpers/contracts-getters.ts');
    // const lendingPool = await contractGetters.getLendingPool();
    // Load the first signer

  const VELO_ROUTER_ADDRESS = "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858"
  const VELO_ROUTER_ABI = fs.readFileSync("./localhost_tests_OP/abis/velo_v2.json").toString()
  const BALANCER_POOL_ABI = fs.readFileSync("./localhost_tests_OP/abis/balancer_pool.json").toString()
  const BALANCER_VAULT_ADDRESS = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  const BALANCER_VAULT_ABI = fs.readFileSync("./localhost_tests_OP/abis/balancer_vault.json").toString()

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
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    it("test velo pricing", async () => {
        var signer = await contractGetters.getFirstSigner();
        const addProv = await contractGetters.getLendingPoolAddressesProvider();
 
        const oracleAdd = await addProv.connect(signer).getPriceOracle();
        const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi.abi);
       let expectedPrice;
       
        const vel = new DRE.ethers.Contract("0x0D0F65C63E379263f7CE2713dd012180681D0dc5", VeloAbi)

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
                k = a * b 
                expectedPriceLocal = 2 * a * b / Number(totalSupply);
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
            // const diff = Math.abs(expectedPriceLocal-Number(price));
            // const percentDiff = diff/expectedPriceLocal
            // console.log("percentDiff math: ",percentDiff)
            // expect(percentDiff).to.be.lte(1e-5) // 8 most significant digits are accurate
            return [expectedPriceLocal, k]
        }
        let beginningK;
        [expectedPrice, beginningK] = await checkExpectedPrice(met)
        

        var route: Route[] = [{
            from: met.t0, 
            to: met.t1, 
            stable: met.st, 
            factory: "0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a"
        }];
        // try swapping. Should not change the price
        const VELO_ROUTER_CONTRACT = new DRE.ethers.Contract(VELO_ROUTER_ADDRESS, VELO_ROUTER_ABI)

        console.log("try swapping ", met.t0)

        console.log("_________******____________")
        for(let j= 1;j<= 10;++j){ //try multiple values
            let amtSwap = (1000*5**j)
            if(price0.lt(ethers.utils.parseUnits("1000", 8))){
                amtSwap *=1000
            }
            if(amtSwap*Number(price0)/1e8 > 1e9) { //if we are swapping less than a billion of value
                break
            }
            const amt0 = DRE.ethers.utils.parseUnits((amtSwap).toString(), await token0.connect(signer).decimals())
            console.log("amount to swap: ", amtSwap)
            await setBalance(met.t0, signer, amt0)
            try{
                await expect(VELO_ROUTER_CONTRACT.connect(signer).swapExactTokensForTokens(amt0, "0", route, signer.address, deadline))
                .to.be.reverted;

                break
            } catch {

            }

            met = await vel.connect(signer).metadata();
            let currentMathPrice, newK;
            [currentMathPrice, newK] = await checkExpectedPrice(met);
            const diffK = Math.abs(Number(newK) - Number(beginningK))/Number(beginningK)
            console.log("percent diff in K: ", diffK)

            console.log("_____________________")
        }
        console.log("try swapping ", met.t1)
        route = [{
        from: met.t1, 
        to: met.t0, 
        stable: met.st, 
        factory: "0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a"
        }];


        console.log("_________******____________")
        for(let j= 1;j<=10;++j){ //try multiple values
            let amtSwap = (1000*5**j)
            if(price1.lt(ethers.utils.parseUnits("1000", 8))){
                amtSwap *=1000
            }

            if(amtSwap*Number(price1)/1e8 > 1e9) { //if we are swapping less than a billion of value
                break
            }
            let amt1 = DRE.ethers.utils.parseUnits(amtSwap.toString(), await token1.connect(signer).decimals())
            await setBalance(met.t1, signer, amt1)
            console.log("amount to swap: ", amtSwap)
            try {
                await expect(VELO_ROUTER_CONTRACT.connect(signer).swapExactTokensForTokens(amt1, "0", route, signer.address, deadline)
                ).to.be.reverted;

                break
            } catch {

            }

            met = await vel.connect(signer).metadata();
            let currentMathPrice, newK;
            [currentMathPrice, newK] = await checkExpectedPrice(met);

            const diffK = Math.abs(Number(newK) - Number(beginningK))/Number(beginningK)
            console.log("percent diff in K: ", diffK)

            console.log("_____________________")
        }
    
    });
    }
)

