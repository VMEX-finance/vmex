// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17; 

import {ICurvePool} from "../../interfaces/ICurvePool.sol"; 
import {vMath} from "./libs/vMath.sol"; 

//used for all curveV1 amd V2 tokens, no need to redeploy
library CurveOracle {
	//Helper to prevent read-only re-entrancy attacks with virtual price
	//Maybe this is only needed if the underlying has ETH.
	function check_reentrancy(address curve_pool) internal {
		//makerdao uses remove_liquidity to trigger reentrancy lock
        //exchange is also reentrancy locked, so I'm assuming it will do what we want

		// bytes4 sig = bytes4(keccak256(bytes('remove_liquidity_one_coin(uint256,int128,uint256)')));
		// (bool success, ) = curve_pool.call(abi.encodeWithSelector(sig, uint256(0), int128(1), uint256(0)));
		// require(success, 'remove_liquidity_one_coin failed. Could be reentrancy detected or call failed for some other reason');

		bool success = false;
		(success, ) = curve_pool.call(
			abi.encodeWithSignature("claim_admin_fees()")
		);
		if (!success) {
			(success, ) = ICurvePool(curve_pool).owner().call(
				abi.encodeWithSignature("withdraw_admin_fees()")
			);
			require(success, "reentrancy guard not called");
		}
		
	}
	
	//where total supply is the total supply of the LP token in the pools calculated using the virtual price
	function get_price_v1(address curve_pool, uint256[] memory prices, bool checkReentrancy) internal returns(uint256) {
	//prevent read-only reentrancy -- possibly a better way than this
		require(prices.length > 1, "invalid pool length");
		
		if(checkReentrancy){
			check_reentrancy(curve_pool);
		}
		uint256 virtual_price = ICurvePool(curve_pool).get_virtual_price();
		
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
		// divide by virtual price decimals, which is always 18 for all existing curve pools.
		return (virtual_price * min) / 10**18; //decimals equal to the number of decimals in chainlink price
	}

	function get_price_v2(address curve_pool, uint256[] memory prices, bool checkReentrancy) internal returns(uint256) {
		if(checkReentrancy){
			check_reentrancy(curve_pool);
		}
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