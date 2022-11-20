pragma solidity >=0.8.0;

import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IBaseRewardsPool} from "./convex/IBaseRewardsPool.sol";
import {IVirtualBalanceRewardPool} from "./convex/IVirtualBalanceRewardPool.sol";
import {IUniswapV2Router02} from "./sushi/IUniswapV2Router02.sol";
import {IBaseStrategy} from "../../../interfaces/IBaseStrategy.sol";

import "hardhat/console.sol";

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

    struct tendVars {
        uint256 EFFICIENCY;
        uint8 i;
        address[] tokenPath;
    }

    event TendError(bytes message);

    function tend(
        IBaseRewardsPool baseRewardsPool,
        address[] storage curvePoolTokens,
        uint256[] storage curveTokenBalances,
        address[] storage extraTokens,
        mapping(address => uint256) storage extraRewardsTended,
        IUniswapV2Router02 sushiRouter,
        uint256 EFFICIENCY
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
        tendVars memory vars;
        {
            vars.EFFICIENCY=EFFICIENCY; //unused for now
        }
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

        if(wantedDepositToken==0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490){ //edge case of trying to get 3crv, which cannot be traded for
            //either change this to frax, or optimize by swapping into usdc or something and getting 3crv
            wantedDepositToken = 0x853d955aCEf822Db058eb8505911ED77F175b99e; 
            highestPayingIdx = 0;
            
        }
        require(curvePoolTokens[highestPayingIdx]==wantedDepositToken, "Inconsistent index and token");
        console.log("wantedDepositToken: ", wantedDepositToken);



        for (vars.i = 0; vars.i < extraTokens.length; vars.i++) {
            extraRewardsTended[extraTokens[vars.i]] = IERC20(extraTokens[vars.i])
                .balanceOf(address(this));

            vars.tokenPath = computeSwapPath(
                extraTokens[vars.i],
                wantedDepositToken
            );
            console.log("Sushi router input amount: ", extraRewardsTended[extraTokens[vars.i]]);
            console.log("Sushi router extra token: ", extraTokens[vars.i]);
            if(extraRewardsTended[extraTokens[vars.i]]>0){
                console.log("attempt swap of ",extraTokens[vars.i]);
                //issue with using efficiency is that the current token can have different value than target token. 
                //If current token is like usdc and target is eth, 50% of 1000 usdc is 500, and you're not getting that much eth out
                //Can do conversion using oracle but that might be overkill
                try sushiRouter.swapExactTokensForTokens(
                    extraRewardsTended[extraTokens[vars.i]],
                    0,//extraRewardsTended[extraTokens[vars.i]]/EFFICIENCY,//try to get at least 50% of the input amount, or else don't tend
                    vars.tokenPath,
                    address(this),
                    block.timestamp
                ) returns (uint256[] memory amounts){
                    for(uint i = 0;i<amounts.length;i++){
                        console.log("amounts[i]: ",amounts[i]);
                    }
                    // 
                } catch Error(string memory reason){
                    console.log("Swap Error: ",reason);
                } catch (bytes memory reason) {
                    emit TendError(reason);
                    console.log("Swap extra reward Unknown error: ", string(reason));
                }
            }
            
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
        console.log("crv rewards: ", tendData.crvTended);
        
        if(tendData.crvTended>0){
            try sushiRouter.swapExactTokensForTokens(
                tendData.crvTended,
                0,//tendData.crvTended/EFFICIENCY, //min amount out (0 works fine)
                crvPath,
                address(this),
                block.timestamp
            ) returns (uint256[] memory amounts){
                    console.log("swapped crv");
                    for(uint i = 0;i<amounts.length;i++){
                        console.log("amounts[i]: ",amounts[i]);
                    }
                    // 
                } catch Error(string memory reason){
                    console.log("Crv Swap Error: ",reason);
                }  catch (bytes memory reason) {
                    emit TendError(reason);
                    console.log("Swap crv Unknown error: ", string(reason));
                }
        }

        //swap cvx for wanted
        console.log("cvx rewards: ", tendData.cvxTended);
        if(tendData.cvxTended>0){
            try sushiRouter.swapExactTokensForTokens(
                tendData.cvxTended,
                0,//tendData.cvxTended/EFFICIENCY,
                cvxPath,
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
                }  catch (bytes memory reason) {
                    emit TendError(reason);
                    console.log("Swap cvx Unknown error: ", string(reason));
                }
        }

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
