// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19; 


interface ICurveRewardGauge {
	function deposit(uint256 amount) external; 
	function withdraw(uint256 amount) external; 
	function claim_rewards() external; 
}
