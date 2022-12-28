// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0; 


interface IYearnToken {
	
	function totalAssets() external view returns(uint256); 
	function totalSupply() external view returns(uint256); 
}
