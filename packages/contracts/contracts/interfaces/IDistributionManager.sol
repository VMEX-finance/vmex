// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {DistributionTypes} from '../protocol/libraries/types/DistributionTypes.sol';

interface IDistributionManager {
  /**
   * @dev Used to initialize a reward stream from a given asset
   * @param emissionsPerSecond The reward emissions per second
   * @param endTimestamp The timestamp that rewards stop streaming
   * @param incentivizedAsset The incentivized asset (likely the vToken)
   * @param reward The asset being rewarded
   **/
  struct RewardConfig {
    uint128 emissionPerSecond;
    uint128 endTimestamp;
    address incentivizedAsset;
    address reward;
  }

  event RewardConfigUpdated(
    address indexed asset,
    address indexed reward,
    uint128 emission,
    uint128 end,
    uint256 index
  );

  event RewardAccrued(
    address indexed asset,
    address indexed reward,
    address indexed user,
    uint256 newIndex,
    uint256 amount
  );

  function configureRewards(RewardConfig[] calldata config) external;

  function getUserRewardIndex(
    address user,
    address reward,
    address asset
  ) external view returns (uint256);

  function getRewardsData(
    address asset,
    address reward
  ) external view returns (uint256, uint256, uint256, uint256);

  function getAccruedRewards(address user, address reward) external view returns (uint256);
}
