// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IStakingRewards} from './IStakingRewards.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';

interface IExternalRewardsDistributor {
  struct StakingReward {
    mapping(uint256 => StakingContractMetadata) staking; //list of staking contracts
    uint256 numStakingContracts; // number of staking contracts added for this underlying
  }

  struct StakingContractMetadata {
    IStakingRewards stakingContract;
    IERC20 rewardContract;
  }

  struct ATokenData {
    uint256 currentStakingContractIndex;
    mapping(uint256 => ATokenMetadata) metadata;
  }

  struct ATokenMetadata {
    uint256 totalStaked;
    bool enabled;
  }

  event RewardConfigured(address indexed underlying,  address indexed staking, uint256 numStakingContracts);
  event ATokenRewardStarted(address indexed aToken, uint256 stakingContractIndex, uint256 initialAmount);
  event Harvested(address indexed underlying, uint256 rewardPerToken);
  event UserUpdated(address indexed user, address indexed aToken, address indexed underlying, uint256 rewardBalance);
  // event StakingRewardClaimed(address indexed user, address indexed underlying, address indexed reward, uint256 amount);
  event StakingContractUpdated(address indexed underlying, address indexed oldContract, address indexed newContract);
  event StakingRemoved(address indexed aToken);
  event UserDeposited(address indexed user, address indexed aToken, uint256 amount);
  event UserWithdraw(address indexed user, address indexed aToken, uint256 amount);
  event UserTransfer(address indexed user, address indexed aToken, uint256 amount, bool sender);

  // function batchAddStakingRewards(
  //     address[] calldata aTokens,
  //     address[] calldata stakingContracts,
  //     address[] calldata rewards
  // ) external;

  // function claimStakingReward(address underlying, uint256 amount) external;

  // function batchClaimStakingRewards(
  //   address[] calldata assets,
  //   uint256[] calldata amounts
  // ) external;

  function getDataByAToken(address aToken) external view
  returns (address, address, uint256, uint256, bool);
}
