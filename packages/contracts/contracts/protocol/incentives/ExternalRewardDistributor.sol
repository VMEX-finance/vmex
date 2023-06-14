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
  mapping(address => uint256) internal aTokenStaking; //  aToken => amount that atoken has staked

  address public immutable manager;

  constructor(address _manager) {
    manager = _manager;
  }

  modifier onlyManager() {
    require(msg.sender == manager, 'Only manager');
    _;
  }

  function stakingExists(address aToken) internal view returns (bool) {
    address underlying = IAToken(aToken)._underlyingAsset();
    return address(stakingData[underlying].reward) != address(0);
  }

  /**
   * @dev Called internally to harvest the reward token, then update accounting for the amount accrued per token and for the user
   * @param user The address of the user that is calling the action
   * @param underlying The address of the underlying token (not atoken)
   **/
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
    // cannot have case where both lastUpdateRewardPerToken is 0 and stakedBalance is not zero (unless if cumulativeRewardPerToken was really 0 before)
    // assert(userData.lastUpdateRewardPerToken != 0 || userData.stakedBalance == 0); 
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
    require(IAToken(aToken).totalSupply() == 0, 'Existing liquidity');

    address underlying = IAToken(aToken)._underlyingAsset();

    require(address(stakingData[underlying].reward) == address(0) || address(stakingData[underlying].reward) == reward, 'Cannot reinitialize reward thats been set');

    if (address(stakingData[underlying].reward) == address(0)) {
        require(staking != address(0) && reward != address(0), 'No zero address');
        stakingData[underlying].staking = IStakingRewards(staking);
        IERC20(underlying).approve(staking, type(uint).max);
        stakingData[underlying].reward = IERC20(reward);
        stakingData[underlying].rewardEnded = false;
    }
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

  /**
   * @dev Removes all liquidity from the staking contract and sends back to the atoken. Subsequent calls to handleAction doesn't call onDeposit, etc
   * @param underlying The address of the underlying token in which rewards stopped streaming
   **/
  function removeStakingReward(address underlying) external onlyManager {
    StakingReward storage rewardData = stakingData[underlying];

    exitStakingContract(rewardData, underlying);

    for (uint i = 0; i < rewardData.aTokens.length; i++) {
      address aToken = rewardData.aTokens[i];
      IERC20(underlying).safeTransfer(aToken, aTokenStaking[aToken]);
      aTokenStaking[aToken] = 0;
    }

    rewardData.rewardEnded = true;
  }

  /**
   * @dev Removes all liquidity from the staking contract and stakes in new staking contract
   * @param underlying The address of the underlying token in which staking contracts must be switched
   * @param newStaking The new staking contract
   **/
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
    IERC20(underlying).approve(address(newStaking), type(uint).max);
    newStaking.stake(ourBalance);

    address oldStaking = address(rewardData.staking);
    rewardData.staking = newStaking;
    
    emit StakingContractUpdated(underlying, oldStaking, address(newStaking));
  }

  /**
   * @dev Exits and removes all liquidity from the staking contract, updates reward accounting
   * @param rewardData staking data of the underlying token
   * @param underlying The address of the underlying token in which staking contracts must be exited
   **/
  function exitStakingContract(StakingReward storage rewardData, address underlying) internal {
    uint256 totalSupply = rewardData.staking.balanceOf(address(this));

    if (totalSupply > 0) {
      uint256 rewardBalance = rewardData.reward.balanceOf(address(this));
      rewardData.staking.exit();
      uint256 received = rewardData.reward.balanceOf(address(this)) - rewardBalance;

      if (received > 0) {
        uint256 accruedPerToken = received * 1e16 / totalSupply;
        rewardData.cumulativeRewardPerToken += accruedPerToken;
        emit Harvested(underlying, accruedPerToken);
      }
    }
    rewardData.lastUpdateTimestamp = block.timestamp;
  }

  function onDeposit(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender)._underlyingAsset();
    harvestAndUpdate(user, underlying);
    StakingReward storage rewardData = stakingData[underlying];

    IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
    IERC20(underlying).approve(address(rewardData.staking), type(uint256).max);
    rewardData.staking.stake(amount);
    aTokenStaking[msg.sender] += amount;
    rewardData.users[user].stakedBalance += amount;
  }

  function onWithdraw(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender)._underlyingAsset();
    harvestAndUpdate(user, underlying);
    StakingReward storage rewardData = stakingData[underlying];

    rewardData.staking.withdraw(amount);
    IERC20(underlying).safeTransfer(msg.sender, amount);
    aTokenStaking[msg.sender] -= amount;
    rewardData.users[user].stakedBalance -= amount;
  }

  function onTransfer(address user, uint256 amount, bool sender) internal {
    harvestAndUpdate(user, IAToken(msg.sender)._underlyingAsset());

    if (sender) {
      stakingData[IAToken(msg.sender)._underlyingAsset()].users[user].stakedBalance -= amount;
    } else {
      stakingData[IAToken(msg.sender)._underlyingAsset()].users[user].stakedBalance += amount;
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
      address underlying = IAToken(aToken)._underlyingAsset();
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
    return aTokenStaking[aToken];
  }

  function getUserDataByAToken(address user, address aToken) external view returns (UserState memory) {
    StakingReward storage rewardData =  stakingData[IAToken(aToken)._underlyingAsset()];
    UserState memory userData = rewardData.users[user];
    if (rewardData.rewardEnded) userData.stakedBalance = 0;
    return userData;
  }

  function rescueRewardTokens(IERC20 reward, address receiver) external onlyManager {
    reward.safeTransfer(receiver, reward.balanceOf(address(this)));
  }
}
