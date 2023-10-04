// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {vMath} from "./libs/vMath.sol";
import {FixedPointMathLib} from "../../dependencies/solmate/FixedPointMathLib.sol"; 
import {IVeloPair} from "../../interfaces/IVeloPair.sol"; 
import {ICamelotPair} from "../../interfaces/ICamelotPair.sol"; 
import {IERC20} from "../../interfaces/IERC20WithPermit.sol"; 


library VelodromeOracle {
	using FixedPointMathLib for *; 
		
	/**
     * @dev Gets the price of a velodrome lp token
     * @param lp_token The lp token address
     * @param prices The prices of the underlying in the liquidity pool, there must be 18 decimals
     **/
	//@dev assumes oracles only pass in wad scaled decimals for ALL prices
	function get_lp_price(address lp_token, uint256[] memory prices, uint256 priceDecimals) internal view returns(uint256) {
		IVeloPair token = IVeloPair(lp_token); 	
		uint256 total_supply = IERC20(lp_token).totalSupply()* 1e18 / (10**IERC20(lp_token).decimals()); //force to be 18 decimals
		(uint256 d0, uint256 d1, uint256 r0, uint256 r1, bool stable, ,) = token.metadata(); 

		r0 *= 1e18 / d0; 
		r1 *= 1e18 / d1; 
	
		if (stable) {
			return calculate_stable_lp_token_price(
				total_supply, 
				prices[0],
				prices[1],
				r0,
				r1,
				priceDecimals
			); 
		} else {
			return calculate_lp_token_price(
				total_supply, 
				prices[0],
				prices[1],
				r0,
				r1
			); 
		}
	}

	/**
     * @dev Gets the price of a velodrome lp token
     * @param lp_token The lp token address
     * @param prices The prices of the underlying in the liquidity pool, there must be 18 decimals
     **/
	//@dev assumes oracles only pass in wad scaled decimals for ALL prices
	function get_cmlt_lp_price(address lp_token, uint256[] memory prices, uint256 priceDecimals) internal view returns(uint256) {
		ICamelotPair token = ICamelotPair(lp_token); 	
		uint256 total_supply = IERC20(lp_token).totalSupply()* 1e18 / (10**IERC20(lp_token).decimals()); //force to be 18 decimals
		uint256 d0 = token.precisionMultiplier0();
		uint256 d1 = token.precisionMultiplier1();
		(uint256 r0, uint256 r1, , ) = token.getReserves(); 
		bool stable = token.stableSwap();

		r0 *= 1e18 / d0; 
		r1 *= 1e18 / d1; 
	
		if (stable) {
			return calculate_stable_lp_token_price(
				total_supply, 
				prices[0],
				prices[1],
				r0,
				r1,
				priceDecimals
			); 
		} else {
			return calculate_lp_token_price(
				total_supply, 
				prices[0],
				prices[1],
				r0,
				r1
			); 
		}
	}
	
	//where total supply is the total supply of the LP token
	//formula solves xy = k curves only
	//assumes that prices passed in are already properly WAD scaled
	function calculate_lp_token_price(
		uint256 total_supply,
		uint256 price0,
		uint256 price1,
		uint256 reserve0,
		uint256 reserve1
	) internal pure returns (uint256) {
		uint256 a = vMath.nthroot(2, reserve0 * reserve1); //ends up with same number of decimals as reserve0 or reserve1 without loss of precision, which should be 18
		uint256 b = vMath.nthroot(2, price0 * price1); //same number of dec as price0 or price1, should be chainlink agg (op: 8)
		uint256 c = 2 * a * b / total_supply; //must end up as num decimals as prices since total supply is guaranteed to be 18

		return c; 
	}
	
	//solves for cases where curve is x^3 * y + y^3 * x = k  
	//fair reserves math formula author: @ksyao2002
	function calculate_stable_lp_token_price(
		uint256 total_supply,
		uint256 price0,
		uint256 price1,
		uint256 reserve0,
		uint256 reserve1,
		uint256 priceDecimals
	) internal pure returns (uint256) {
		uint256 k = getK(reserve0, reserve1); 
		//fair_reserves = ( (k * (price0 ** 3) * (price1 ** 3)) )^(1/4) / ((price0 ** 2) + (price1 ** 2));  
		price0 *= 1e18 / (10**priceDecimals); //convert to 18 dec
		price1 *= 1e18 / (10**priceDecimals); 
		uint256 a = FixedPointMathLib.rpow(price0, 3, 1e18); //keep same decimals as chainlink
		uint256 b = FixedPointMathLib.rpow(price1, 3, 1e18);  
		uint256 c = FixedPointMathLib.rpow(price0, 2, 1e18);  
		uint256 d = FixedPointMathLib.rpow(price1, 2, 1e18);  

		uint256 p0 =k * FixedPointMathLib.mulWadDown(a, b); //2*18 decimals
		
		uint256 fair = p0 / (c + d); // number of decimals is 18

		// each sqrt divides the num decimals by 2. So need to replenish the decimals midway through with another 1e18
		uint256 frth_fair = FixedPointMathLib.sqrt(FixedPointMathLib.sqrt(fair  * 1e18) * 1e18); // number of decimals is 18
		
		return 2 * ((frth_fair * (10**priceDecimals) ) / total_supply); // converts to chainlink decimals
	}

	function getK(uint256 x, uint256 y) internal pure returns (uint256) {
		//x, n, scalar	
		uint256 x_cubed = FixedPointMathLib.rpow(x, 3, 1e18); 
		uint256 newX = FixedPointMathLib.mulWadDown(x_cubed, y); 
		uint256 y_cubed = FixedPointMathLib.rpow(y, 3, 1e18); 
		uint256 newY = FixedPointMathLib.mulWadDown(y_cubed, x); 
	
		return newX + newY;  //18 decimals
	}

}








