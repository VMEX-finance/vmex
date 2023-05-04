// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19; 

import {ICurvePool} from "../../interfaces/ICurvePool.sol"; 
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol"; 
import {vMath} from "./libs/vMath.sol"; 
import {Errors} from "../libraries/helpers/Errors.sol";

//used for all curveV1 amd V2 tokens, no need to redeploy
library CurveOracle {
	/**
     * @dev Helper to prevent read-only re-entrancy attacks with virtual price. Only needed if the underlying has ETH.
     * @param curve_pool The curve pool address (not the token address!)
     **/
	function check_reentrancy(address curve_pool) internal {
		//makerdao uses remove_liquidity to trigger reentrancy lock
        //exchange is also reentrancy locked, so I'm assuming it will do what we want
		bool success = false;
		(success, ) = curve_pool.call(
			abi.encodeWithSignature("claim_admin_fees()")
		);
		if (!success) {
			(success, ) = ICurvePool(curve_pool).owner().call(
				abi.encodeWithSignature("withdraw_admin_fees()")
			);
			require(success, Errors.VO_REENTRANCY_GUARD_FAIL);
		}
		
	}
	
	/**
     * @dev Calculates the value of a curve v1 lp token
     * @param curve_pool The curve pool address (not the token address!)
     * @param prices The price of the underlying assets in the curve pool
     * @param checkReentrancy Whether reentrancy check is needed
     **/
	function get_price_v1(address curve_pool, uint256[] memory prices, uint8[] memory decimals, bool checkReentrancy) internal returns(uint256) {
	//prevent read-only reentrancy -- possibly a better way than this
		assert(prices.length > 1);
		
		if(checkReentrancy){
			check_reentrancy(curve_pool);
		}
		uint256 virtual_price = ICurvePool(curve_pool).get_virtual_price();


        uint256[] memory balances = new uint256[](prices.length);

		for(uint i = 0;i<prices.length;i++) {
			balances[i] = ICurvePool(curve_pool).balances(i);
		}

		uint256 avgPrice = vMath.weightedAvg(prices, balances, decimals);
		
		
		uint256 lp_price = calculate_v1_token_price(
			virtual_price,
			avgPrice
		);	
		
		return lp_price; 	
		
	}

	//where virtual price is the price of the pool in USD
	//returns lp_value = virtual price * weighted average(prices); 
	function calculate_v1_token_price(
		uint256 virtual_price,
		uint256 avgPrice
	) internal pure returns(uint256) {
		// divide by virtual price decimals, which is always 18 for all existing curve pools.
		return (virtual_price * avgPrice) / 1e18; //decimals equal to the number of decimals in chainlink price
	}

	/**	
     * @dev Calculates the value of a curve v2 lp token (not pegged)
     * @param curve_pool The curve pool address (not the token address!)
     * @param prices The price of the underlying assets in the curve pool
     * @param checkReentrancy Whether reentrancy check is needed
     **/
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