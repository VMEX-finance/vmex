// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0; 

import {IERC20} from "../../interfaces/IERC20WithPermit.sol"; 
import {IBeefyVault} from "../../interfaces/IBeefyVault.sol";


contract BeefyOracle {
	
	//attempting to use a Time Weighted Average Supply (TWAS) to avoid price manipulation of the underlying vault tokens
	mapping(address=>uint256) public underlying_supply_cumulative_last; 
	mapping(address=>uint256) public beefy_supply_cumulative_last; 
	mapping(address=>uint256) public timestamp_last; //maps beefy address to timestamp

	mapping(address=>uint256) public last_underlying_average_supply; 
	mapping(address=>uint256) public last_beefy_average_supply; 


	uint256 private constant PERIOD = 3 minutes; //this can be changed to whatever we want on deploy


	//@param underlying_lp_price - takes underlying lp price using appropriate oracle
	//token prices will be needed for that computation, this accepts the result of that 
	//@param underlying_token - the address of the want token of the beefy vault
	//@param beefy_vault - the address of the beefy vault we are pricing
	function get_beefy_price(
		uint256 underlying_lp_price, 
		address underlying_token, 
		address beefy_vault
	) external returns (uint256) {

		uint256 time_elapsed = block.timestamp - timestamp_last[beefy_vault];  
		uint256 underlying_supply;
		uint256 beefy_supply; 	

		if (time_elapsed > PERIOD || 
			underlying_supply_cumulative_last[underlying_token] == 0 || 
			beefy_supply_cumulative_last[beefy_vault] == 0) {
				(underlying_supply, beefy_supply) = 
				update_supply(underlying_token, beefy_vault, time_elapsed); 
		} else {
			underlying_supply = underlying_supply_cumulative_last[underlying_token]; 	
			beefy_supply = beefy_supply_cumulative_last[beefy_vault]; 
		}

		uint256 beefy_price = calculate_beefy_price(
			underlying_lp_price,
			underlying_supply,
			beefy_supply
		); 	

			return beefy_price; 
		}

	function update_supply(
		address underlying_token, 
		address beefy_vault, 
		uint256 time_elapsed
	) internal returns(uint256, uint256) {
		
		uint256 underlying_supply_cumulative = underlying_supply_cumulative_last[underlying_token] + (IBeefyVault(beefy_vault).balance() * time_elapsed); 
		uint256 beefy_supply_cumulative = 
			beefy_supply_cumulative_last[beefy_vault] + (IERC20(beefy_vault).totalSupply() * time_elapsed); 

		uint256 underlying_supply_average = 
			(underlying_supply_cumulative - underlying_supply_cumulative_last[underlying_token]) / time_elapsed; 
		uint256 beefy_supply_average = 
			(beefy_supply_cumulative - beefy_supply_cumulative_last[beefy_vault]) / time_elapsed; 

		timestamp_last[beefy_vault] = block.timestamp;
		underlying_supply_cumulative_last[underlying_token] = underlying_supply_cumulative; 
		beefy_supply_cumulative_last[beefy_vault] = beefy_supply_cumulative; 


		return (underlying_supply_average, beefy_supply_average); 
	}	



	function calculate_beefy_price(
		uint256 underlying_lp_price,
		uint256 underlying_supply,
		uint256 beefy_vault_supply
	) internal pure returns (uint256) {
		
		return (underlying_lp_price * underlying_supply) / beefy_vault_supply; 

	}


}
