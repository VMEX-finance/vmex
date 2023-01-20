import { ethers } from "ethers";
const chai = require("chai");
const { expect } = chai;
import { makeSuite } from "../../test-suites/test-aave/helpers/make-suite";
import { DRE } from "../../helpers/misc-utils";

import { BigNumber, utils } from "ethers";
import { ProtocolErrors } from '../../helpers/types';
import {getCurvePrice} from "../helpers/curve-calculation";
import {UserAccountData} from "../interfaces/index";
import {almostEqualOrEqual} from "../helpers/almostEqual";
import {calculateExpectedInterest, calculateUserStake, calculateAdminInterest} from "../helpers/strategy-interest";
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
    "CVX strategy ",
    () => {
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

        const CVXadd = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B"
        const CVX_ABI = fs.readFileSync("./localhost_tests/abis/DAI_ABI.json").toString()


        // const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
        // const UNISWAP_ROUTER_ABI = fs.readFileSync("./localhost_tests/abis/uniswapAbi.json").toString()

        const CVX_SWAP = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
        var CVX_SWAP_ABI = [{"name":"TokenExchange","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"uint256","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"uint256","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"AddLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[2]","indexed":false},{"name":"fee","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[2]","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityOne","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amount","type":"uint256","indexed":false},{"name":"coin_index","type":"uint256","indexed":false},{"name":"coin_amount","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"CommitNewAdmin","inputs":[{"name":"deadline","type":"uint256","indexed":true},{"name":"admin","type":"address","indexed":true}],"anonymous":false,"type":"event"},{"name":"NewAdmin","inputs":[{"name":"admin","type":"address","indexed":true}],"anonymous":false,"type":"event"},{"name":"CommitNewParameters","inputs":[{"name":"deadline","type":"uint256","indexed":true},{"name":"admin_fee","type":"uint256","indexed":false},{"name":"mid_fee","type":"uint256","indexed":false},{"name":"out_fee","type":"uint256","indexed":false},{"name":"fee_gamma","type":"uint256","indexed":false},{"name":"allowed_extra_profit","type":"uint256","indexed":false},{"name":"adjustment_step","type":"uint256","indexed":false},{"name":"ma_half_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"NewParameters","inputs":[{"name":"admin_fee","type":"uint256","indexed":false},{"name":"mid_fee","type":"uint256","indexed":false},{"name":"out_fee","type":"uint256","indexed":false},{"name":"fee_gamma","type":"uint256","indexed":false},{"name":"allowed_extra_profit","type":"uint256","indexed":false},{"name":"adjustment_step","type":"uint256","indexed":false},{"name":"ma_half_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RampAgamma","inputs":[{"name":"initial_A","type":"uint256","indexed":false},{"name":"future_A","type":"uint256","indexed":false},{"name":"initial_gamma","type":"uint256","indexed":false},{"name":"future_gamma","type":"uint256","indexed":false},{"name":"initial_time","type":"uint256","indexed":false},{"name":"future_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"StopRampA","inputs":[{"name":"current_A","type":"uint256","indexed":false},{"name":"current_gamma","type":"uint256","indexed":false},{"name":"time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"ClaimAdminFee","inputs":[{"name":"admin","type":"address","indexed":true},{"name":"tokens","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"owner","type":"address"},{"name":"admin_fee_receiver","type":"address"},{"name":"A","type":"uint256"},{"name":"gamma","type":"uint256"},{"name":"mid_fee","type":"uint256"},{"name":"out_fee","type":"uint256"},{"name":"allowed_extra_profit","type":"uint256"},{"name":"fee_gamma","type":"uint256"},{"name":"adjustment_step","type":"uint256"},{"name":"admin_fee","type":"uint256"},{"name":"ma_half_time","type":"uint256"},{"name":"initial_price","type":"uint256"},{"name":"_token","type":"address"},{"name":"_coins","type":"address[2]"}],"outputs":[]},{"stateMutability":"payable","type":"fallback"},{"stateMutability":"view","type":"function","name":"token","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"coins","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"gamma","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_virtual_price","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"payable","type":"function","name":"exchange","inputs":[{"name":"i","type":"uint256"},{"name":"j","type":"uint256"},{"name":"dx","type":"uint256"},{"name":"min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"payable","type":"function","name":"exchange","inputs":[{"name":"i","type":"uint256"},{"name":"j","type":"uint256"},{"name":"dx","type":"uint256"},{"name":"min_dy","type":"uint256"},{"name":"use_eth","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"payable","type":"function","name":"exchange_underlying","inputs":[{"name":"i","type":"uint256"},{"name":"j","type":"uint256"},{"name":"dx","type":"uint256"},{"name":"min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_dy","inputs":[{"name":"i","type":"uint256"},{"name":"j","type":"uint256"},{"name":"dx","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"payable","type":"function","name":"add_liquidity","inputs":[{"name":"amounts","type":"uint256[2]"},{"name":"min_mint_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"payable","type":"function","name":"add_liquidity","inputs":[{"name":"amounts","type":"uint256[2]"},{"name":"min_mint_amount","type":"uint256"},{"name":"use_eth","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_amount","type":"uint256"},{"name":"min_amounts","type":"uint256[2]"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_amount","type":"uint256"},{"name":"min_amounts","type":"uint256[2]"},{"name":"use_eth","type":"bool"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"calc_token_amount","inputs":[{"name":"amounts","type":"uint256[2]"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"calc_withdraw_one_coin","inputs":[{"name":"token_amount","type":"uint256"},{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"token_amount","type":"uint256"},{"name":"i","type":"uint256"},{"name":"min_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"token_amount","type":"uint256"},{"name":"i","type":"uint256"},{"name":"min_amount","type":"uint256"},{"name":"use_eth","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"claim_admin_fees","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"ramp_A_gamma","inputs":[{"name":"future_A","type":"uint256"},{"name":"future_gamma","type":"uint256"},{"name":"future_time","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"stop_ramp_A_gamma","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"commit_new_parameters","inputs":[{"name":"_new_mid_fee","type":"uint256"},{"name":"_new_out_fee","type":"uint256"},{"name":"_new_admin_fee","type":"uint256"},{"name":"_new_fee_gamma","type":"uint256"},{"name":"_new_allowed_extra_profit","type":"uint256"},{"name":"_new_adjustment_step","type":"uint256"},{"name":"_new_ma_half_time","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"apply_new_parameters","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"revert_new_parameters","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"commit_transfer_ownership","inputs":[{"name":"_owner","type":"address"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"apply_transfer_ownership","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"revert_transfer_ownership","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"kill_me","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"unkill_me","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_admin_fee_receiver","inputs":[{"name":"_admin_fee_receiver","type":"address"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"lp_price","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"price_scale","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"price_oracle","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"last_prices","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"last_prices_timestamp","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A_gamma","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A_gamma","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A_gamma_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A_gamma_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"allowed_extra_profit","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_allowed_extra_profit","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"fee_gamma","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_fee_gamma","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"adjustment_step","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_adjustment_step","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ma_half_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_ma_half_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"mid_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"out_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_mid_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_out_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_admin_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"balances","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"D","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"future_owner","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"xcp_profit","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"xcp_profit_a","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"virtual_price","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"is_killed","inputs":[],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"kill_deadline","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"transfer_ownership_deadline","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_actions_deadline","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_fee_receiver","inputs":[],"outputs":[{"name":"","type":"address"}]}]



          it("give WETH to users", async () => {
            const lendingPool = await contractGetters.getLendingPool();
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            var signer = await contractGetters.getFirstSigner();
            //give signer 1 WETH so he can get LP tokens
            var options = {value: DRE.ethers.utils.parseEther("1.0")}
            await myWETH.connect(signer).deposit(options);
            var signerWeth = await myWETH.connect(signer).balanceOf(signer.address);
            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1.0"), "Did not get WETH");

            await myWETH.connect(signer).approve(lendingPool.address,DRE.ethers.utils.parseEther("100.0"))

          });

          it("deposit WETH", async () => {
            //emergency deposits 100 WETH to pool to provide liquidity
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const emergency = (await DRE.ethers.getSigners())[1]
            var signer = await contractGetters.getFirstSigner();
            const lendingPool = await contractGetters.getLendingPool();

            const dataProv = await contractGetters.getAaveProtocolDataProvider();

            var options = {value: DRE.ethers.utils.parseEther("100.0")}

            await myWETH.connect(emergency).deposit(options);
            var signerWeth = await myWETH.connect(emergency).balanceOf(emergency.address);

            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("100.0"), "Did not get WETH");

            await myWETH.connect(emergency).approve(lendingPool.address,DRE.ethers.utils.parseEther("100.0"))

            await lendingPool.connect(emergency).deposit(myWETH.address, 1, DRE.ethers.utils.parseUnits('100'), await emergency.getAddress(), '0');
            const resDat = await dataProv.getReserveData(myWETH.address, 1)


            expect(
              resDat.availableLiquidity.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("100.0"), "Did not get WETH");
          });

          it("Swap ETH for CVX on curve fi", async () => {
            const DAI = new DRE.ethers.Contract(CVXadd,CVX_ABI)
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const emergency = (await DRE.ethers.getSigners())[1]
            var signer = await contractGetters.getFirstSigner();

            const CURVE_CONTRACT = new ethers.Contract(CVX_SWAP, CVX_SWAP_ABI)


            const path = [myWETH.address, DAI.address];
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

            //emergency deposits 100 WETH to pool to provide liquidity
            var options = {value: ethers.utils.parseEther("1000.0")}

            await CURVE_CONTRACT.connect(signer).exchange_underlying(0,1,ethers.utils.parseEther("1000.0"),ethers.utils.parseEther("1000.0"),options)

            var signerDAI = await DAI.connect(signer).balanceOf(signer.address)

            expect(
                signerDAI.toString()
            ).to.not.be.bignumber.equal(0, "Did not get DAI");
          });

          it("deposit LP and borrow", async () => {
            //emergency deposits 100 WETH to pool to provide liquidity
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)
            const emergency = (await DRE.ethers.getSigners())[1]
            var signer = await contractGetters.getFirstSigner();
            const lendingPool = await contractGetters.getLendingPool();
            const DAI = new DRE.ethers.Contract(CVXadd,CVX_ABI)

            const dataProv = await contractGetters.getAaveProtocolDataProvider();

            await DAI.connect(signer).approve(lendingPool.address,ethers.utils.parseEther("100000.0"))
            await lendingPool.connect(signer).deposit(DAI.address, 1, DRE.ethers.utils.parseUnits('1000'), await signer.getAddress(), '0');
            await lendingPool.connect(signer).deposit(DAI.address, 1, DRE.ethers.utils.parseUnits('500'), await emergency.getAddress(), '0');

            await lendingPool.connect(signer).setUserUseReserveAsCollateral(DAI.address, 1, true);

            var userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)

            const addProv = await contractGetters.getLendingPoolAddressesProvider();

            const curveOracleAdd = await addProv.connect(signer).getPriceOracle();
            var curveOracleAbi = [
                "function getAssetPrice(address asset) public view returns (uint256)"
            ]

            const curveOracle = new DRE.ethers.Contract(curveOracleAdd,curveOracleAbi);

            const pricePerToken = await curveOracle.connect(signer).getAssetPrice(DAI.address);
            console.log("pricePerToken: ",pricePerToken)
            var col = BigNumber.from(pricePerToken.toString()).mul(1000)
            expect(
              userDat.totalCollateralETH.toString()
            ).to.be.bignumber.equal(col.toString(), "Did not deposit 3crv");

            await lendingPool.connect(signer).borrow(myWETH.address, 
              1, 
              DRE.ethers.utils.parseEther("0.01"), 
              '0', 
              signer.address);

            userDat = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)

            expect(
              userDat.totalDebtETH.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0.01"), "Did not get debt token");


            var signerWeth = await myWETH.connect(signer).balanceOf(signer.address);

            expect(
              signerWeth.toString()
            ).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1.01"), "Did not get WETH");

            await expect(
                lendingPool.connect(signer).borrow(myWETH.address, 1, DRE.ethers.utils.parseEther("500"), '0', signer.address)
              ).to.be.revertedWith(VL_COLLATERAL_CANNOT_COVER_NEW_BORROW);
          });

          it("strategy pulls LP and invests", async () => {
            const lendingPool = await contractGetters.getLendingPool();
            
            const signer = await contractGetters.getFirstSigner();
            const emergencyAdmin = (await DRE.ethers.getSigners())[1]
            var CurveToken = new DRE.ethers.Contract(CVXadd,CVX_ABI)
            const dataProv = await contractGetters.getAaveProtocolDataProvider();
  
            const userReserveData = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
  
            var userDatBefore:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)
            const tricrypto2Tranch1ATokenAddress =
              (await lendingPool.getReserveData(CurveToken.address, 1)).aTokenAddress;
            // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2
  
            const tricrypto2Tranch1AToken =
              await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);
  
            const aTokenBalance = await tricrypto2Tranch1AToken.totalSupply();
            console.log("tricrypto2 atoken total supply: ", aTokenBalance);
  
            const strategy = await contractGetters.getCrvLpStrategy(tricrypto2Tranch1AToken.getStrategy()); //get specific implementation of the strategy
  
            const vTokenAddress = await strategy.connect(signer).vToken(); //this should be the same as tricrypto2Tranch1AToken
            console.log("vtoken address: ", vTokenAddress);
  
            expect(tricrypto2Tranch1ATokenAddress).to.be.equal(vTokenAddress, "tricrypto strategy doesn't have correct aToken address");
  
            const underlying = await strategy.connect(signer).underlying();
            console.log("underlying address: ", underlying);
  
            var CurveToken2 = new DRE.ethers.Contract(underlying,CVX_ABI) //this is just the tricrypto token
            const aTokenHolds = await CurveToken2.connect(signer).balanceOf(vTokenAddress); //this is seeing how much tricrypto the vTokenAddress is holding
            console.log("atoken is holding : ", aTokenHolds);
  
            expect(aTokenHolds.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1500"), "Did not deposit tricypto2")
  
            const amount = await strategy.connect(signer).pull();
  
            const aTokenHoldsAfter = await CurveToken.connect(signer).balanceOf(tricrypto2Tranch1ATokenAddress);
            const strategyHolds = await CurveToken.connect(signer).balanceOf(strategy.address);
            console.log("after atoken is holding : ", aTokenHoldsAfter, " after strategy: ", strategyHolds);
  
            expect(aTokenHoldsAfter.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0"), "Did not transfer tricypto2 to the booster")
            expect(strategyHolds.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("0"), "Did not transfer tricypto2 to the booster")
  
            var origBalance = await strategy.balanceOfPool();
  
            console.log("strategy boosted balance: " + origBalance);
  
            expect(origBalance.toString()).to.be.bignumber.equal(DRE.ethers.utils.parseEther("1500"), "Did not transfer tricypto2 to the booster")
  
            // check that the user is still healthy after strategy withdraws
            var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)
            console.log("USER DATA: ", userData);
  
            
            expect(userDatBefore.totalCollateralETH).to.be.almostEqualOrEqual(userData.totalCollateralETH);
          });
  
          it("strategy booster earns interest redeposits", async () => {
            const lendingPool = await contractGetters.getLendingPool();
            
            const signer = await contractGetters.getFirstSigner();
            const emergencyAdmin = (await DRE.ethers.getSigners())[1]
            const dataProv = await contractGetters.getAaveProtocolDataProvider();
            var CurveToken = new DRE.ethers.Contract(CVXadd,CVX_ABI)
  
            const tricrypto2Tranch1ATokenAddress =
              (await lendingPool.getReserveData(CurveToken.address, 1)).aTokenAddress;
            // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2
  
            const tricrypto2Tranch1AToken =
              await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);
  
              const strategy = await contractGetters.getCrvLpStrategy(tricrypto2Tranch1AToken.getStrategy()); //get specific implementation of the strategy
              const reserveFactor = (await dataProv.getReserveConfigurationData(CurveToken.address, 1)).VMEXReserveFactor;
              for(let i = 0; i<2;i++){
                  var strategyStartBoostedBalance = await strategy.balanceOfPool();
                  console.log("strategy START boosted balance: " + strategyStartBoostedBalance);
                  // increase time by 24 hours
                  await DRE.ethers.provider.send("evm_increaseTime", [86400])
                  const aTokenBalance = await tricrypto2Tranch1AToken.totalSupply();
  
                  var userReserveDataSignerBefore = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
                  var userReserveDataEmergBefore = await dataProv.getUserReserveData(CurveToken.address, 1, emergencyAdmin.address);
                  var userReserveDataAdminBefore = await dataProv.getUserReserveData(CurveToken.address, 1, "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49");
  
                  var signerStake = calculateUserStake(userReserveDataSignerBefore.currentATokenBalance, aTokenBalance )
                  var emergStake = calculateUserStake(userReserveDataEmergBefore.currentATokenBalance, aTokenBalance )
                  var adminStake = calculateUserStake(userReserveDataAdminBefore.currentATokenBalance, aTokenBalance)
  
                  console.log("signerStake: ", signerStake)
                  // console.log("Amount earned: ",(await strategy.earned()))
                  await expect(strategy.tend(DRE.ethers.utils.parseEther("150000000"))).to.be.revertedWith("Strategy error: insufficient output")
                  try{
                      await strategy.tend(1); //this will update the interest rate
                  } catch {
                    i--;
                    continue;
                  }
                  // var rc = await tendData.wait();
                  // var event = rc.events.find(event => event.event === 'InterestRateUpdated');
                  // console.log("InterestRateUpdated data: ",event)
  
                  var strategyBoostedBalance = await strategy.balanceOfPool();
  
                  console.log("strategyBoostedBalance: ",strategyBoostedBalance)
  
                  expect(strategyBoostedBalance).to.be.not.bignumber.equal(BigNumber.from("0")); //note this might fail if we are using another block to fork.  1000297709364698937
  
                  
                  var userReserveDataSigner = await dataProv.getUserReserveData(CurveToken.address, 1, signer.address);
                  
                  console.log("signer userReserveData.currentATokenBalance: ",userReserveDataSigner.currentATokenBalance )
                  var actualSignerInterest = userReserveDataSigner.currentATokenBalance.sub(userReserveDataSignerBefore.currentATokenBalance);
                  var expectedSignerInterest = calculateExpectedInterest(strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor, signerStake);
                  expect(actualSignerInterest
                    .sub(expectedSignerInterest).toNumber())
                    .to.be.lessThan(10).and.greaterThan(-10);
                  
                  var actualSignerRate = actualSignerInterest.mul("1000000000000000000000000000").div(userReserveDataSignerBefore.currentATokenBalance).mul(365)
                  var expectedSignerRate = await strategy.getLatestRate();
                  console.log("actualSignerRate: ", actualSignerRate)
                  console.log("expectedSignerRate: ", expectedSignerRate)
                  if(i!=0){
                    expect(actualSignerRate.div("1000000000000000000000000")
                    .sub(expectedSignerRate.div("1000000000000000000000000")).toNumber())
                    .to.be.lessThan(10).and.greaterThan(-10);
                  }
                  
  
                  
                  var userReserveDataEmerg = await dataProv.getUserReserveData(CurveToken.address, 1, emergencyAdmin.address);
                  console.log("emergency userReserveData.currentATokenBalance: ",userReserveDataEmerg.currentATokenBalance )
                  var actualEmergInterest = userReserveDataEmerg.currentATokenBalance.sub(userReserveDataEmergBefore.currentATokenBalance);
                  var expectedEmergInterest = calculateExpectedInterest(strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor, emergStake);
                  expect(actualEmergInterest
                    .sub(expectedEmergInterest).toNumber())
                    .to.be.lessThan(10).and.greaterThan(-10);
  
  
                  var userReserveDataAdmin = await dataProv.getUserReserveData(CurveToken.address, 1, "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49");
                console.log("vmex admin userReserveData.currentATokenBalance: ",userReserveDataAdmin.currentATokenBalance )
                var actualAdminInterest = userReserveDataAdmin.currentATokenBalance.sub(userReserveDataAdminBefore.currentATokenBalance);
                var expectedAdminInterest = calculateExpectedInterest(strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor, adminStake)
                  .add(calculateAdminInterest(strategyBoostedBalance, strategyStartBoostedBalance, reserveFactor));
                expect(
                  (actualAdminInterest
                  .sub(expectedAdminInterest).toNumber())
                  ).to.be.lessThan(10).and.greaterThan(-10);
  
                expect(
                  userReserveDataSigner.currentATokenBalance
                  .add(userReserveDataAdmin.currentATokenBalance)
                  .add(userReserveDataEmerg.currentATokenBalance).div(100)
                  ).to.be.almostEqualOrEqual(strategyBoostedBalance.div(100)); 
              }
              var strategyEndBoostedBalance = await strategy.balanceOfPool();
              expect(strategyEndBoostedBalance).to.be.gt(DRE.ethers.utils.parseEther("1500"))
            var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)
            console.log("USER DATA after tend: ", userData); //now the user collateral increases slightly since liquidity rate increases a little, so your atoken amount also increases a little
            // NOTICE: confirmed that oracle price will increase after tending
          });
  
  
          it("all users withdraws which withdraws from the booster", async () => {
            const lendingPool = await contractGetters.getLendingPool();
            const signer = await contractGetters.getFirstSigner();
            const emergencyAdmin = (await DRE.ethers.getSigners())[1]
            const dataProv = await contractGetters.getAaveProtocolDataProvider();
            var CurveToken = new DRE.ethers.Contract(CVXadd,CVX_ABI)
            const myWETH = new DRE.ethers.Contract(WETHadd,WETHabi)

            await lendingPool.connect(signer)
              .repay(
                myWETH.address,
                1,
                DRE.ethers.utils.parseEther("1.0"),
                await signer.getAddress());
                var userData:UserAccountData = await lendingPool.connect(signer).getUserAccountData(signer.address,1,false)
                console.log("USER DATA after repay: ", userData);
            const tricrypto2Tranch1ATokenAddress =
              (await lendingPool.getReserveData(CurveToken.address, 1)).aTokenAddress;
            // 0x1E496C78617EB7AcC22d7390cBA17c4768DD87b2
  
            const tricrypto2Tranch1AToken =
              await contractGetters.getAToken(tricrypto2Tranch1ATokenAddress);
  
              const strategy = await contractGetters.getCrvLpStrategy(tricrypto2Tranch1AToken.getStrategy()); //get specific implementation of the strategy
  
            await lendingPool.connect(signer)
              .withdraw(
                CurveToken.address,
                1,
                (await dataProv.getUserReserveData(CurveToken.address, 1, signer.address)).currentATokenBalance, //withdraw all
                await signer.getAddress());
              
                await lendingPool.connect(emergencyAdmin)
                .withdraw(
                  CurveToken.address,
                  1,
                  (await dataProv.getUserReserveData(CurveToken.address, 1, emergencyAdmin.address)).currentATokenBalance, //withdraw all
                  await emergencyAdmin.getAddress());
  
            var strategyBoostedBalance = await strategy.balanceOfPool();
            console.log("strategy AFTER WITHDRAW boosted balance: " + strategyBoostedBalance);
            expect((await dataProv.getUserReserveData(CurveToken.address, 1, "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49")).currentATokenBalance.div(100)).to.be.almostEqualOrEqual(strategyBoostedBalance.div(100))
          });
    }
)

