// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IStakingRewards} from '../../interfaces/IStakingRewards.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {IExternalRewardsDistributor} from '../../interfaces/IExternalRewardsDistributor.sol';
import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';

contract ExternalRewardDistributor is IExternalRewardsDistributor {

  mapping(address => StakingReward) internal stakingData; // incentivized underlying asset => reward info
  mapping(address => address) internal aTokenMap; //  aToken => underlying, authorized callers

  address public immutable manager;

  constructor(address _manager) {
    manager = _manager;
  }

  modifier onlyManager() {
    require(msg.sender == manager, 'Only manager');
    _;
  }

  function stakingExists(address aToken) internal view returns (bool) {
    return aTokenMap[aToken] != address(0);
  }

  function harvestAndUpdate(
    address user,
    address underlying
  ) internal {
    assert(user != address(0) && underlying != address(0));
    StakingReward storage rewardData = stakingData[underlying];

    if (rewardData.lastUpdateTimestamp < block.timestamp) {
      uint256 rewardBalance = rewardData.reward.balanceOf(address(this));
      rewardData.staking.getReward();
      uint256 received = rewardData.reward.balanceOf(address(this)) - rewardBalance;

      uint256 totalSupply = rewardData.staking.balanceOf(address(this));
      if (totalSupply > 0) {
        uint256 accruedPerToken = received / totalSupply;
        rewardData.cumulativeRewardPerToken += accruedPerToken;
        emit Harvested(underlying, accruedPerToken);
      }
      rewardData.lastUpdateTimestamp = block.timestamp;
    }

    if (rewardData.users[user].lastUpdateRewardPerToken < rewardData.cumulativeRewardPerToken) {
      uint256 diff =
        rewardData.cumulativeRewardPerToken - rewardData.users[user].lastUpdateRewardPerToken;
      rewardData.users[user].rewardBalance += diff * rewardData.users[user].assetBalance;
      rewardData.users[user].lastUpdateRewardPerToken = rewardData.cumulativeRewardPerToken;

      emit UserUpdated(user, msg.sender, underlying, rewardData.users[user].rewardBalance);
    }
  }

  function addStakingReward(
    address aToken,
    address staking,
    address reward
  ) public onlyManager {
    require(aTokenMap[aToken] == address(0), 'Already registered');

    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
    if (address(stakingData[underlying].reward) == address(0)) {
        require(staking != address(0) && reward != address(0), 'No zero address');
        stakingData[underlying].staking = IStakingRewards(staking);
        IERC20(underlying).approve(staking, type(uint).max);
        stakingData[underlying].reward = IERC20(reward);
    }
    aTokenMap[aToken] = underlying;

    emit RewardConfigured(aToken, underlying, reward, staking);
  }

  function batchAddStakingRewards(
      address[] calldata aTokens,
      address[] calldata stakingContracts,
      address[] calldata rewards
  ) external {
    require(aTokens.length == stakingContracts.length
        && stakingContracts.length == rewards.length, "Malformed input");

    for(uint i = 0; i < aTokens.length; i++) {
        addStakingReward(aTokens[i], stakingContracts[i], rewards[i]);
    }
  }

  function onDeposit(
    address user,
    uint256 amount
  ) internal {
    if (!stakingExists(msg.sender)) {
      return;
    }
    address underlying = aTokenMap[msg.sender];
    harvestAndUpdate(user, underlying);
    StakingReward storage rewardData = stakingData[underlying];

    IERC20(underlying).transferFrom(msg.sender, address(this), amount);
    rewardData.staking.stake(amount);
    rewardData.users[user].assetBalance += amount;
  }

  function onWithdraw(
    address user,
    uint256 amount
  ) internal {
    if (!stakingExists(msg.sender)) {
      return;
    }
    address underlying = aTokenMap[msg.sender];
    harvestAndUpdate(user, underlying);
    StakingReward storage rewardData = stakingData[underlying];

    rewardData.staking.withdraw(amount);
    IERC20(underlying).transfer(msg.sender, amount);
    rewardData.users[user].assetBalance -= amount;
  }

  function onTransfer(
      address user,
      uint256 amount,
      bool sender
  ) internal {
    if (!stakingExists(msg.sender)) {
      return;
    }
    address underlying = aTokenMap[msg.sender];
    harvestAndUpdate(user, underlying);

    if (sender) {
        stakingData[underlying].users[user].assetBalance -= amount;
    } else {
        stakingData[underlying].users[user].assetBalance += amount;
    }
  }

  function _claimStakingReward(
    address underlying,
    uint256 amount
  ) internal {
    harvestAndUpdate(msg.sender, underlying);

    StakingReward storage rewardData = stakingData[underlying];
    require(rewardData.users[msg.sender].rewardBalance >= amount, 'Insufficient balance');
    rewardData.reward.transfer(msg.sender, amount);
    rewardData.users[msg.sender].rewardBalance -= amount;
    emit StakingRewardClaimed(msg.sender, underlying, address(rewardData.reward), amount);
  }

  function claimStakingReward(address underlying, uint256 amount) external {
    _claimStakingReward(underlying, amount);
  }

  function batchClaimStakingRewards(
    address[] calldata assets,
    uint256[] calldata amounts
  ) external {
    require(assets.length == amounts.length, 'Malformed input');
    for (uint256 i = 0; i < assets.length; i++) {
      _claimStakingReward(assets[i], amounts[i]);
    }
  }

  function getDataByAToken(address aToken) external view
  returns (address, address, address, uint256, uint256) {
      address underlying = aTokenMap[aToken];
      return (
          underlying,
          address(stakingData[underlying].staking),
          address(stakingData[underlying].reward),
          stakingData[underlying].cumulativeRewardPerToken,
          stakingData[underlying].lastUpdateTimestamp
      );
  }

  function _totalStaked() internal view returns (uint256) {
    if (!stakingExists(msg.sender)) {
      return 0;
    }
    return stakingData[aTokenMap[msg.sender]].staking.balanceOf(address(this));
  }

  function getUserDataByAToken(address user, address aToken) external view returns (UserState memory) {
    return stakingData[aTokenMap[aToken]].users[user];
  }
}
