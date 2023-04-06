// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {vMath} from "./libs/vMath.sol";
import {IVeloPair} from "../../interfaces/IVeloPair.sol"; 
import {IERC20} from "../../interfaces/IERC20WithPermit.sol"; 

//some minor differences to univ2 pairs, but mostly the same
library VelodromeOracle {
	function get_lp_price(address lp_token, uint256[] memory prices) internal view returns(uint256) {
		IVeloPair token = IVeloPair(lp_token); 	
		uint256 total_supply = IERC20(lp_token).totalSupply(); 
		uint256 decimals = 10**token.decimals();
		(uint256 d0, uint256 d1, uint256 r0, uint256 r1, , ,) = token.metadata(); 

		//converts to number of decimals that lp token has, regardless of original number of decimals that it has
		//this is independent of chainlink oracle denomination in USD or ETH
		uint256 reserve0 = (r0 * decimals) / d0; 
		uint256 reserve1 = (r1 * decimals) / d1; 
		
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
	//assumes that prices passed in are already properly WAD scaled
	function calculate_lp_token_price(
		uint256 total_supply,
		uint256 price0,
		uint256 price1,
		uint256 reserve0,
		uint256 reserve1
	) internal pure returns (uint256) {
		uint256 a = vMath.nthroot(2, reserve0 * reserve1); //square root
		uint256 b = vMath.nthroot(2, price0 * price1); //this is in decimals of chainlink oracle
		//we want a and total supply to have same number of decimals so c has decimals of chainlink oracle
		uint256 c = 2 * a * b / total_supply; 

		return c; 
	}

}








