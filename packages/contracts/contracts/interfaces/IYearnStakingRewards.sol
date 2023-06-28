// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';

interface IYearnStakingRewards {
  // Views

  function balanceOf(address account) external view returns (uint256);

  function earned(address account) external view returns (uint256);

  function getRewardForDuration() external view returns (uint256);

  function lastTimeRewardApplicable() external view returns (uint256);

  function rewardPerToken() external view returns (uint256);

  function rewardsToken() external view returns (IERC20);

  function stakingToken() external view returns (IERC20);

  function totalSupply() external view returns (uint256);

  // Mutative

  function exit() external;

  function getReward() external;

  function stake(uint256 amount) external;

  function withdraw(uint256 amount) external;
}
