// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {DistributionTypes} from '../../protocol/libraries/types/DistributionTypes.sol';
import {IDistributionManager} from '../../interfaces/IDistributionManager.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IIncentivesController} from '../../interfaces/IIncentivesController.sol';
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {DistributionManager} from './MockDistributionManager.sol';
import {ExternalRewardDistributor} from './MockExternalRewardDistributor.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {Errors} from "../../protocol/libraries/helpers/Errors.sol";

/**
 * @title IncentivesController
 * @notice Distributor contract for rewards to the VMEX protocol
 * @author Aave and VMEX
 **/
contract MockIncentivesController is
  IIncentivesController,
  Initializable,
  DistributionManager,
  ExternalRewardDistributor
{
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  address public REWARDS_VAULT;

  uint256 public upgradedIC;


  /**
   * @dev Called by the proxy contract
   **/
  function initialize(address _addressesProvider) public initializer {
    ExternalRewardDistributor.__ExternalRewardDistributor_init(_addressesProvider);
    DistributionManager.__DistributionManager_init(ILendingPoolAddressesProvider(_addressesProvider).getGlobalAdmin());
  }

  function setRewardsVault(address rewardsVault) external onlyGlobalAdmin {
    REWARDS_VAULT = rewardsVault;
  }

  /**
   * @dev Called by the corresponding asset on any update that affects the rewards distribution
   * @param user The address of the user
   * @param totalSupply The (old) total supply of the asset in the lending pool
   * @param oldBalance The old balance of the user of the asset in the lending pool
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

    for (uint256 i; i < assets.length; ++i) {
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

    for (uint256 i; i < assets.length; ++i) {
      address asset = assets[i];

      for (uint256 j; j < _allRewards.length; ++j) {
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
    DistributionTypes.UserAssetState[] memory userState = _getUserState(incentivizedAssets, user);
    _batchUpdate(user, userState);

    for (uint256 i; i < incentivizedAssets.length; ++i) {
      address asset = incentivizedAssets[i];
      for (uint256 j; j < _allRewards.length; ++j) {
        uint256 amount = _incentivizedAssets[asset].rewardData[rewards[j]].users[user].accrued;
        if (amount != 0) {
          amounts[j] += amount;
          _incentivizedAssets[asset].rewardData[rewards[j]].users[user].accrued = 0;
        }
      }
    }

    for (uint256 i; i < amounts.length; ++i) {
      if (amounts[i] != 0) {
        IERC20(rewards[i]).safeTransferFrom(REWARDS_VAULT, to, amounts[i]);
        emit RewardClaimed(msg.sender, rewards[i], to, amounts[i]);
      }
    }

    return (rewards, amounts);
  }

  function setUpgradedIC(uint256 newVal) external {
    upgradedIC = newVal;
  }
}
