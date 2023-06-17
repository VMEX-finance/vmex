// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IStakingRewards} from './IStakingRewards.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';

interface IExternalRewardsDistributor {
  event RewardConfigured(address indexed aToken, address indexed staking, uint256 initialAmount);
  event StakingRemoved(address indexed aToken);
  event UserDeposited(address indexed user, address indexed underlying, uint64 indexed trancheId, uint256 amount);
  event UserWithdraw(address indexed user, address indexed underlying, uint64 indexed trancheId, uint256 amount);
  event UserTransfer(address indexed user, address indexed underlying, uint64 indexed trancheId, uint256 amount, bool sender);

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

  function getStakingContract(address aToken) external view
  returns (address);
}
