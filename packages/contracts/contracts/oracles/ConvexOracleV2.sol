// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0; 

import {IVoterProxy} from "./interfaces/IVoterProxy.sol"; 
import {CurveOracleV2} from "./CurveOracleV2.sol";  
import {FixedPointMathLib} from "./libs/FixedPointMathLib.sol";
import {IERC20} from "./interfaces/IERC20.sol"; 


//where convexV2 is just convex but with curve v2 tokens
contract ConvexOracleV2 {

	//address private constant BOOSTER = 0xF403C135812408BFbE8713b5A23a04b3D48AAE31; //convex deposit contract
	address private immutable PROXY = 0x989AEb4d175e16225E39E87d0D97A3360524AD80; //convex's staker is immutable, so ours can be too, no need to add ability to change

	CurveOracleV2 private curve_oracle; 
	mapping(address=>uint256) public curve_supply_cumulative_last; //maps the curve lp address to the supply_cumulative
	mapping(uint16=>uint256) public convex_supply_cumulative_last; //maps the convex pid to the supply_cumulative 
	mapping(uint256=>uint256) public timestamp_last; //store the last timestamp for each given convex pool for twas 

	//store last avg in case enough time hasn't passed
	mapping(address=>uint256) public last_curve_average_supply; 
	mapping(uint16=>uint256) public last_convex_average_supply; //pid is uint16

	uint256 private constant PERIOD = 3 minutes; 

	constructor(CurveOracleV2 _curve_oracle) { 
		curve_oracle = _curve_oracle; 
	}

	//get curve lp tokens price, get convex lp token "depositToken", divide
	function get_convex_price(
		address curve_pool, 
		uint256[] memory prices,
		uint16 pid, 
		address curve_lp, 
		address convex_lp,
		address curve_gauge) external returns(uint256) {
			uint256 curve_lp_price = curve_oracle.get_price(curve_pool, prices); //returns 1e36 scaled uint

			uint time_elapsed = block.timestamp - timestamp_last[pid]; 	
			uint256 curve_supply; 
			uint256 convex_supply; 

			if (time_elapsed > PERIOD ||
				curve_supply_cumulative_last[curve_lp] == 0|| 
				convex_supply_cumulative_last[pid] == 0) {
					(curve_supply, convex_supply) = update_supply(
						pid, 
						curve_lp, 
						convex_lp, 
						curve_gauge,
						time_elapsed);  	
			} else {
				curve_supply = last_curve_average_supply[curve_lp]; 
				convex_supply = last_convex_average_supply[pid]; 
			}

			uint256 convex_price = calculate_convex_price(
				curve_lp_price,
				curve_supply,
				convex_supply
			); 
		
		return convex_price; 
	}	
	
	//update TWAS data by convex pool id (pid)
	//NEEDS FURTHER TESTING BUT DONE FOR NOW I THINK
	//2**16 = 65535 and convex only has around 120 pools so we good with a uint16
	function update_supply(
		uint16 pid, 
		address curve_lp, 
		address convex_lp, 
		address curve_gauge,
		uint256 time_elapsed) internal returns(uint256, uint256) { 
			//cuz internal now I don't think this is needed since we need it to run when timestamp_last == 0 on init
			//may add back in later, so just leave here for now
			//require(time_elapsed > PERIOD, "time elapsed < min period"); 
			
			//new_supply_cumulative = last_supply_cumulative + (current_supply * time_elapsed); 
			uint256 curve_supply_cumulative = curve_supply_cumulative_last[curve_lp] + (IVoterProxy(PROXY).balanceOfPool(curve_gauge) * time_elapsed); 
			uint256 convex_supply_cumulative = convex_supply_cumulative_last[pid] + (IERC20(convex_lp).totalSupply() * time_elapsed); 
			
			//supply average for the twap 	
			uint256 curve_supply_average = (curve_supply_cumulative - curve_supply_cumulative_last[curve_lp]) / time_elapsed; 
			uint256 convex_supply_average = (convex_supply_cumulative - convex_supply_cumulative_last[pid]) / time_elapsed; 

			timestamp_last[pid] = block.timestamp; 
			curve_supply_cumulative_last[curve_lp] = curve_supply_cumulative; 
			convex_supply_cumulative_last[pid] = convex_supply_cumulative; 

			last_curve_average_supply[curve_lp] = curve_supply_average; 
			last_convex_average_supply[pid] = convex_supply_average; 

			return (curve_supply_average, convex_supply_average); 
	}
	
	function calculate_convex_price(
		uint256 curve_lp_price,
		uint256 curve_supply,
		uint256 convex_supply) internal pure returns(uint256) {
		
			return (curve_lp_price * curve_supply) / convex_supply; 
	}	
}
