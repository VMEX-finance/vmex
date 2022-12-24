pragma solidity >=0.8.0;

import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {IWETH} from "../../../../contracts/misc/interfaces/IWETH.sol";
import {SafeERC20} from "../../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IBaseRewardsPool} from "./convex/IBaseRewardsPool.sol";
import {IVirtualBalanceRewardPool} from "./convex/IVirtualBalanceRewardPool.sol";
import {IUniswapV2Router02} from "./sushi/IUniswapV2Router02.sol";
import {IBaseStrategy} from "../../../interfaces/IBaseStrategy.sol";
import {ICurveAddressProvider} from "../deps/curve/ICurveAddressProvider.sol"; 
import {ICurveRegistryExchange} from "../deps/curve/ICurveExchange.sol"; 

import "hardhat/console.sol";

library vStrategyHelper {
    using SafeERC20 for IERC20;

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address internal constant ethNative = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    IERC20 internal constant crvToken =
        IERC20(0xD533a949740bb3306d119CC777fa900bA034cd52);
    IERC20 internal constant cvxToken =
        IERC20(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);
	ICurveAddressProvider internal constant curveAddressProvider = 
		ICurveAddressProvider(0x0000000022D53366457F9d5E68Ec105046FC4383); 
    IUniswapV2Router02 internal constant sushiRouter = 
		IUniswapV2Router02(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);



    function computeSwapPath(address tokenIn, address tokenOut, uint256 amount)
        internal 
        returns (uint256 amountOut)
    {
		//check if tokenIn is one of the tokens we want stable swaps for 
		(address curveSwapPool, uint256 amountExpected, address curveRegistryExchange) = swapCurve(tokenIn, tokenOut, amount); 
		console.log("token in:", tokenIn); 
		console.log("token out:", tokenOut); 
        console.log("amount: ", amount);
		// console.log("curve registry exchange address", curveRegistryExchange); 
		console.log("curveSwapPool address", curveSwapPool); 
		if (curveSwapPool != address(0)) {
            //must approve the curve pools. This function checks if already max, and if not, then makes it max
            tokenAllowAll(
                address(tokenIn),
                curveSwapPool
            );
			try ICurveRegistryExchange(curveRegistryExchange).exchange(
				curveSwapPool,
				tokenIn,
				tokenOut,
				amount,
				amountExpected,
				msg.sender //this may cause some weird behavior calling the swaps now, make sure the stategy is receiving funds
			) returns (uint256 amountOut) {
				console.log("amount returned from CURVE", amountOut); 	
				return amountOut; 
			} catch Error(string memory reason) {
				console.log("Curve swap could not be completed", reason); 
			} catch(bytes memory reason) {
				console.log("Curve unknown error", string(reason)); 	
			}
		} else {
			amountOut = swapSushi(tokenIn, tokenOut, amount); 	
			console.log("amount returned from SUSHI:", amountOut); 
			return amountOut; 
		}

    }

	function swapSushi(
		address tokenIn, 
		address tokenOut,
		uint256 amount) 
		internal returns(uint256) {

		address[] memory path; 	
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
			
        try sushiRouter.swapExactTokensForTokens(
			amount,
            0,//tendData.crvTended/EFFICIENCY, //min amount out (0 works fine)
			path,
            address(this),
            block.timestamp
		) returns (uint256[] memory amounts) {
			// console.log("amount returned from SUSHI", amounts[0]); 
			return amounts[0]; 
		} catch Error(string memory reason) {
			console.log("swap could not be completed on SUSHI", reason); 
		} catch (bytes memory reason) {
			console.log("unknwon error sushi swap", string(reason)); 
		}
	}

	//uses curve to swap for the indexed token we want
	function swapCurve(
		address tokenIn, 
		address tokenOut, 
		uint256 amount
	) internal returns (address swapPool, uint256 amountExpected, address curveRegistryExchange) {
		//use curve address provider to get registry (in case they migrate contracts ever)
		curveRegistryExchange = curveAddressProvider.get_address(2); //the registry exchange contract will always be the second index, but the address itself can change (per curve docs) 
		//use curve registry interface to get pool for the coins we want to swap
		(swapPool, amountExpected) = ICurveRegistryExchange(curveRegistryExchange).get_best_rate(tokenIn, tokenOut, amount); 

		return (swapPool, amountExpected, curveRegistryExchange); 
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
		uint256 amountOfTokenReceived; 
    }

    event TendError(bytes message);

    function tend(
        IBaseRewardsPool baseRewardsPool,
        address[] storage curvePoolTokens,
        uint256[] storage curveTokenBalances,
        address[] storage extraTokens,
        mapping(address => uint256) storage extraRewardsTended,
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

        if(wantedDepositToken==ethNative){
            wantedDepositToken = WETH; 
        }
        else{
            require(curvePoolTokens[highestPayingIdx]==wantedDepositToken, "Inconsistent index and token");
        }
        
        console.log("wantedDepositToken: ", wantedDepositToken);

        if(wantedDepositToken==0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490){ //edge case of trying to get 3crv, which cannot be traded for
            //either change this to frax, or optimize by swapping into usdc or something and getting 3crv
            wantedDepositToken = 0x853d955aCEf822Db058eb8505911ED77F175b99e; 
            highestPayingIdx = 0;
            
        }

        // further optimization by trying to trade for the curve token, but in our case we will just supply
        // if(ICurveRegistryExchange(curveAddressProvider.get_address(2)).get_pool_from_lp_token(wantedDepositToken) != address(0)){
        //     //this means wantedDepositToken is a curve token (3crv)
        //     console.log("Wanted deposit token is a curve token");
        //     wantedDepositToken = checkForHighestPayingToken(curvePoolTokens, curveTokenBalances);
        // }
		//computeSwapPath will now swap the tokens and return the amount received
        for (vars.i = 0; vars.i < extraTokens.length; vars.i++) {
            extraRewardsTended[extraTokens[vars.i]] = IERC20(extraTokens[vars.i])
                .balanceOf(address(this));

             vars.amountOfTokenReceived += computeSwapPath(
                extraTokens[vars.i],
                wantedDepositToken,
				extraRewardsTended[extraTokens[vars.i]]
            );
		}

        vars.amountOfTokenReceived += computeSwapPath(
            address(crvToken),
            wantedDepositToken,
			tendData.crvTended
        );

        vars.amountOfTokenReceived += computeSwapPath(
            address(cvxToken),
            wantedDepositToken,
			tendData.cvxTended
        );
		console.log(vars.amountOfTokenReceived); 

        // if(wantedDepositToken == ethNative){ //should all be WETH now, convert WETH to ETH
        //     IWETH(WETH).withdraw(IERC20(WETH).balanceOf(address(this)));
        // }

        //get the lowest balance coin in the pool for max lp tokens on deposit
        depositAmountWanted = IERC20(wantedDepositToken).balanceOf(
            address(this)
        );
        index = highestPayingIdx;
    }

    function min(uint256[] memory array)
        internal
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
