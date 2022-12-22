// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0; 

import {IERC20} from "./interfaces/IERC20.sol"; 
import {IYearnToken} from "./interfaces/IYearnToken.sol"; 

//assuming we can price these like convex positions? 
contract YearnOracle {

	mapping(address=>uint256) public underlying_supply_cumulative_last; 
	mapping(address=>uint256) public yvault_supply_cumulative_last; 
	mapping(address=>uint256) public timestamp_last; //maps yvault address to timestamp

	mapping(address=>uint256) public last_underlying_average_supply; 
	mapping(address=>uint256) public last_yvault_average_supply; 

	uint256 private constant PERIOD = 3 minutes; 

	function get_yearn_price(
		uint256 underlying_price,
		address underlying_token,
		address yvault) external returns(uint256) {

			uint256 time_elapsed = block.timestamp - timestamp_last[yvault];  
			uint256 underlying_supply;
			uint256 yvault_supply; 	

			if (time_elapsed > PERIOD || 
				underlying_supply_cumulative_last[underlying_token] == 0 || 
				yvault_supply_cumulative_last[yvault] == 0) {
					(underlying_supply, yvault_supply) = update_supply(underlying_token, yvault, time_elapsed); 
			} else {
				underlying_supply = underlying_supply_cumulative_last[underlying_token]; 	
				yvault_supply = yvault_supply_cumulative_last[yvault]; 
			}

		//return the price of the yearn vault token		
			uint256 yvault_price = calculate_yvault_price(
				underlying_price,
				underlying_supply,
				yvault_supply
			); 

			return yvault_price; 
	}

	function update_supply(address underlying_token, address yvault, uint256 time_elapsed) internal returns(uint256, uint256) {
		
		uint256 underlying_supply_cumulative = underlying_supply_cumulative_last[underlying_token] + (IYearnToken(yvault).totalAssets() * time_elapsed); 
		uint256 yvault_supply_cumulative = yvault_supply_cumulative_last[yvault] + (IERC20(yvault).totalSupply() * time_elapsed); 

		uint256 underlying_supply_average = (underlying_supply_cumulative - underlying_supply_cumulative_last[underlying_token]) / time_elapsed; 
		uint256 yvault_supply_average = (yvault_supply_cumulative - yvault_supply_cumulative_last[yvault]) / time_elapsed; 

		timestamp_last[yvault] = block.timestamp;
		underlying_supply_cumulative_last[underlying_token] = underlying_supply_cumulative; 
		yvault_supply_cumulative_last[yvault] = yvault_supply_cumulative; 


		return (underlying_supply_average, yvault_supply_average); 
	}	



	function calculate_yvault_price(
		uint256 underlying_price,
		uint256 underlying_supply,
		uint256 yvault_supply) internal pure returns(uint256) {

			return (underlying_price * underlying_supply) / yvault_supply; 	
	}

}
