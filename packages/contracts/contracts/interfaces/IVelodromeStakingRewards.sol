// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

interface IVelodromeStakingRewards {
  function deposit(uint256 amount, uint tokenId) external;

  function withdraw(uint256 amount) external;
  function getReward(address account, address[] memory tokens) external;
}
