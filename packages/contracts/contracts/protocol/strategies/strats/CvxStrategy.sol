// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../BaseStrategy.sol";
import "../deps/convex/CrvDepositor.sol";
import "../deps/convex/IBaseRewardsPool.sol";
import "../deps/convex/ICvxRewardsPool.sol";
import {vStrategyHelper} from "../deps/vStrategyHelper.sol";
import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {IUniswapV2Router02} from "../deps/sushi/IUniswapV2Router02.sol";
import {IStrategy} from "./IStrategy.sol";

//need modifiers for permissioned actors
contract CvxStrategy is BaseStrategy {
    //NOTE: underlying and lendingPool are inherited from BaseStrategy.sol

    // ===== Tokens =====
    IERC20 public constant crvToken =
        IERC20(0xD533a949740bb3306d119CC777fa900bA034cd52);
    IERC20 public constant cvxToken =
        IERC20(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);
    IERC20 internal constant cvxCrvToken =
        IERC20(0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7);

    // ===== Convex Registry =====
    ICvxRewardsPool public constant cvxRewardsPool =
        ICvxRewardsPool(0xCF50b810E57Ac33B91dCF525C6ddd9881B139332);

    //Sushi
    IUniswapV2Router02 internal constant sushiRouter =
        IUniswapV2Router02(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    //no constructor so we can link contract to vault after deploy, instead we use an init function
    //add modifiers as needed
    function initialize(
        address _addressProvider, 
        address asset, //unused, but to satisfy requirements
        uint64 _tranche
    ) public initializer{ 
        __BaseStrategy_init(_addressProvider, address(cvxToken), _tranche);

        // Approvals
        vStrategyHelper.tokenAllowAll(
            address(cvxCrvToken),
            address(sushiRouter)
        );
        vStrategyHelper.tokenAllowAll(
            address(cvxToken),
            address(cvxRewardsPool)
        );
    }

    function earned() external view returns (uint256){
        return cvxRewardsPool.earned(address(this));
    }

    //do we need this? would assist with devs interfacing with these contracts
    function getName() external pure override returns (string memory) {
        return "VMEX CVX Strategy";
    }

    //this is local only? comes from badger/yearn
    function getProtectedTokens()
        public
        view
        override
        returns (address[] memory)
    {
        address[] memory protectedTokens = new address[](1);
        protectedTokens[0] = underlying;
        return protectedTokens;
    }

    //these are called by vault contracts or in our case the lending pools themselves
    function _pull(uint256 amount) internal override {
        cvxRewardsPool.stake(cvxToken.balanceOf(address(this)));
    }

    //keeping in just in case something happens and we need to remove all funds and/or migrate the strategy
    //can withdraw directly from the rewards contract itself and avoid paying extra gas for using booster?
    function _withdrawAll() internal override {
        cvxRewardsPool.withdraw(balanceOfPool(), false);
        // Note: All want is automatically withdrawn outside this "inner hook" in base strategy function
    }

    function _withdrawSome(uint256 amount) internal override returns (uint256) {
        cvxRewardsPool.withdraw(amount, true);
        return amount;
    }

    /// @dev Does this function require `tend` to be called?
    function _isTendable() internal pure override returns (bool) {
        return true; // Change to true if the strategy should be tended
    }

    function _harvest()
        internal
        override
        returns (TokenAmount[] memory harvested)
    {
        revert("harvest not implemented");
    }

    // By farm and dump strategy, tend() will swap all rewards back into CRV token,
    // then deposit the CRV into the reward pool.
    function _tend() internal override returns (uint256) {
        uint256 balanceBefore = balanceOfPool();
        TendData memory tendData;

        // 1. Harvest gains from positions

        // Harvest cvxCRV tokens from staking positions
        cvxRewardsPool.getReward(false);

        // Track harvested coins, before conversion
        tendData.cvxCrvTended = cvxCrvToken.balanceOf(address(this));

        address[] memory path = new address[](4);
        path[0] = address(cvxCrvToken);
        path[1] = address(crvToken);
        path[2] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        path[3] = address(cvxToken);

        // swap cvxCRV for CVX
        try sushiRouter.swapExactTokensForTokens(
            tendData.cvxCrvTended,
            0,//tendData.cvxCrvTended/EFFICIENCY,
            path,
            address(this),
            block.timestamp
        ) returns (uint256[] memory amounts){
            console.log("swapped cvx");
            for(uint i = 0;i<amounts.length;i++){
                console.log("amounts[i]: ",amounts[i]);
            }
            // 
        } catch Error(string memory reason){
            console.log("Cvx Swap Error: ",reason);
            revert("Strategy tend error: Not enough rewards to tend efficiently");
        }

        // TODO: potentially call pull() so we pull from lending pools
        // deposit all swapped CVX back into the

        _pull(cvxToken.balanceOf(address(this)));

        uint256 balanceAfter = balanceOfPool();


        uint256 timeDifference =
            block.timestamp - (uint256(lastHarvestTime));
        lastHarvestTime = block.timestamp;
        //update globals, inherited from BaseStrategy.sol
        uint256 amountEarned = (balanceAfter - balanceBefore);
        interestRate(amountEarned, balanceBefore, timeDifference);
        

        //mint to treasury and update LI
        _updateState(amountEarned);

        return amountEarned;
    }

    /// @dev Return the balance (in underlying) that the strategy has invested somewhere
    function balanceOfPool() public view override returns (uint256) {
        // Change this to return the amount of underlying invested in another protocol
        return cvxRewardsPool.balanceOf(address(this));
    }

    /// @dev Return the balance of rewards that the strategy has accrued
    /// @notice Used for offChain APY and Harvest Health monitoring
    function balanceOfRewards()
        external
        view
        override
        returns (TokenAmount[] memory rewards)
    {
        // Rewards are 0
        rewards = new TokenAmount[](1);
        rewards[0] = TokenAmount(underlying, 0);
        return rewards;
    }
}
