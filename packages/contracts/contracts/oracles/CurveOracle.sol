// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0; 

import {ICurvePool} from "./interfaces/ICurvePoolV1.sol"; 
import {ICurveOracle} from "./interfaces/ICurveOracle.sol"; 
import {vMath} from "./libs/vMath.sol"; 

//used for all curveV1 tokens, no need to redeploy
contract CurveOracleV1 is ICurveOracle {
	
	//where total supply is the total supply of the LP token in the pools calculated using the virtual price
	function get_price(address curve_pool, uint256[] memory prices) external override view returns(uint256) {
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

}



