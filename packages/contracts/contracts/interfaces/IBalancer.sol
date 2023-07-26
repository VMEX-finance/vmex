// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0; 
import {IVault} from "./IVault.sol"; 


interface IBalancer {

	function getPoolId() external view returns (bytes32 poolID); 
	function getVault() external view returns (IVault vaultAddress); 
	function getInvariant() external returns (uint256); 
	function totalSupply() external returns (uint256); 
	function getActualSupply() external returns (uint256); 
	function getVirtualSupply() external returns (uint256); 
	function getNormalizedWeights() external returns (uint256[] memory); 
	function getNumTokens() external view returns (uint256); 
	function getRateProviders() external view returns (address[] memory);
	function getFinalTokens() external view returns (address[] memory);
	function getRate() external view returns (uint256); 
	function getBptIndex() external view returns (uint256); 
	function getTokenRate(address) external view returns (uint256); 
	function decimals() external view returns (uint8); 

}
