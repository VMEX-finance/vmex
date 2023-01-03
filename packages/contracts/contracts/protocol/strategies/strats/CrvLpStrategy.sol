// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {BaseStrategy} from "../BaseStrategy.sol";
import {IBooster} from "../deps/convex/IBooster.sol";
import {IBaseRewardsPool} from "../deps/convex/IBaseRewardsPool.sol";
import {IVirtualBalanceRewardPool} from "../deps/convex/IVirtualBalanceRewardPool.sol";
import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {vStrategyHelper} from "../deps/vStrategyHelper.sol";
import {ICurveFi} from "../deps/curve/ICurveFi.sol";
import {IUniswapV2Router02} from "../deps/sushi/IUniswapV2Router02.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {AssetMappings} from "../../../protocol/lendingpool/AssetMappings.sol";
import {DataTypes} from "../../../protocol/libraries/types/DataTypes.sol";
import {IStrategy} from "./IStrategy.sol";
import "hardhat/console.sol";

//need modifiers for permissioned actors after built into lending pool
contract CrvLpStrategy is BaseStrategy, IStrategy {
    //NOTE: underlying and lendingPool are inherited from BaseStrategy.sol

    //Tokens included in strategy
    //LP/deposit token
    //CRV - rewards
    //CVX - rewards

    // baseRewards gives us CRV rewards, and the generation of CRV generates CVX rewards
    IBooster public constant booster =
        IBooster(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);
    IBaseRewardsPool public baseRewardsPool;

    //Curve Registry
    ICurveFi public curvePool; //needed for curve pool functionality
    address[] public extraTokens;

    //Sushi
    IUniswapV2Router02 internal constant sushiRouter = IUniswapV2Router02(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    uint256 public pid;
    uint8 public poolSize;

    //no constructor so we can link contract to vault after deploy, instead we use an init function
    //add modifiers as needed
    function initialize(
        address _addressProvider,
        address _underlying,
        uint64 _tranche
    ) public override initializer {
        console.log("Inside initialize for CrvLpStrategy");
        __BaseStrategy_init(_addressProvider, _underlying, _tranche);
        console.log("After base strat init");

        DataTypes.CurveMetadata memory vars = AssetMappings(ILendingPoolAddressesProvider(_addressProvider).getAssetMappings()).getCurveMetadata(_underlying);

        pid = vars._pid;
        poolSize = vars._poolSize;

        IBooster.PoolInfo memory poolInfo = booster.poolInfo(pid);
        baseRewardsPool = IBaseRewardsPool(poolInfo.crvRewards);

        curvePool = ICurveFi(vars._curvePool);

        //on eth pools, curve uses the 0xeeee address, and approvals will fail since it's ether and not a token
        for (uint8 i = 0; i < poolSize; i++) {
            // approval for the strategy to deposit tokens into LP
            vStrategyHelper.tokenAllowAll(
                curvePool.coins(i),
                address(curvePool)
            );
        }

        // approvals for boosting lp token
        vStrategyHelper.tokenAllowAll(underlying, address(booster));

        // approvals for swapping rewards back to lp
        vStrategyHelper.tokenAllowAll(
            address(vStrategyHelper.crvToken),
            address(sushiRouter)
        );
        vStrategyHelper.tokenAllowAll(
            address(vStrategyHelper.cvxToken),
            address(sushiRouter)
        );

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
        // protectedTokens[1] = address(vStrategyHelper.crvToken);
        // protectedTokens[2] = address(vStrategyHelper.cvxToken);
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
//        console.log("trying to withdraw all");
        baseRewardsPool.withdrawAllAndUnwrap(true);
        // Note: All want is automatically withdrawn outside this "inner hook" in base strategy function
    }

    function _withdrawSome(uint256 amount) internal override returns (uint256) {
        // tries to withdraw as much as possible
        uint256 amountBoosted = balanceOfPool();
        if (amountBoosted <= amount) {
            _withdrawAll();
            return amountBoosted;
        }

//        console.log("amount boosted is", amountBoosted);
//        console.log("trying to withdraw", amount);
//        console.log("amount earned is", baseRewardsPool.earned(address(this)));
        uint256 periodFinish = baseRewardsPool.periodFinish();
//        console.log("period finish is: ", periodFinish);
//        console.log("current timestamp is: ", block.timestamp);
        baseRewardsPool.withdrawAndUnwrap(amount, false);
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
    function _tend() internal override returns (uint256 amountTended) {
        uint256 balanceBefore = balanceOfPool();

        (
            TendData memory tendData,
            uint256 depositAmountWanted,
            uint256 index
        ) = vStrategyHelper.tend(
                baseRewardsPool,
                curvePool, 
                poolSize,
                extraTokens,
                extraRewardsTended,
                addressProvider,
                EFFICIENCY
            );

        vStrategyHelper.addLiquidityToCurve(poolSize, depositAmountWanted, index, curvePool);
        

        // deposit all LP tokens into booster
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
        emit Tend(tendData);

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
}
