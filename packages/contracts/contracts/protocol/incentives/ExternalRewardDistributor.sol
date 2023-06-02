// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IStakingRewards} from '../../interfaces/IStakingRewards.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {IExternalRewardsDistributor} from '../../interfaces/IExternalRewardsDistributor.sol';
import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';

contract ExternalRewardDistributor is IExternalRewardsDistributor {
  using SafeERC20 for IERC20;

  mapping(address => StakingReward) internal stakingData; // incentivized underlying asset => reward info
  mapping(address => ATokenData) internal aTokenMap; //  aToken => underlying, authorized callers

  address public immutable manager;

  constructor(address _manager) {
    manager = _manager;
  }

  modifier onlyManager() {
    require(msg.sender == manager, 'Only manager');
    _;
  }

  function stakingExists(address aToken) internal view returns (bool) {
    return aTokenMap[aToken].underlying != address(0);
  }

  function harvestAndUpdate(
    address user,
    address underlying
  ) internal {
    assert(user != address(0) && underlying != address(0));
    StakingReward storage rewardData = stakingData[underlying];

    if (rewardData.lastUpdateTimestamp < block.timestamp && !rewardData.rewardEnded) {
      uint256 rewardBalance = rewardData.reward.balanceOf(address(this));
      rewardData.staking.getReward();
      uint256 received = rewardData.reward.balanceOf(address(this)) - rewardBalance;

      uint256 totalSupply = rewardData.staking.balanceOf(address(this));
      if (totalSupply > 0) {
        uint256 accruedPerToken = received * 1e16 / totalSupply;
        rewardData.cumulativeRewardPerToken += accruedPerToken;
        emit Harvested(underlying, accruedPerToken);
      }
      rewardData.lastUpdateTimestamp = block.timestamp;
    }

    UserState storage userData = rewardData.users[user];
    if (userData.lastUpdateRewardPerToken < rewardData.cumulativeRewardPerToken) {
      uint256 diff =
        rewardData.cumulativeRewardPerToken - userData.lastUpdateRewardPerToken;
      userData.rewardBalance += diff * userData.stakedBalance / 1e16;
      userData.lastUpdateRewardPerToken = rewardData.cumulativeRewardPerToken;

      emit UserUpdated(user, msg.sender, underlying, userData.rewardBalance);
    }
  }

  /**
   * @dev Called by the manager to specify that an aToken has an external reward
   * @param aToken The address of the aToken that stores an underlying that has an external reward
   * @param staking The address of the staking contract
   * @param reward The address of the reward token
   **/
  function addStakingReward(
    address aToken,
    address staking,
    address reward
  ) public onlyManager {
    require(aTokenMap[aToken].underlying == address(0), 'Already registered');
    require(IAToken(aToken).totalSupply() == 0, 'Existing liquidity');

    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
    if (address(stakingData[underlying].reward) == address(0)) {
        require(staking != address(0) && reward != address(0), 'No zero address');
        stakingData[underlying].staking = IStakingRewards(staking);
        IERC20(underlying).approve(staking, type(uint).max);
        stakingData[underlying].reward = IERC20(reward);
    }
    aTokenMap[aToken].underlying = underlying;
    stakingData[underlying].aTokens.push(aToken);

    emit RewardConfigured(aToken, underlying, reward, staking);
  }

  function batchAddStakingRewards(
      address[] calldata aTokens,
      address[] calldata stakingContracts,
      address[] calldata rewards
  ) external onlyManager {
    require(aTokens.length == stakingContracts.length
        && stakingContracts.length == rewards.length, "Malformed input");

    for(uint i = 0; i < aTokens.length; i++) {
        addStakingReward(aTokens[i], stakingContracts[i], rewards[i]);
    }
  }

  function removeStakingReward(address underlying) external onlyManager {
    StakingReward storage rewardData = stakingData[underlying];

    exitStakingContract(rewardData, underlying);

    for (uint i = 0; i < rewardData.aTokens.length; i++) {
      address aToken = rewardData.aTokens[i];
      IERC20(underlying).safeTransfer(aToken, aTokenMap[aToken].totalStaked);
    }

    rewardData.rewardEnded = true;
  }

  function updateStakingContract(
    address underlying,
    IStakingRewards newStaking
  ) external onlyManager {
    StakingReward storage rewardData = stakingData[underlying];

    require(newStaking.stakingToken() == IERC20(underlying) 
      && newStaking.rewardsToken() == rewardData.reward, "Bad staking contract");

    exitStakingContract(rewardData, underlying);

    // we use ERC20 balance in case the problem with the previous staking contract was severe enough that the deposit was manually rescued and transferred to this contract
    uint256 ourBalance = IERC20(underlying).balanceOf(address(this));
    newStaking.stake(ourBalance);

    address oldStaking = address(rewardData.staking);
    rewardData.staking = newStaking;
    
    emit StakingContractUpdated(underlying, oldStaking, address(newStaking));
  }

  function exitStakingContract(StakingReward storage rewardData, address underlying) internal {
    uint256 rewardBalance = rewardData.reward.balanceOf(address(this));
    rewardData.staking.exit();
    uint256 received = rewardData.reward.balanceOf(address(this)) - rewardBalance;

    uint256 totalSupply = rewardData.staking.balanceOf(address(this));
    if (totalSupply > 0 && received > 0) {
      uint256 accruedPerToken = received * 1e16 / totalSupply;
      rewardData.cumulativeRewardPerToken += accruedPerToken;
      emit Harvested(underlying, accruedPerToken);
    }
    rewardData.lastUpdateTimestamp = block.timestamp;
  }

  function onDeposit(
    address user,
    uint256 amount
  ) internal {
    address underlying = aTokenMap[msg.sender].underlying;
    harvestAndUpdate(user, underlying);
    StakingReward storage rewardData = stakingData[underlying];

    IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
    rewardData.staking.stake(amount);
    aTokenMap[msg.sender].totalStaked += amount;
    rewardData.users[user].stakedBalance += amount;
  }

  function onWithdraw(
    address user,
    uint256 amount
  ) internal {
    address underlying = aTokenMap[msg.sender].underlying;
    harvestAndUpdate(user, underlying);
    StakingReward storage rewardData = stakingData[underlying];

    rewardData.staking.withdraw(amount);
    IERC20(underlying).safeTransfer(msg.sender, amount);
    aTokenMap[msg.sender].totalStaked -= amount;
    rewardData.users[user].stakedBalance -= amount;
  }

  function onTransfer(address user, uint256 amount, bool sender) internal {
    harvestAndUpdate(user, aTokenMap[msg.sender].underlying);

    if (sender) {
      stakingData[aTokenMap[msg.sender].underlying].users[user].stakedBalance -= amount;
    } else {
      stakingData[aTokenMap[msg.sender].underlying].users[user].stakedBalance += amount;
    }
  }

  function _claimStakingReward(
    address underlying,
    uint256 amount
  ) internal {
    harvestAndUpdate(msg.sender, underlying);

    StakingReward storage rewardData = stakingData[underlying];
    require(rewardData.users[msg.sender].rewardBalance >= amount, 'Insufficient balance');
    rewardData.reward.safeTransfer(msg.sender, amount);
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
      address underlying = aTokenMap[aToken].underlying;
      return (
          underlying,
          address(stakingData[underlying].staking),
          address(stakingData[underlying].reward),
          stakingData[underlying].cumulativeRewardPerToken,
          stakingData[underlying].lastUpdateTimestamp
      );
  }

  function _totalStaked(address aToken) internal view returns (uint256) {
    if (!stakingExists(aToken)) {
      return 0;
    }
    return aTokenMap[aToken].totalStaked;
  }

  function getUserDataByAToken(address user, address aToken) external view returns (UserState memory) {
    return stakingData[aTokenMap[aToken].underlying].users[user];
  }
}
