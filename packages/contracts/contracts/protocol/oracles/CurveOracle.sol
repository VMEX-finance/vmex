// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17; 

import {ICurvePool} from "../../interfaces/ICurvePool.sol"; 
import {vMath} from "./libs/vMath.sol"; 

//used for all curveV1 amd V2 tokens, no need to redeploy
library CurveOracle {
	//Helper to prevent read-only re-entrancy attacks with virtual price
	//Maybe this is only needed if the underlying has ETH.
	function get_virtual_price_reentrant_protected(address curve_pool, uint256 numTokens) internal returns(uint256 virtual_price) {
		//makerdao uses remove_liquidity to trigger reentrancy lock
        //exchange is also reentrancy locked, so I'm assuming it will do what we want
		if(numTokens==2){
			uint256[2] memory amounts;
        	ICurvePool(curve_pool).remove_liquidity(0, amounts);
		}
		if(numTokens==3){
			uint256[3] memory amounts;
        	ICurvePool(curve_pool).remove_liquidity(0, amounts);
		}
		if(numTokens==4){
			uint256[4] memory amounts;
        	ICurvePool(curve_pool).remove_liquidity(0, amounts);
		}

		virtual_price = ICurvePool(curve_pool).get_virtual_price(); 
	}
	
	//where total supply is the total supply of the LP token in the pools calculated using the virtual price
	function get_price_v1(address curve_pool, uint256[] memory prices) internal returns(uint256) {
	//prevent read-only reentrancy -- possibly a better way than this
		require(prices.length > 1, "invalid pool length");
		
		uint256 virtual_price = get_virtual_price_reentrant_protected(curve_pool, prices.length); 
		
		uint256 lp_price = calculate_v1_token_price(
			virtual_price,
			prices
		);	
		
		return lp_price; 	
		
	}

	//where virtual price is the price of the pool in USD
	//returns lp_value = virtual price * min(prices); 
	function calculate_v1_token_price(
		uint256 virtual_price,
		uint256[] memory prices
	) internal pure returns(uint256) {

		uint256 min = vMath.min(prices); 
		return (virtual_price * min) / 1e18; 
	}

	function get_price_v2(address curve_pool, uint256[] memory prices) internal returns(uint256) {
        uint256 virtual_price = get_virtual_price_reentrant_protected(curve_pool, prices.length);

		uint256 lp_price = calculate_v2_token_price(
			uint8(prices.length),
			virtual_price,
			prices
		);	
		
		return lp_price; 	
		
	}
	
	//returns n_token * vp * (p1 * p2 * p3) ^1/n	
	//n should only ever be 2 or 3 for v2 pools
	//returns the lp_price scaled by 1e36, so scale down by 1e18
	function calculate_v2_token_price(
		uint8 n,
		uint256 virtual_price,
		uint256[] memory prices	
	) internal pure returns(uint256) {
		uint256 product = vMath.product(prices); 
		uint256 geo_mean = vMath.nthroot(n, product); 
		return (n * virtual_price * geo_mean) / 1e18; 
	}

}