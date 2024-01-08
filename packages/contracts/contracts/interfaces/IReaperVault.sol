// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0; 

interface IReaperVault {

	function asset() external view returns (address); 
	function decimals() external view returns (uint256); 
	function getPricePerFullShare() external view returns (uint256); 

}
