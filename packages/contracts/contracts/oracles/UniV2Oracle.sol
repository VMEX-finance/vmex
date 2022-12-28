// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {FixedPointMathLib} from "./libs/FixedPointMathLib.sol";
import {IUniswapV2Pair} from "./interfaces/IUniswapV2Pair.sol"; 

//this contract needs to calculate a price for a given LP token and return a TWAP (unknown period length) 
contract UniV2Oracle {
	using FixedPointMathLib for *; 

	function get_lp_price(address lp_token, uint256[] memory prices) public view returns(uint256) {
		IUniswapV2Pair token = IUniswapV2Pair(lp_token); 	
		uint256 total_supply = token.totalSupply(); 
		(uint256 reserve0, uint256 reserve1, ) = token.getReserves(); 
		
		uint256 lp_price = calculate_lp_token_price(
			total_supply, 
			prices[0],
			prices[1],
			reserve0,
			reserve1
		); 

		return lp_price; 
	}
	
	//where total supply is the total supply of the LP token
	function calculate_lp_token_price(
		uint256 total_supply,
		uint256 price0,
		uint256 price1,
		uint256 reserve0,
		uint256 reserve1
	) internal pure returns (uint256) {
		uint256 a = FixedPointMathLib.sqrt(reserve0 * reserve1); 
		uint256 b = FixedPointMathLib.sqrt(price0 * price1);
		uint256 c = 2 * ((a * b) / total_supply); 

		return c; 
	}

}








