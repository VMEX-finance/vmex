import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../helpers/misc-utils";

import { BeethovenMetadata, eContractid, eNetwork, eOptimismNetwork, iAssetsWithoutUSD, IBeethovenMetadata, IChainlinkInternal, ICommonConfiguration, iMultiPoolsAssets, iOptimismPoolAssets, IReserveParams, ProtocolErrors, tEthereumAddress } from '../helpers/types';
import {UserAccountData} from "../localhost_tests_utils/interfaces/index";
import {almostEqualOrEqual} from "../localhost_tests_utils/helpers/almostEqual";
import { getParamPerNetwork } from "../helpers/contracts-helpers";
import { setBalance } from "../localhost_tests_utils/helpers/mint-tokens";
import { MAX_UINT_AMOUNT } from "../helpers/constants";
import { ConfigNames, loadPoolConfig } from "../helpers/configuration";
import { initAssetData } from "../helpers/init-helpers"
import { rateStrategyUnborrowable } from "../markets/optimism/rateStrategies";
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
    "testing balancer oracle against attacks on invariant curve",
    () => {
    const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;
    const fs = require('fs');
    const contractGetters = require('../helpers/contracts-getters.ts');
    // const lendingPool = await contractGetters.getLendingPool();
    // Load the first signer

  const BALANCER_POOL_ABI = fs.readFileSync("./localhost_tests_utils/abis/balancer_pool.json").toString()
  const BALANCER_VAULT_ADDRESS = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  const BALANCER_VAULT_ABI = fs.readFileSync("./localhost_tests_utils/abis/balancer_vault.json").toString()

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
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    it("add weth op usdc metadata and allow (on optimism)", async () => {
      type iTestingPoolAssets<T> = Partial<
      Pick<
        iAssetsWithoutUSD<T>,
        | "WETH-OP-USDC-BPT"
      >
    >;
      const strategyNewBal: IReserveParams = {
        strategy: rateStrategyUnborrowable,
        baseLTVAsCollateral: '650000000000000000',
        liquidationThreshold: '700000000000000000',
        liquidationBonus: '1100000000000000000',
        borrowingEnabled: false,
        reserveDecimals: '18',
        aTokenImpl: eContractid.AToken,
        assetType: 6, // beethoven
        supplyCap: '100',
        borrowCap: '0',
        borrowFactor: '1000000000000000000',
        reserveFactor: '150000000000000000',  
      };
      const newReserveAsset:iTestingPoolAssets<IReserveParams> = {
        "WETH-OP-USDC-BPT": strategyNewBal
      }
      const tokenAddress: { [symbol: string]: tEthereumAddress } = {
        "WETH-OP-USDC-BPT": "0x39965c9dAb5448482Cf7e002F583c812Ceb53046"
      }
      const admin = await contractGetters.getFirstSigner();
      const balMetadata: iTestingPoolAssets<BeethovenMetadata> = {
        "WETH-OP-USDC-BPT": {
          _typeOfPool: "0",
          _legacy: true,
          _exists: true
        }
      }
      await initAssetData(newReserveAsset, tokenAddress, admin, false, undefined, balMetadata)
    });

    it("test balancer pricing", async () => {
        var signer = await contractGetters.getFirstSigner();
        const addProv = await contractGetters.getLendingPoolAddressesProvider();
 
        const oracleAdd = await addProv.connect(signer).getPriceOracle();
        const oracle = new DRE.ethers.Contract(oracleAdd,oracleAbi.abi);

       const testTokens = ["0x39965c9dAb5448482Cf7e002F583c812Ceb53046"]
    //    const testTokens =  Object.values(reserveAssets);
       for(let i =0;i<testTokens.length;i++){
          const currentAsset = testTokens[i]
          const price = await oracle.connect(signer).callStatic.getAssetPrice(currentAsset);
           console.log("Price: ", price)
          const beet = new DRE.ethers.Contract(currentAsset, BeethovenAbi);

          const bal_pool = new DRE.ethers.Contract(currentAsset, BALANCER_POOL_ABI)
          const dec = await bal_pool.connect(signer).decimals();
          const bal_vault = new DRE.ethers.Contract(BALANCER_VAULT_ADDRESS, BALANCER_VAULT_ABI)
          const poolId = await bal_pool.connect(signer).getPoolId();

          let dat = await bal_vault.connect(signer).getPoolTokens(poolId);

          let naivePrice = 0;
          for(let i=0; i<dat.tokens.length; ++i) {
          const tokenAdd = dat.tokens[i];
          const tokenPrice = await oracle.connect(signer).callStatic.getAssetPrice(tokenAdd);
          const token = new DRE.ethers.Contract(tokenAdd, ERC20abi)
          const factor = Math.pow(10,Number(dec)-Number(await token.connect(signer).decimals())) 
          naivePrice += factor*Number(tokenPrice)*Number(dat.balances[i])
          }
          
          naivePrice = Math.round(naivePrice / await bal_pool.connect(signer).totalSupply());

        let percentDiff = Math.abs(Number(naivePrice) - Number(price))/Number(price)
        console.log("Naive pricing: ", naivePrice)
        console.log("percent diff: ",percentDiff)
        expect(percentDiff).lte(1e-2, "bal token price not consistent with naive pricing (mainly decimals issue)");
        expect((Number(price)-naivePrice)/naivePrice).lte(1e-4, "naive price should always be higher than fair reserves price");


          //give funds to user
          for(let i=0; i<dat.tokens.length; ++i) {
          const tokenAdd = dat.tokens[i];
          const tokenPrice = await oracle.connect(signer).callStatic.getAssetPrice(tokenAdd);
          const token = new DRE.ethers.Contract(tokenAdd, ERC20abi)
          await token.connect(signer).approve(BALANCER_VAULT_ADDRESS, MAX_UINT_AMOUNT)
          for(let j= 1;j<=100;++j){ //try multiple values
            let amt;
            if(tokenPrice.gte(ethers.utils.parseUnits("1000",8))){
              amt = DRE.ethers.utils.parseUnits((2**j).toString(), await token.connect(signer).decimals())
            } else {
              amt = DRE.ethers.utils.parseUnits((2**(j+10)).toString(), await token.connect(signer).decimals())
            }
            
            await setBalance(tokenAdd, signer, amt)
            const singleSwap: SingleSwap = {
              poolId: poolId,
              kind: 0, // GIVEN_IN
              assetIn: tokenAdd,
              assetOut: dat.tokens[(i+1)%dat.tokens.length],
              amount: amt,
              userData: []
            };
            const funds: FundManagement = {
              sender: signer.address,
              fromInternalBalance: true,
              recipient: signer.address,
              toInternalBalance: true
            };
            console.log("Try beethoven swapping ",amt)
            let successfulSwap = true;
            try{
              await expect(bal_vault.connect(signer).swap(singleSwap, funds, 0, deadline)).to.be.reverted;
              console.log("too much to swap, exiting")
              successfulSwap = false;
            } catch {
              // await bal_vault.connect(signer).swap(singleSwap, funds, 0, deadline)
            }

            try{
              await expect(oracle.connect(signer).callStatic.getAssetPrice(currentAsset)).to.be.reverted;
              console.log("too much to swap, exiting")
              successfulSwap = false;
            } catch {
              // await bal_vault.connect(signer).swap(singleSwap, funds, 0, deadline)
            }
            console.log("successfulSwap: ",successfulSwap)

            if(!successfulSwap) break;

            // await bal_vault.connect(signer).swap(singleSwap, funds, 0, deadline)

            const manipPrice = await oracle.connect(signer).callStatic.getAssetPrice(currentAsset);
            let percentDiffPrice = Math.abs(Number(manipPrice) - Number(price))/Number(price)
            console.log(`manip price swapping in ${tokenAdd}: `, manipPrice)

            dat = await bal_vault.connect(signer).getPoolTokens(poolId);
            naivePrice = 0;
            for(let i=0; i<dat.tokens.length; ++i) {
              const tokenAdd = dat.tokens[i];
              const tokenPrice = await oracle.connect(signer).callStatic.getAssetPrice(tokenAdd);
              const token = new DRE.ethers.Contract(tokenAdd, ERC20abi)
              const factor = Math.pow(10,Number(dec)-Number(await token.connect(signer).decimals())) 
              naivePrice += factor*Number(tokenPrice)*Number(dat.balances[i])
            }
            
            naivePrice = Math.round(naivePrice / await bal_pool.connect(signer).totalSupply());

            let percentDiff = Math.abs(Number(naivePrice) - Number(price))/Number(price)
            console.log("Naive pricing after swap: ", naivePrice)
            
            // expect(percentDiffPrice).lte(1e-4, "swapping induces beethoven price change")

            expect((Number(price)-naivePrice)/naivePrice).lte(0, "naive price should always be higher than fair reserves price");
          }
          }
          //swap
        }
    });
    }
)

