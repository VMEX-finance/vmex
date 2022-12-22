// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {FixedPointMathLib} from "./libs/FixedPointMathLib.sol";
import {IUniswapV3Pool} from "./uniswapv08/v3-core/interfaces/IUniswapV3Pool.sol"; 
import {INonfungiblePositionManager} from "./interfaces/INonfungiblePositionManager.sol"; 
import {LiquidityAmounts} from "./libs/LiquidityAmounts.sol"; 
import {TickMath} from "./uniswapv08/v3-core/TickMath.sol"; 


contract UniV3Oracle {
	using FixedPointMathLib for *; 

	address internal constant NFT_POS_MANAGER = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88; 
		
	
	//prices MUST be in the order they appear in the pool, EX. DAI/WETH must pass in DAI first in the array
	function get_lp_v3_price(
		address pool, 
		uint256 token_id,
	   	uint256[] memory prices) public view returns(uint256) {

		//nft token info 
		(
			, //nonce 
			, //operator
			, //token0 address 
			, //token1 address 
			, //fee
			int24 tick_lower,
			int24 tick_upper,
			uint128 liquidity, //how much the position holds in "LP tokens" (wrapped in NFT) (?)
			, //feeGrowthToken0 
			, //feeGrowthToken1 
			uint128 token0_owed, //added to calc since they are available on redemption
			uint128 token1_owed 
		) = INonfungiblePositionManager(NFT_POS_MANAGER).positions(token_id); 

			(uint256 token0_amount, uint256 token1_amount) = get_amounts_from_liquidity(
				pool,
				tick_lower,
				tick_upper,
				liquidity
			);	

			uint256 lp_price = calculate_lp_token_price(
				token0_amount,
				token1_amount,
				prices[0],
				prices[1],
				token0_owed,
				token1_owed
			);

			return lp_price; 
	}
	
	//stack too deep, had to separate into new func
	function get_amounts_from_liquidity(
		address pool,
		int24 tick_lower,
		int24 tick_upper,
		uint128 liquidity
	) internal view returns(uint256, uint256) {	
		(uint160 sqrtPriceX96, , , , , , ) = IUniswapV3Pool(pool).slot0();
		uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tick_lower);
        uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tick_upper);

		(uint256 token0_amount, uint256 token1_amount) =
		   	LiquidityAmounts.getAmountsForLiquidity(
				sqrtPriceX96,
				sqrtRatioAX96,
				sqrtRatioBX96,
				liquidity
			);

		return (token0_amount, token1_amount);  
			
	}
	
	//pricing the univ3 position based on the underlying locked liquidity + the amount owed 	
	//returns a 1e36 scaled uint of the position priced in USD
	function calculate_lp_token_price(
		uint256 amount0,
		uint256 amount1,
		uint256 price0,
		uint256 price1,
		uint128 token0_owed,
		uint128 token1_owed
	) internal pure returns (uint256) {
		uint256 a = (amount0 + token0_owed) * price0; 
		uint256 b = (amount1 + token1_owed) * price1;
	
		//return total amount in USD locked in position	
		return a + b; 
	}	
}
