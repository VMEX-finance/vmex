// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19; 


interface IChronosRewardGauge {
	function deposit(uint256 amount) external returns(uint _tokenId); 
	function withdrawAndHarvestAll() external; 
	function getAllReward() external; 
}
