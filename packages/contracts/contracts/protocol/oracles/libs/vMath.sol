// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19; 

import {FixedPointMathLib} from "../../../dependencies/solady/FixedPointMathLib.sol";
import {Math} from "../../../dependencies/openzeppelin/contracts/utils/math/Math.sol";

library vMath {

    uint256 internal constant WAD = 1e18; // The scalar of ETH and most ERC20s.
	
	function min(uint256[] memory array) internal pure returns(uint256) {
		uint256 _min = array[0];
		uint256 length = array.length;
		for (uint256 i = 1; i < length;) {
			if (_min > array[i]) {
				_min = array[i]; 
			}

			unchecked { ++i; }
		}
		return _min; 
	}

	function weightedAvg(uint256[] calldata prices, uint256[] calldata balances, uint8[] calldata decimals) internal pure returns(uint256) {
		uint256 cumSum;
		uint256 cumBalances;
		uint256 length = prices.length;
		for(uint256 i; i<length;) {
			cumSum += prices[i]*balances[i]/10**decimals[i]; //18 decimals
			cumBalances += balances[i]*1e18/10**decimals[i]; //18 decimals

			unchecked { ++i; }
		}

		return cumSum * 1e18 / cumBalances; //18 decimals
	}

	function product(uint256[] memory nums) internal pure returns(uint256) {
		uint256 _product = nums[0];
		uint256 length = nums.length;
		for (uint256 i = 1; i < length;) {
			_product *= nums[i]; 

			unchecked { ++i; }
		}
		return _product; 
	}
	
	//limited to curve pools only, either 2 or 3 assets (mostly 2) 
	function nthroot(uint8 n, uint256 val) internal pure returns(uint256) {
		//VMEX empirically checked that this is only accurate for square roots and cube roots, and the decimals are 9 and 12 respectively
		if(n==2){
			return Math.sqrt(val);
		}
		if(n==3){
			return FixedPointMathLib.cbrt(val);
		}
		revert("Math only can handle square roots and cube roots");
	}

}
