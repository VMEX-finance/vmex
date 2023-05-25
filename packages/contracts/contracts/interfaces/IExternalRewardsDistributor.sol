// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IStakingRewards} from './IStakingRewards.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';

interface IExternalRewardsDistributor {

  struct UserState {
    uint256 assetBalance;
    uint256 rewardBalance;
    uint256 lastUpdateRewardPerToken;
  }

  struct StakingReward {
    IStakingRewards staking;
    IERC20 reward;
    uint256 cumulativeRewardPerToken;
    uint256 lastUpdateTimestamp;
    mapping(address => UserState) users;
  }

  event RewardConfigured(address indexed aToken, address indexed underlying, address indexed reward, address staking);
  event Harvested(address indexed underlying, uint256 rewardPerToken);
  event UserUpdated(address indexed user, address indexed aToken, address indexed underlying, uint256 rewardBalance);
  event StakingRewardClaimed(address indexed user, address indexed underlying, address indexed reward, uint256 amount);

  function batchAddStakingRewards(
      address[] calldata aTokens,
      address[] calldata stakingContracts,
      address[] calldata rewards
  ) external;

  function claimStakingReward(address underlying, uint256 amount) external;

  function batchClaimStakingRewards(
    address[] calldata assets,
    uint256[] calldata amounts
  ) external;

  function getUserDataByAToken(address user, address aToken) external view returns (UserState memory);

  function getDataByAToken(address aToken) external view
  returns (address, address, address, uint256, uint256);
}
