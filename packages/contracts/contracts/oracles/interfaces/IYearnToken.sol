// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17; 


interface IYearnToken {
	
	function totalAssets() external view returns(uint256); 
	function totalSupply() external view returns(uint256); 
	function pricePerShare() external view returns(uint256);
	function token() external view returns(address);
	function decimals() external view returns(uint256);
}
