pragma solidity >=0.8.0;

import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IBaseRewardsPool} from "./convex/IBaseRewardsPool.sol";
import {IVirtualBalanceRewardPool} from "./convex/IVirtualBalanceRewardPool.sol";
import {IUniswapV2Router02} from "./sushi/IUniswapV2Router02.sol";
import {IBaseStrategy} from "../../../interfaces/IBaseStrategy.sol";

library vStrategyHelper {
    using SafeERC20 for IERC20;

    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant ethNative =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    IERC20 public constant crvToken =
        IERC20(0xD533a949740bb3306d119CC777fa900bA034cd52);
    IERC20 public constant cvxToken =
        IERC20(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);

    function computeSwapPath(address tokenIn, address tokenOut)
        public
        pure
        returns (address[] memory path)
    {
        if (tokenIn == WETH || tokenOut == WETH) {
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;
        } else {
            path = new address[](3);
            path[0] = tokenIn;
            path[1] = WETH;
            path[2] = tokenOut;
        }

        return path;
    }

    //ensure that the order being passed in here is the same as the order in the coins[] array
    //needed for highest returned amount of LP tokens, the lower the amount in the pool, the more lp returned
    //NOTE: only applicable for curveV2 pools where assets are not the same
    function checkForHighestPayingToken(
        address[] memory poolTokens,
        uint256[] memory amountsInPool
    ) public pure returns (address highestPayingToken, uint256 index) {
        (, index) = min(amountsInPool);
        highestPayingToken = poolTokens[index];

        return (highestPayingToken, index);
    }

    function getLiquidityAmountsArray(
        uint256 n,
        uint256 amountToken,
        uint256 index
    ) public pure returns (uint256[] memory amounts) {
        //create array based on size of pool
        amounts = new uint256[](n);

        //only populate the index we are going to use, the rest should already be 0 I think
        amounts[index] = amountToken;
        return amounts;
    }

    //in case someone tries to break it by depositing eth like a pleb
    function getLiquidityAmountsArrayIncludingEth(
        uint256 index,
        uint256 amountEth,
        uint256 amountToken
    ) public pure returns (uint256[2] memory _amounts) {
        //check if eth and wanted are the same token and account for extraneous eth deposits
        if (index == 0) {
            _amounts[0] = amountEth;
            _amounts[1] = 0;
        } else {
            _amounts[0] = amountEth;
            _amounts[1] = amountToken;
        }

        return _amounts;
    }

    function getFixedArraySizeTwo(uint256[] memory array)
        public
        pure
        returns (uint256[2] memory)
    {
        uint256[2] memory pArray;

        //point this new fixed array to the dynamic one gotten from getLiquidityAmountsArray()
        // 0x20 needs to be added to an array because the first slot contains the
        // array length
        assembly {
            pArray := add(array, 0x20)
        }

        return pArray;
    }

    function getFixedArraySizeThree(uint256[] memory array)
        public
        pure
        returns (uint256[3] memory)
    {
        uint256[3] memory pArray;

        assembly {
            pArray := add(array, 0x20)
        }

        return pArray;
    }

    function getFixedArraySizeFour(uint256[] memory array)
        public
        pure
        returns (uint256[4] memory)
    {
        uint256[4] memory pArray;

        assembly {
            pArray := add(array, 0x20)
        }

        return pArray;
    }

    function tokenAllowAll(address asset, address allowee) public {
        IERC20 token = IERC20(asset);

        if (token.allowance(address(this), allowee) != type(uint256).max) {
            token.safeApprove(allowee, type(uint256).max);
        }
    }

    //generic function to get the address of (n) return tokens
    function getExtraRewardsTokens(IBaseRewardsPool baseRewardsPool)
        public
        view
        returns (address[] memory extraRewardsTokens)
    {
        uint256 extraLength = baseRewardsPool.extraRewardsLength();
        address[] memory rewardsContracts = new address[](extraLength);
        extraRewardsTokens = new address[](extraLength);

        for (uint8 i = 0; i < extraLength; i++) {
            rewardsContracts[i] = baseRewardsPool.extraRewards(i);
            extraRewardsTokens[i] = IVirtualBalanceRewardPool(
                rewardsContracts[i]
            ).rewardToken();
        }

        return extraRewardsTokens;
    }

    function tend(
        IBaseRewardsPool baseRewardsPool,
        address[] storage curvePoolTokens,
        uint256[] storage curveTokenBalances,
        address[] storage extraTokens,
        mapping(address => uint256) storage extraRewardsTended,
        IUniswapV2Router02 sushiRouter
    )
        public
        returns (
            IBaseStrategy.TendData memory tendData,
            uint256 depositAmountWanted,
            uint256 index
        )
    {
        // 1. Harvest gains from positions

        // uint256 balanceBefore = baseRewardsPool.balanceOf(address(this));

        // Harvest CRV, CVX, and extra rewards tokens from staking positions
        // Note: Always claim extras
        baseRewardsPool.getReward(address(this), true);

        //TODO: implement generic function to track extraRewardsToken balances to return them with tendData
        // Track harvested coins, before conversion
        tendData.crvTended = crvToken.balanceOf(address(this));
        tendData.cvxTended = cvxToken.balanceOf(address(this));

        //first we swap for the current lowest amount in the pool
        (
            address wantedDepositToken,
            uint256 highestPayingIdx
        ) = checkForHighestPayingToken(curvePoolTokens, curveTokenBalances);

        for (uint8 i = 0; i < extraTokens.length; i++) {
            extraRewardsTended[extraTokens[i]] = IERC20(extraTokens[i])
                .balanceOf(address(this));

            address[] memory tokenPath = computeSwapPath(
                extraTokens[i],
                wantedDepositToken
            );

            sushiRouter.swapExactTokensForTokens(
                extraRewardsTended[extraTokens[i]],
                0,
                tokenPath,
                address(this),
                block.timestamp
            );
        }

        //need to use sushi here to swap between coins without a curve pool, can optimize later perhaps?
        address[] memory crvPath = computeSwapPath(
            address(crvToken),
            wantedDepositToken
        );
        address[] memory cvxPath = computeSwapPath(
            address(cvxToken),
            wantedDepositToken
        );

        //swap crv for wanted
        sushiRouter.swapExactTokensForTokens(
            tendData.crvTended,
            0, //min amount out (0 works fine)
            crvPath,
            address(this),
            block.timestamp
        );

        //swap cvx for wanted
        sushiRouter.swapExactTokensForTokens(
            tendData.cvxTended,
            0,
            cvxPath,
            address(this),
            block.timestamp
        );

        //get the lowest balance coin in the pool for max lp tokens on deposit
        depositAmountWanted = IERC20(wantedDepositToken).balanceOf(
            address(this)
        );
        index = highestPayingIdx;
    }

    function min(uint256[] memory array)
        public
        pure
        returns (uint256, uint256)
    {
        uint256 min = array[0];
        uint256 index;
        for (uint8 i = 1; i < array.length; i++) {
            if (min > array[i]) {
                min = array[i];
                index = i;
            }
        }
        return (min, index);
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
