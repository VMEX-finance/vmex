// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19; 

import {LogExpMath} from "../../../dependencies/balancer/LogExpMath.sol";

library vMath {

    uint256 internal constant WAD = 1e18; // The scalar of ETH and most ERC20s.
	
	function min(uint256[] memory array) internal pure returns(uint256) {
		uint256 _min = array[0]; 
		for (uint8 i = 1; i < array.length; i++) {
			if (_min > array[i]) {
				_min = array[i]; 
			}	
		}
		return _min; 
	}

	function weightedAvg(uint256[] memory prices, uint256[] memory balances, uint8[] memory decimals) internal pure returns(uint256) {
		uint256 cumSum = 0;
		uint256 cumBalances = 0;

		for(uint i = 0;i<prices.length;i++) {
			cumSum += prices[i]*balances[i]/10**decimals[i]; //18 decimals
			cumBalances += balances[i]*1e18/10**decimals[i]; //18 decimals
		}

		return cumSum * 1e18 / cumBalances; //18 decimals
	}

	function product(uint256[] memory nums) internal pure returns(uint256) {
		uint256 _product = nums[0]; 
		for (uint256 i = 1; i < nums.length; i++) {
			_product *= nums[i]; 
		}
		return _product; 
	}
	
	//limited to curve pools only, either 2 or 3 assets (mostly 2) 
	function nthroot(uint8 n, uint256 _product) internal pure returns(uint256) {
		//VMEX empirically checked that this is only accurate for square roots and cube roots, and the decimals are 9 and 12 respectively
		if(n==2){
			return LogExpMath.pow(_product, 1e18 / n)/1e9;
		}
		if(n==3){
			return LogExpMath.pow(_product, 1e18 / n)/1e12;
		}
		revert("Balancer math only can handle square roots and cube roots");
	}

}
