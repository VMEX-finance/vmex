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
    IUniswapV2Router02 internal sushiRouter =
        IUniswapV2Router02(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    uint256 public pid;
    uint8 public poolSize;

    //no constructor so we can link contract to vault after deploy, instead we use an init function
    //add modifiers as needed
    //TODO finish this up with base strategy init
    function initialize(
        address _addressProvider,
        address _underlying,
        uint64 _tranche,
        uint256 _pid,
        uint8 _poolSize,
        address _curvePool
    ) public {
        __BaseStrategy_init(_addressProvider, _underlying, _tranche);

        pid = _pid;
        poolSize = _poolSize;

        IBooster.PoolInfo memory poolInfo = booster.poolInfo(pid);
        baseRewardsPool = IBaseRewardsPool(poolInfo.crvRewards);

        curvePool = ICurveFi(_curvePool);
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
    function _tend() internal override returns (TendData memory) {
        //check to see if rewards have stopped streaming
        require(
            baseRewardsPool.earned(address(this)) != 0,
            "rewards not streaming"
        );

        // TendData memory tendData;

        // // 1. Harvest gains from positions

        // uint256 balanceBefore = balanceOfPool();

        // // Harvest CRV, CVX, and extra rewards tokens from staking positions
        // // Note: Always claim extras
        // baseRewardsPool.getReward(address(this), true);

        // // Track harvested coins, before conversion
        // tendData.crvTended = crvToken.balanceOf(address(this));
        // tendData.cvxTended = cvxToken.balanceOf(address(this));

        // //first we swap for the current lowest amount in the pool
        // (address wantedDepositToken, uint256 index) = vStrategyHelper
        // 	.checkForHighestPayingToken(curvePoolTokens, curveTokenBalances);

        // for (uint8 i = 0; i < extraTokens.length; i ++) {
        // 	extraRewardsTended[extraTokens[i]] =
        // 		IERC20(extraTokens[i]).balanceOf(address(this));

        // 	address[] memory tokenPath = vStrategyHelper.computeSwapPath(
        // 		extraTokens[i], wantedDepositToken);

        // 	sushiRouter.swapExactTokensForTokens(
        // 		extraRewardsTended[extraTokens[i]],
        // 		0,
        // 		tokenPath,
        // 		address(this),
        // 		block.timestamp
        // 	);
        // }

        // //need to use sushi here to swap between coins without a curve pool, can optimize later perhaps?
        // address[] memory crvPath = vStrategyHelper.computeSwapPath(address(crvToken), wantedDepositToken);
        // address[] memory cvxPath = vStrategyHelper.computeSwapPath(address(cvxToken), wantedDepositToken);

        // //swap crv for wanted
        // sushiRouter.swapExactTokensForTokens(
        // 	tendData.crvTended,
        // 	0, //min amount out (0 works fine)
        // 	crvPath,
        // 	address(this),
        // 	block.timestamp
        // );

        // //swap cvx for wanted
        // sushiRouter.swapExactTokensForTokens(
        // 	tendData.cvxTended,
        // 	0,
        // 	cvxPath,
        // 	address(this),
        // 	block.timestamp
        // );

        // //get the lowest balance coin in the pool for max lp tokens on deposit
        // uint256 depositAmountWanted = IERC20(wantedDepositToken).balanceOf(address(this));

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
                sushiRouter
            );

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
        //in eth pools, eth seems to always be index 0
        curvePool.add_liquidity{value: ethBalance}(amounts, 0);

        //update pool balance
        _pull(IERC20(underlying).balanceOf(address(this)));
        uint256 balanceAfter = balanceOfPool();

        //update globals, inherited from BaseStrategy.sol
        interestRate((balanceAfter - balanceBefore), balanceBefore);
        lastHarvestTime = block.timestamp;

        //mint to treasury
        _mintToTreasury((balanceAfter - balanceBefore));

        return tendData;
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
