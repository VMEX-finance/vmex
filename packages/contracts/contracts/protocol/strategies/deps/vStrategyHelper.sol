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
import {ICurveFi} from "./curve/ICurveFi.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {IPriceOracleGetter} from "../../../interfaces/IPriceOracleGetter.sol";
import {AssetMappings} from "../../lendingpool/AssetMappings.sol";

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

    ICurveFi internal constant ThreeCrvRegistryExchange = ICurveFi(0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7);
    address internal constant ThreeCrv = 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490;


    function computeSwapPath(address tokenIn, address tokenOut, uint256 amount)
        internal 
        returns (uint256 amountOut)
    {
		//check if tokenIn is one of the tokens we want stable swaps for 
		(address curveSwapPool, uint256 amountExpected, address curveRegistryExchange) = swapCurve(tokenIn, tokenOut, amount); 
		
		if (curveSwapPool != address(0)) {
            //must approve the curve pools. This function checks if already max, and if not, then makes it max
            tokenAllowAll(
                address(tokenIn),
                curveRegistryExchange
            );
			try ICurveRegistryExchange(curveRegistryExchange).exchange(
				curveSwapPool,
				tokenIn,
				tokenOut,
				amount,
				amountExpected,
				address(this) //this may cause some weird behavior calling the swaps now, make sure the stategy is receiving funds
                //msg.sender gives these funds to the user who is calling tend
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

        uint256 tokenOutIdx;
        if (tokenIn == WETH || tokenOut == WETH) {
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;
            tokenOutIdx = 1;
        } else {
            path = new address[](3);
            path[0] = tokenIn;
            path[1] = WETH;
            path[2] = tokenOut;
            tokenOutIdx = 2;
        }
			
        try sushiRouter.swapExactTokensForTokens(
			amount,
            0,//tendData.crvTended/EFFICIENCY, //min amount out (0 works fine)
			path,
            address(this),
            block.timestamp
		) returns (uint256[] memory amounts) {
			// console.log("amount returned from SUSHI", amounts[0]); 
			return amounts[tokenOutIdx]; 
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
        ICurveFi curvePool,
        uint256 poolSize,
        ILendingPoolAddressesProvider addressProvider
    ) public view returns (address highestPayingToken, uint256 index) {
        address[] memory poolTokens = new address[](poolSize);
        uint256[] memory amountsInPool = new uint256[](poolSize);
        AssetMappings a = AssetMappings(addressProvider.getAssetMappings());
        for (uint8 i = 0; i < poolSize; i++) {
            poolTokens[i] = curvePool.coins(i);
            if(poolTokens[i]==ethNative){
                poolTokens[i] = WETH; 
            }
            IPriceOracleGetter oracle = IPriceOracleGetter(addressProvider.getPriceOracle(
            ));

            amountsInPool[i] = curvePool.balances(i)*oracle.getAssetPrice(poolTokens[i])/(10**a.getDecimals(poolTokens[i]));
        }
        (, index) = min(amountsInPool); //doesn't consider decimals or asset price
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

        if (token.allowance(address(this), allowee) != 0) {
            token.safeApprove(allowee, type(uint256).max);
        } else if (token.allowance(address(this), allowee) != type(uint256).max) {
            token.safeApprove(allowee, 0);
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
        uint256 highestPayingIdx;
        uint8 i;
        bool targetIsCurveToken;
        address wantedDepositToken;
        
    }

    event TendError(bytes message);

    function tend(
        IBaseRewardsPool baseRewardsPool,
        ICurveFi curvePool,
        uint256 poolSize,
        address[] storage extraTokens,
        mapping(address => uint256) storage extraRewardsTended,
        ILendingPoolAddressesProvider addressProvider,
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
            vars.wantedDepositToken,
            vars.highestPayingIdx
        ) = checkForHighestPayingToken(curvePool, poolSize, addressProvider);
        vars.targetIsCurveToken = false;
        
        console.log("wantedDepositToken: ", vars.wantedDepositToken);

        if(vars.wantedDepositToken==ThreeCrv){ //edge case of trying to get 3crv, which cannot be traded for
            //either change this to frax, or optimize by swapping into usdc or something and getting 3crv
            // vars.wantedDepositToken = 0x853d955aCEf822Db058eb8505911ED77F175b99e; 
            // vars.highestPayingIdx = 0;
            vars.targetIsCurveToken = true;
            //3crv hardcoded            
            (
                vars.wantedDepositToken,
                vars.highestPayingIdx
            ) = checkForHighestPayingToken(ThreeCrvRegistryExchange, 3, addressProvider);
            console.log("changed wantedDepositToken: ", vars.wantedDepositToken);
        }

        
		//computeSwapPath will now swap the tokens and return the amount received
        for (vars.i = 0; vars.i < extraTokens.length; vars.i++) {
            extraRewardsTended[extraTokens[vars.i]] = IERC20(extraTokens[vars.i])
                .balanceOf(address(this));

             computeSwapPath(
                extraTokens[vars.i],
                vars.wantedDepositToken,
				extraRewardsTended[extraTokens[vars.i]]
            );
		}

        computeSwapPath(
            address(crvToken),
            vars.wantedDepositToken,
			tendData.crvTended
        );

        computeSwapPath(
            address(cvxToken),
            vars.wantedDepositToken,
			tendData.cvxTended
        );

        // if(wantedDepositToken == ethNative){ //should all be WETH now, convert WETH to ETH
        //     IWETH(WETH).withdraw(IERC20(WETH).balanceOf(address(this)));
        // }

        //get the lowest balance coin in the pool for max lp tokens on deposit
        depositAmountWanted = IERC20(vars.wantedDepositToken).balanceOf(
            address(this)
        );
		console.log("depositAmountWanted: ", depositAmountWanted); 

        index = vars.highestPayingIdx;

        if(vars.targetIsCurveToken){
            for (uint8 i = 0; i < 3; i++) {
                // approval for the strategy to deposit tokens into LP
                tokenAllowAll(
                    ThreeCrvRegistryExchange.coins(i),
                    address(ThreeCrvRegistryExchange)
                );
            }
            addLiquidityToCurve(3, depositAmountWanted, index, ThreeCrvRegistryExchange);
            depositAmountWanted = IERC20(ThreeCrv).balanceOf(
                address(this)
            );
            index = 1;
        }
    }

    function addLiquidityToCurve(uint256 poolSize, uint256 depositAmountWanted, uint256 index, ICurveFi curvePool) public{
       require(depositAmountWanted>0, "Strategy tend error: Not enough rewards to tend efficiently");
       //returns a dynamic array filled with the amounts in the index we need for curve
       
        uint256[] memory amounts = getLiquidityAmountsArray(
            poolSize,
            depositAmountWanted,
            index
        );

        //return a fixed size array based on input within one function rather this disgusting mess
        if (poolSize == 2) {
            curvePool.add_liquidity(
                getFixedArraySizeTwo(amounts),
                0
            );
        } else if (poolSize == 3) {
            curvePool.add_liquidity(
                getFixedArraySizeThree(amounts),
                0
            );
        } else {
            curvePool.add_liquidity(
                getFixedArraySizeFour(amounts),
                0
            );
        }
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
