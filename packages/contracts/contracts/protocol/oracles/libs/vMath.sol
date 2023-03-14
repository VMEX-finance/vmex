// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17; 

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

	function product(uint256[] memory nums) internal pure returns(uint256) {
		uint256 _product = nums[0]; 
		for (uint256 i = 1; i < nums.length; i++) {
			_product *= nums[i]; 
		}
		return _product; 
	}
	
	//limited to curve pools only, either 2 or 3 assets (mostly 2) 
	function geometric_mean(uint8 n, uint256 _product) internal pure returns(uint256) {
		return LogExpMath.pow(_product, 1e18 / n)/1e12;
	}

}
