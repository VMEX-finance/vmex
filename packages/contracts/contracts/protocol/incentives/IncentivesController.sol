// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {DistributionTypes} from '../libraries/types/DistributionTypes.sol';
import {IDistributionManager} from '../../interfaces/IDistributionManager.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {IIncentivesController} from '../../interfaces/IIncentivesController.sol';
import {VersionedInitializable} from "../../dependencies/aave-upgradeability/VersionedInitializable.sol";
import {DistributionManager} from './DistributionManager.sol';
import {ExternalRewardDistributor} from './ExternalRewardDistributor.sol';

/**
 * @title IncentivesController
 * @notice Distributor contract for rewards to the VMEX protocol
 * @author Aave and VMEX
 **/
contract IncentivesController is
  IIncentivesController,
  VersionedInitializable,
  DistributionManager,
  ExternalRewardDistributor
{
  using SafeMath for uint256;
  using SafeERC20 for IERC20;
  uint256 public constant REVISION = 1;

  address public immutable REWARDS_VAULT;

  constructor(
    address rewardsVault,
    address emissionManager,
    address externalRewardManager
  ) DistributionManager(emissionManager) 
    ExternalRewardDistributor(externalRewardManager) {
    REWARDS_VAULT = rewardsVault;
  }

  /**
   * @dev Called by the proxy contract. Not used at the moment, but for the future
   **/
  function initialize() external initializer {
    // to unlock possibility to stake on behalf of the user
    // REWARD_TOKEN.approve(address(PSM), type(uint256).max);
  }

  /**
   * @dev Returns the revision of the implementation contract
   * @return uint256, current revision version
   */
  function getRevision() internal pure override returns (uint256) {
    return REVISION;
  }

  /**
   * @dev Called by the corresponding asset on any update that affects the rewards distribution
   * @param user The address of the user
   * @param oldBalance The old balance of the user of the asset in the lending pool
   * @param totalSupply The (old) total supply of the asset in the lending pool
   * @param newBalance The new balance of the user of the asset in the lending pool
   * @param action Deposit, withdrawal, or transfer
   **/
  function handleAction(
    address user,
    uint256 totalSupply,
    uint256 oldBalance,
    uint256 newBalance,
    DistributionTypes.Action action
  ) external override {
    // note: msg.sender is the incentivized asset (the vToken)
    _updateIncentivizedAsset(msg.sender, user, oldBalance, totalSupply);

    if (stakingExists(msg.sender)) {
      if (action == DistributionTypes.Action.DEPOSIT) {
        onDeposit(user, newBalance - oldBalance);
      } else if (action == DistributionTypes.Action.WITHDRAW) {
        onWithdraw(user, oldBalance - newBalance);
      } else if (action == DistributionTypes.Action.TRANSFER) {
          if (oldBalance > newBalance) {
            onTransfer(user, oldBalance - newBalance, true);
          } else if (newBalance > oldBalance) {
            onTransfer(user, newBalance - oldBalance, false);
          }
          
      }
    }
  }

  function _getUserState(
    address[] memory assets,
    address user
  ) internal view returns (DistributionTypes.UserAssetState[] memory) {
    DistributionTypes.UserAssetState[] memory userState = new DistributionTypes.UserAssetState[](
      assets.length
    );

    for (uint256 i = 0; i < assets.length; i++) {
      userState[i].asset = assets[i];
      (userState[i].userBalance, userState[i].totalSupply) = IAToken(assets[i])
        .getScaledUserBalanceAndSupply(user);
    }

    return userState;
  }

  /**
   * @dev Returns the total of rewards of an user, already accrued + not yet accrued
   * @param assets List of incentivized assets to check the rewards for
   * @param user The address of the user
   **/
  function getPendingRewards(
    address[] calldata assets,
    address user
  ) external view override returns (address[] memory, uint256[] memory) {
    address[] memory rewards = _allRewards;
    uint256[] memory amounts = new uint256[](_allRewards.length);
    DistributionTypes.UserAssetState[] memory balanceData = _getUserState(assets, user);

    for (uint256 i = 0; i < assets.length; i++) {
      address asset = assets[i];
      for (uint256 j = 0; j < _allRewards.length; j++) {
        DistributionTypes.Reward storage reward = _incentivizedAssets[asset].rewardData[
          _allRewards[j]
        ];
        amounts[j] +=
          reward.users[user].accrued +
          _getReward(
            balanceData[i].userBalance,
            _getAssetIndex(reward, balanceData[i].totalSupply, _incentivizedAssets[asset].decimals),
            reward.users[user].index,
            _incentivizedAssets[asset].decimals
          );
      }
    }

    return (rewards, amounts);
  }

  /**
   * @dev Claims reward for an user on all the given incentivized assets, accumulating the accured rewards
   *      then transferring the reward asset to the user
   * @param incentivizedAssets The list of incentivized asset addresses (atoken addresses)
   * @param reward The reward to claim (only claims this reward address across all atokens you enter)
   * @param amountToClaim The amount of the reward to claim
   * @param to The address to send the claimed funds to
   * @return rewardAccured The total amount of rewards claimed by the user
   **/
  function claimReward(
    address[] calldata incentivizedAssets,
    address reward,
    uint256 amountToClaim,
    address to
  ) external override returns (uint256) {
    if (amountToClaim == 0) {
      return 0;
    }

    address user = msg.sender;
    DistributionTypes.UserAssetState[] memory userState = _getUserState(incentivizedAssets, user);
    _batchUpdate(user, userState);

    uint256 rewardAccrued;
    for (uint256 i = 0; i < incentivizedAssets.length; i++) {
      address asset = incentivizedAssets[i];

      if (_incentivizedAssets[asset].rewardData[reward].users[user].accrued == 0) {
        continue;
      }

      rewardAccrued += _incentivizedAssets[asset].rewardData[reward].users[user].accrued;

      if (rewardAccrued <= amountToClaim) {
        _incentivizedAssets[asset].rewardData[reward].users[user].accrued = 0;
      } else {
        uint256 remainder = rewardAccrued - amountToClaim;
        rewardAccrued -= remainder;
        _incentivizedAssets[asset].rewardData[reward].users[user].accrued = remainder;
        break;
      }
    }

    if (rewardAccrued == 0) {
      return 0;
    }

    IERC20(reward).safeTransferFrom(REWARDS_VAULT, to, rewardAccrued);
    emit RewardClaimed(msg.sender, reward, to, rewardAccrued);

    return rewardAccrued;
  }

  /**
   * @dev Claims all available rewards on the given incentivized assets
   * @param incentivizedAssets The list of incentivized asset addresses
   * @param to The address to send the claimed funds to
   * @return rewards The list of possible reward addresses
   * @return amounts The list of amounts of each reward claimed
   **/
  function claimAllRewards(
    address[] calldata incentivizedAssets,
    address to
  ) external override returns (address[] memory, uint256[] memory) {
    address[] memory rewards = _allRewards;
    uint256[] memory amounts = new uint256[](_allRewards.length);
    address user = msg.sender;

    for (uint256 i = 0; i < incentivizedAssets.length; i++) {
      address asset = incentivizedAssets[i];
      for (uint256 j = 0; j < _allRewards.length; j++) {
        uint256 amount = _incentivizedAssets[asset].rewardData[rewards[j]].users[user].accrued;
        if (amount != 0) {
          amounts[j] += amount;
          _incentivizedAssets[asset].rewardData[rewards[j]].users[user].accrued = 0;
        }
      }
    }

    for (uint256 i = 0; i < amounts.length; i++) {
      if (amounts[i] != 0) {
        IERC20(rewards[i]).safeTransferFrom(REWARDS_VAULT, to, amounts[i]);
        emit RewardClaimed(msg.sender, rewards[i], to, amounts[i]);
      }
    }

    return (rewards, amounts);
  }

  function totalStaked() external view override returns (uint256) {
    return _totalStaked(msg.sender);
  }
}
