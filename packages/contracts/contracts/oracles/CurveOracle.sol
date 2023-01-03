// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0; 

import {ICurvePool} from "./interfaces/ICurvePoolV1.sol"; 
import {ICurveOracle} from "./interfaces/ICurveOracle.sol"; 
import {vMath} from "./libs/vMath.sol"; 

//used for all curveV1 amd V2 tokens, no need to redeploy
library CurveOracle {
	
	//where total supply is the total supply of the LP token in the pools calculated using the virtual price
	function get_price_v1(address curve_pool, uint256[] memory prices) internal view returns(uint256) {
		uint256 virtual_price = ICurvePool(curve_pool).get_virtual_price(); 
		
		uint256 lp_price = calculate_v1_token_price(
			virtual_price,
			prices
		);	
		
		return lp_price; 	
		
	}

	//where virtual price is the price of the pool in USD
	//returns lp_value = virtual price x min(prices); 
	function calculate_v1_token_price(
		uint256 virtual_price,
		uint256[] memory prices
	) public pure returns(uint256) {

		uint256 min = vMath.min(prices); 
		return (virtual_price * min) / 1e18; 
	}

	function get_price_v2(address curve_pool, uint256[] memory prices) internal view returns(uint256) {
		uint256 virtual_price = ICurvePool(curve_pool).get_virtual_price(); 

		uint256 lp_price = calculate_v2_token_price(
			uint8(prices.length),
			virtual_price,
			prices
		);	
		
		return lp_price; 	
		
	}
	
	//returns n_token * vp * (p1 * p2 * p3) ^1/n	
	//n should only ever be 2 or 3 for v2 pools
	//returns the lp_price scaled by 1e36, so scale down by 1e36
	function calculate_v2_token_price(
		uint8 n,
		uint256 virtual_price,
		uint256[] memory prices	
	) internal pure returns(uint256) {
		uint256 product = vMath.product(prices); 
		uint256 geo_mean = vMath.geometric_mean(n, product); 
		return (n * virtual_price * geo_mean) / 1e18; 
	}

}



