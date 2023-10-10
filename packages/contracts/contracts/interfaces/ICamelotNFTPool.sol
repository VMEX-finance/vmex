// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19; 


interface ICamelotNFTPool {
	function createPosition(uint256 amount, uint256 lockDuration) external; 
	function addToPosition(uint256 tokenId, uint256 amountToAdd) external; 
	function withdrawFromPosition(uint256 tokenId, uint256 amountToWithdraw) external; 
	function harvestPosition(uint256 tokenId) external;
	function lastTokenId() external view returns(uint256);

	// function onNFTHarvest(address operator, address to, uint256 tokenId, uint256 grailAmount, uint256 xGrailAmount) external view returns (bool);
	// function onNFTAddToPosition(address operator, uint256 tokenId, uint256 lpAmount) external returns (bool);
	// function onNFTWithdraw(address operator, uint256 tokenId, uint256 lpAmount) external returns (bool);
}
