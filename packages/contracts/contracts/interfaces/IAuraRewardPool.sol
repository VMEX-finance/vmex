// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19; 


interface IAuraRewardPool {
	function deposit(uint256 assets, address receiver) external returns(uint256); 
	function withdrawAndUnwrap(uint256 amount, bool claim) external returns(bool); 
	function getReward(address _account, bool _claimExtras) external returns(bool); 
	function operator() external view returns(address); 
	function pid() external view returns(uint256); 
}
