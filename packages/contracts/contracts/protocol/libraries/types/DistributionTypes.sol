// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

library DistributionTypes {
  /**
   * @dev Stores the configurations for a streaming reward
   * @param emissionsPerSecond The reward's emissions per second
   * @param lastUpdateTimestamp The last timestamp the index was updated
   * @param index The reward's index
   * @param endTimestamp The timestamp rewards stop streaming
   * @param users The users that are interacting with this specific reward
   **/
  struct Reward {
    uint128 emissionPerSecond;
    uint128 lastUpdateTimestamp;
    uint256 index;
    uint128 endTimestamp;
    mapping(address => User) users;
  }

  /**
   * @dev Stores the configurations for an incentivized asset
   * @param rewardData Stores all the rewards that are streaming for this incentivized asset
   *     - Mapping from reward asset address to the reward asset configuration
   * @param rewardList A list of all the rewards streaming for this incentivized asset
   *     - Mapping from array index to reward asset address
   * @param numRewards The number of reward assets, ie the length of the rewardList
   * @param decimals The number of decimals of this incentivized asset
   **/
  struct IncentivizedAsset {
    mapping(address => Reward) rewardData;
    mapping(uint128 => address) rewardList;
    uint128 numRewards;
    uint8 decimals;
  }

  /**
   * @dev Stores a user's balance for an incentivized asset
   * @param asset The incentivized asset's address
   * @param totalSupply The total supply of that asset
   * @param userBalance The user's balance of that asset
   **/
  struct UserAssetState {
    address asset;
    uint256 totalSupply;
    uint256 userBalance;
  }

  /**
   * @dev Stores the index and accrued amounts for a user
   * @param index The user's index
   * @param accrued The user's accrued amount of a reward
   **/
  struct User {
    uint256 index;
    uint256 accrued;
  }
}
