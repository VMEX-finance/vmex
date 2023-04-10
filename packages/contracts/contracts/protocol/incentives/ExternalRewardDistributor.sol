// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IStakingRewards} from '../../interfaces/IStakingRewards.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';

contract ExternalRewardDistributor {
  using SafeERC20 for IERC20;

  struct UserState {
    uint256 rewardBalance;
    uint256 lastUpdateRewardPerToken;
  }

  struct StakingReward {
    IStakingRewards staking;
    IERC20 reward;
    IERC20 underlying;
    uint256 cumulativeRewardPerToken;
    uint256 lastUpdateTimestamp;
    mapping(address => UserState) users;
  }

  struct RewardInput {
    uint256 userBalance;
    uint256 assetSupply;
  }

  mapping(address => StakingReward) internal stakingData; //AToken => reward info

  address public immutable manager;

  event RewardConfigured(address indexed asset, address indexed staking, address reward);
  event Harvested(address indexed asset, uint256 rewardPerToken);
  event UserUpdated(address indexed user, address indexed asset, uint256 rewardBalance);

  constructor(address _manager) {
    manager = _manager;
  }

  function harvestAndUpdate(
    address user,
    uint256 userBalance,
    uint256 assetSupply,
    address aToken
  ) internal {
    StakingReward storage rewardData = stakingData[aToken];

    if (rewardData.lastUpdateTimestamp < block.timestamp) {
      uint256 rewardBalance = rewardData.reward.balanceOf(address(this));
      rewardData.staking.getReward();
      uint256 received = rewardData.reward.balanceOf(address(this)) - rewardBalance;

      uint256 accruedPerToken = received / assetSupply;
      rewardData.cumulativeRewardPerToken += accruedPerToken;
      rewardData.lastUpdateTimestamp = block.timestamp;

      emit Harvested(msg.sender, accruedPerToken);
    }

    if (rewardData.users[user].lastUpdateRewardPerToken < rewardData.cumulativeRewardPerToken) {
      uint256 diff =
        rewardData.cumulativeRewardPerToken -
          rewardData.users[user].lastUpdateRewardPerToken;
      rewardData.users[user].rewardBalance += diff * userBalance;
      rewardData.users[user].lastUpdateRewardPerToken = rewardData.cumulativeRewardPerToken;

      emit UserUpdated(user, msg.sender, rewardData.users[user].rewardBalance);
    }
  }

  function addStakingReward(
    address aToken,
    address staking,
    address reward
  ) external {
    require(msg.sender == manager, 'Only manager');
    require(address(stakingData[aToken].reward) == address(0), 'Already registered');

    stakingData[aToken].staking = IStakingRewards(staking);
    stakingData[aToken].reward = IERC20(reward);
    stakingData[aToken].underlying = IERC20(IAToken(aToken).UNDERLYING_ASSET_ADDRESS());

    emit RewardConfigured(aToken, staking, reward);
  }

  function onDeposit(
    address user,
    uint256 amount,
    uint256 prevBalance,
    uint256 prevSupply
  ) external {
    harvestAndUpdate(user, prevBalance, prevSupply, msg.sender);

    StakingReward storage rewardData = stakingData[msg.sender];

    rewardData.underlying.safeTransferFrom(msg.sender, address(this), amount);
    rewardData.staking.stake(amount);
  }

  function onWithdraw(
    address user,
    uint256 amount,
    uint256 prevBalance,
    uint256 prevSupply
  ) external {
    harvestAndUpdate(user, prevBalance, prevSupply, msg.sender);

    StakingReward storage rewardData = stakingData[msg.sender];
    rewardData.staking.withdraw(amount);
    rewardData.underlying.safeTransfer(msg.sender, amount);
  }

  function claimStakingReward(
    address asset,
    uint256 amount,
    uint256 userBalance,
    uint256 assetSupply
  ) public {
    harvestAndUpdate(msg.sender, userBalance, assetSupply, asset);

    StakingReward storage rewardData = stakingData[asset];
    require(rewardData.users[msg.sender].rewardBalance >= amount, 'Insufficient balance');
    rewardData.reward.safeTransfer(msg.sender, amount);
    rewardData.users[msg.sender].rewardBalance -= amount;
  }

  function batchClaimStakingRewards(
    address[] calldata assets,
    uint256[] calldata amounts,
    RewardInput[] calldata data
  ) external {
    require(assets.length == amounts.length && amounts.length == data.length, 'Malformed input');
    for (uint256 i = 0; i < assets.length; i++) {
      claimStakingReward(assets[i], amounts[i], data[i].userBalance, data[i].assetSupply);
    }
  }
}
