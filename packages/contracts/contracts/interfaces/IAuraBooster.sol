// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19; 


interface IAuraBooster {
	function deposit(uint256 _pid, uint256 _amount, bool _stake) external returns(bool); 
	function poolInfo(uint256 _pid) external view returns(address, address, address, address crvRewards, address, bool); 
}
