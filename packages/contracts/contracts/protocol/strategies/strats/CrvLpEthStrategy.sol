// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {BaseStrategy} from "../BaseStrategy.sol";
import {IBooster} from "../deps/convex/IBooster.sol";
import {IBaseRewardsPool} from "../deps/convex/IBaseRewardsPool.sol";
import {IVirtualBalanceRewardPool} from "../deps/convex/IVirtualBalanceRewardPool.sol";
import {IWETH} from "../deps/tokens/IWETH.sol";
import {vStrategyHelper} from "../deps/vStrategyHelper.sol";
import {ICurveFi} from "../deps/curve/ICurveFi.sol";
import {IUniswapV2Router02} from "../deps/sushi/IUniswapV2Router02.sol";
import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
// import {IStrategy} from "./IStrategy.sol";

import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {AssetMappings} from "../../../protocol/lendingpool/AssetMappings.sol";
import {DataTypes} from "../../../protocol/libraries/types/DataTypes.sol";

import "hardhat/console.sol";
//need modifiers for permissioned actors after built into lending pool
contract CrvLpEthStrategy is BaseStrategy {
    //NOTE: underlying and lendingPool are inherited from BaseStrategy.sol

    //Tokens included in strategy
    //LP/deposit token
    //CRV - rewards
    //CVX - rewards

    IERC20 public constant crvToken =
        IERC20(0xD533a949740bb3306d119CC777fa900bA034cd52);
    IERC20 public constant cvxToken =
        IERC20(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);
    address public constant ethNative =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    // baseRewards gives us CRV rewards, and the generation of CRV generates CVX rewards
    IBooster public constant booster =
        IBooster(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);
    IBaseRewardsPool public baseRewardsPool;

    //Curve Registry
    ICurveFi public curvePool; //needed for curve pool functionality

    address[] public curvePoolTokens;
    uint256[] public curveTokenBalances;
    address[] public extraTokens;

    //Sushi
    IUniswapV2Router02 internal constant sushiRouter =
        IUniswapV2Router02(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    uint256 public pid;
    uint8 public poolSize;

    //no constructor so we can link contract to vault after deploy, instead we use an init function
    //add modifiers as needed
    //TODO finish this up with base strategy init
    function initialize(
        address _addressProvider,
        address _underlying,
        uint64 _tranche
        // uint256 _pid,
        // uint8 _poolSize,
        // address _curvePool
    ) public {
        __BaseStrategy_init(_addressProvider, _underlying, _tranche);
        DataTypes.CurveMetadata memory vars = AssetMappings(ILendingPoolAddressesProvider(_addressProvider).getAssetMappings()).getCurveMetadata(_underlying);

        pid = vars._pid;
        poolSize = vars._poolSize;

        IBooster.PoolInfo memory poolInfo = booster.poolInfo(pid);
        baseRewardsPool = IBaseRewardsPool(poolInfo.crvRewards);

        curvePool = ICurveFi(vars._curvePool);
        curvePoolTokens = new address[](poolSize);
        curveTokenBalances = new uint256[](poolSize);

        //on eth pools, curve uses the 0xeeee address, and approvals will fail since it's ether and not a token
        for (uint8 i = 0; i < poolSize; i++) {
            curvePoolTokens[i] = curvePool.coins(i);
            curveTokenBalances[i] = curvePool.balances(i);

            if (curvePoolTokens[i] == ethNative) {
                vStrategyHelper.tokenAllowAll(
                    vStrategyHelper.WETH,
                    address(sushiRouter)
                );
            } else {
                vStrategyHelper.tokenAllowAll(
                    curvePoolTokens[i],
                    address(sushiRouter)
                );
            }
        }

        // approvals for boosting lp token
        vStrategyHelper.tokenAllowAll(underlying, address(booster));

        // approvals for swapping rewards back to lp
        vStrategyHelper.tokenAllowAll(address(crvToken), address(sushiRouter));
        vStrategyHelper.tokenAllowAll(address(cvxToken), address(sushiRouter));

        //approvals for n rewards tokens
        extraTokens = vStrategyHelper.getExtraRewardsTokens(baseRewardsPool);
        for (uint8 i = 0; i < extraTokens.length; i++) {
            vStrategyHelper.tokenAllowAll(extraTokens[i], address(sushiRouter));
        }
    }

    function earned() external view returns (uint256){
        return baseRewardsPool.earned(address(this));
    }

    function getName() external pure override returns (string memory) {
        return "VMEX (LP Token Name Goes Here) Strategy";
    }

    // these tokens are involved with the strategy
    function getProtectedTokens()
        public
        view
        override
        returns (address[] memory)
    {
        address[] memory protectedTokens = new address[](1);
        protectedTokens[0] = underlying;
        // protectedTokens[1] = address(crvToken);
        // protectedTokens[2] = address(cvxToken);
        return protectedTokens;
    }

    //these are called by vault contracts or in our case the lending pools themselves
    function _pull(uint256 amount) internal override {
        //send to Convex Booster here
        booster.deposit(pid, amount, true); //true for yes, we want to stake
    }

    //keeping in just in case something happens and we need to remove all funds and/or migrate the strategy
    //can withdraw directly from the rewards contract itself and avoid paying extra gas for using booster?
    function _withdrawAll() internal override {
        baseRewardsPool.withdrawAllAndUnwrap(true);
        // Note: All want is automatically withdrawn outside this "inner hook" in base strategy function
    }

    function _withdrawSome(uint256 amount) internal override returns (uint256) {
        baseRewardsPool.withdrawAndUnwrap(amount, true);
        return amount;
    }

    function _isTendable() internal pure override returns (bool) {
        return true; // Change to true if the strategy should be tended
    }

    // farm and dump strategy will never stake CVX and cvxCRV, so no need to
    // distribute those rewards thru harvesting
    function _harvest()
        internal
        override
        returns (TokenAmount[] memory harvested)
    {
        revert("harvest not implemented");
    }

    // By farm and dump strategy, tend() will swap all rewards back into base LP token,
    // then deposit the LP back into the booster.
    function _tend() internal override returns (uint256) {
        //check to see if rewards have stopped streaming
        require(
            baseRewardsPool.earned(address(this)) != 0,
            "rewards not streaming"
        );
        uint256 balanceBefore = balanceOfPool();

        (
            TendData memory tendData,
            uint256 depositAmountWanted,

        ) = vStrategyHelper.tend(
                baseRewardsPool,
                curvePoolTokens,
                curveTokenBalances,
                extraTokens,
                extraRewardsTended,
                EFFICIENCY
            );
        // if(depositAmountWanted==0){
        //     return 0;
        // }
        //decide if we want to revert or return 0
        require(depositAmountWanted>0, "Strategy tend error: Not enough rewards to tend efficiently");

        //now we need to unwrap any weth we might have after swap
        //using weth so we don't have to implement a seperate uni call for swapping directly to eth
        if (IERC20(vStrategyHelper.WETH).balanceOf(address(this)) > 0) {
            IWETH(vStrategyHelper.WETH).withdraw(
                IERC20(vStrategyHelper.WETH).balanceOf(address(this))
            );
        }
        uint256 ethBalance = address(this).balance;

        //returns a dynamic array filled with the amounts in the index we need for curve
        uint256[2] memory amounts = vStrategyHelper
            .getLiquidityAmountsArrayIncludingEth(
                index,
                ethBalance,
                depositAmountWanted
            );
        console.log("amounts[0]: ",amounts[0]);
        console.log("amounts[1]: ",amounts[1]);
        //in eth pools, eth seems to always be index 0
        curvePool.add_liquidity{value: ethBalance}(amounts, 0);

        //update pool balance
        _pull(IERC20(underlying).balanceOf(address(this)));
        uint256 balanceAfter = balanceOfPool();

        uint256 timeDifference =
            block.timestamp - (uint256(lastHarvestTime));
        lastHarvestTime = block.timestamp;
        uint256 amountEarned = (balanceAfter - balanceBefore);
        //update globals, inherited from BaseStrategy.sol
        interestRate(amountEarned, balanceBefore, timeDifference);
        

        //mint to treasury and update LI
        _updateState(amountEarned);

        return amountEarned;
    }

    /// @dev Return the balance (in underlying) that the strategy has invested somewhere
    function balanceOfPool() public view override returns (uint256) {
        // Change this to return the amount of underlying invested in another protocol
        return baseRewardsPool.balanceOf(address(this));
    }

    /// @dev Return the balance of rewards that the strategy has accrued
    /// @notice Used for offChain APY and Harvest Health monitoring
    function balanceOfRewards()
        external
        view
        override
        returns (TokenAmount[] memory rewards)
    {
        //unused since we doing all off chain calculations
    }

    // include so our contract plays nicely with ether
    receive() external payable {}
}
