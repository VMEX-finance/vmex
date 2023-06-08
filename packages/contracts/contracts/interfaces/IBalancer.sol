// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0; 
import {IVault} from "./IVault.sol"; 


interface IBalancer {

	function getPoolId() external returns (bytes32 poolID); 
	function getVault() external returns (IVault vaultAddress); 
	function getInvariant() external returns (uint256); 
	function totalSupply() external returns (uint256); 
	function getActualSupply() external returns (uint256); 
	function getVirtualSupply() external returns (uint256); 
	function getNormalizedWeights() external returns (uint256[] memory); 
	function getNumTokens() external view returns (uint256); 
	function getFinalTokens() external view returns (address[] memory);
	function getRate() external view returns (uint256); 
	function decimals() external view returns (uint8); 

}
