// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {DistributionTypes} from '../libraries/types/DistributionTypes.sol';
import {IDistributionManager} from '../../interfaces/IDistributionManager.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IIncentivesController} from '../../interfaces/IIncentivesController.sol';
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {DistributionManager} from './DistributionManager.sol';
import {ExternalRewardDistributor} from './ExternalRewardDistributor.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {Errors} from "../libraries/helpers/Errors.sol";
import {IVeVmex} from "../../interfaces/IVeVmex.sol";
import {IDVmexRewardPool} from "../../interfaces/IDVmexRewardPool.sol";
import {IScaledBalanceToken} from "../../interfaces/IScaledBalanceToken.sol";

/**
 * @title IncentivesController
 * @notice Distributor contract for rewards to the VMEX protocol
 * @author Aave and VMEX
 **/
contract IncentivesController is
  IIncentivesController,
  Initializable,
  DistributionManager,
  ExternalRewardDistributor
{
  using SafeERC20 for IERC20;

  address public REWARDS_VAULT;

    /*//////////////////////////////////////////////////////////////
                      dVMEX rewards state
    //////////////////////////////////////////////////////////////*/

    uint256 internal constant BOOSTING_FACTOR = 1;
    uint256 internal constant BOOST_DENOMINATOR = 10;
    uint256 internal constant STANDARD_DECIMALS = 18;
    uint256 internal constant PRECISION_FACTOR = 10 ** 18;
    uint256 internal constant DURATION = 14 days;

    address public VE_VMEX;
    address public DVMEX_REWARD_POOL;
    address public DVMEX;

    struct DVmexReward {
        uint32 periodFinish;
        uint32 lastUpdateTime;
        uint64 rewardRate;
        uint128 rewardPerTokenStored;
        uint8 decimals;
        uint120 queuedRewards;
        uint128 currentRewards;
    }

    struct UserInfo {
        uint128 rewardPerTokenPaid;
        uint128 reward;
    }

    mapping(address aToken => DVmexReward reward) internal _aTokenReward;
    mapping(address aToken => mapping(address user => UserInfo userRewardInfo)) internal _userInfo;
    mapping(address aToken => mapping(address user => uint256 balance)) internal _boostedBalances;

    event RewardsAdded(uint32 periodFinish, uint64 rewardRate, uint128 currentRewards);

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

    function setVeVmex(address veVmex) external onlyGlobalAdmin {
        require(VE_VMEX == address(0), "can only set VE_VMEX once");
        VE_VMEX = veVmex;
    }

    function setDVmexRewardPool(address penaltyReciever) external onlyGlobalAdmin {
        require(DVMEX_REWARD_POOL == address(0), "can only set DVMEX_REWARD_POOL once");
        DVMEX_REWARD_POOL = penaltyReciever;
    }

    function setDVmex(address dVmex) external onlyGlobalAdmin {
        require(DVMEX == address(0), "can only set DVMEX once");
        DVMEX = dVmex;
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

        _updateDVmexRewards(msg.sender, user);
  }

  function _getUserState(
    address[] calldata assets,
    address user
  ) internal view returns (DistributionTypes.UserAssetState[] memory) {
    DistributionTypes.UserAssetState[] memory userState = new DistributionTypes.UserAssetState[](
      assets.length
    );

    uint256 length = assets.length;
    for (uint256 i; i < length;) {
      userState[i].asset = assets[i];
      (userState[i].userBalance, userState[i].totalSupply) = IAToken(assets[i])
        .getScaledUserBalanceAndSupply(user);

      unchecked { ++i; }
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
    uint256 rewardsLength = rewards.length;
    uint256[] memory amounts = new uint256[](rewardsLength);
    DistributionTypes.UserAssetState[] memory balanceData = _getUserState(assets, user);

    // cant cache because of the stack too deep
    for (uint256 i; i < assets.length;) {
      address asset = assets[i];

      for (uint256 j; j < rewardsLength;) {
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
          unchecked { ++j; }
      }
      unchecked { ++i; }
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
    uint256 rewardsLength = _allRewards.length;
    uint256[] memory amounts = new uint256[](rewardsLength);
    address user = msg.sender;
    DistributionTypes.UserAssetState[] memory userState = _getUserState(incentivizedAssets, user);
    _batchUpdate(user, userState);

    uint256 assetsLength = incentivizedAssets.length; 
    for (uint256 i; i < assetsLength;) {
      address asset = incentivizedAssets[i];
      for (uint256 j; j < rewardsLength;) {
        uint256 amount = _incentivizedAssets[asset].rewardData[rewards[j]].users[user].accrued;
        if (amount != 0) {
          amounts[j] += amount;
          _incentivizedAssets[asset].rewardData[rewards[j]].users[user].accrued = 0;
        }

        unchecked { ++j; }
      }

      unchecked { ++i; }
    }

    uint256 amountsLength = amounts.length;
    for (uint256 i; i < amountsLength;) {
      if (amounts[i] != 0) {
        IERC20(rewards[i]).safeTransferFrom(REWARDS_VAULT, to, amounts[i]);
        emit RewardClaimed(msg.sender, rewards[i], to, amounts[i]);
      }

      unchecked { ++i; }
    }

    return (rewards, amounts);
  }

    /*//////////////////////////////////////////////////////////////
                      dVMEX rewards logic
    //////////////////////////////////////////////////////////////*/
    function _updateDVmexRewards(address aToken, address user) internal {
        DVmexReward storage rewardInfo = _aTokenReward[aToken];

        // rewards not configured for this aToken
        if (rewardInfo.rewardRate == 0) return;
        _updateReward(rewardInfo, aToken, user);

        _boostedBalances[aToken][user] = _boostedBalanceOf(aToken, user, rewardInfo.decimals);
    }

    /**
     *  @return timestamp until rewards are distributed
     */
    function _lastTimeRewardApplicable(DVmexReward storage rewardInfo) internal view returns (uint256) {
        return _min(block.timestamp, rewardInfo.periodFinish);
    }

    /**
     * @notice sweep tokens that are airdropped/transferred into the gauge.
     *  @param _token to sweep
     */
    function sweep(address _token) external onlyGlobalAdmin {
        uint256 amount = IERC20(_token).balanceOf(address(this));

        IERC20(_token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice
     * Add new rewards to be distributed over a week
     * @dev Trigger reward rate recalculation using `_amount` and queue rewards
     * @param _amount token to add to rewards
     * @return true
     */
    function queueNewRewards(address aToken, uint256 _amount) external returns (bool) {
        require(_amount != 0, "==0");
        IERC20(DVMEX).safeTransferFrom(msg.sender, address(this), _amount);
        DVmexReward storage reward = _aTokenReward[aToken];

        _amount = _amount + reward.queuedRewards;

        if (block.timestamp >= reward.periodFinish) {
            _notifyRewardAmount(reward, aToken, _amount);
            reward.queuedRewards = 0;
            return true;
        }
        uint256 elapsedSinceBeginingOfPeriod = block.timestamp - (reward.periodFinish - DURATION);
        uint256 distributedSoFar = elapsedSinceBeginingOfPeriod * reward.rewardRate;
        // we only restart a new period if _amount is 120% of distributedSoFar.

        if ((distributedSoFar * 12) / 10 < _amount) {
            _notifyRewardAmount(reward, aToken, _amount);
            reward.queuedRewards = 0;
        } else {
            reward.queuedRewards = uint120(_amount);
        }
        return true;
    }

    function _notifyRewardAmount(DVmexReward storage reward, address aToken, uint256 _reward) internal {
        if (reward.periodFinish == 0) {
            reward.decimals = IERC20(aToken).decimals();
        }
        _updateReward(reward, aToken, address(0));

        uint64 rewardRate = uint64(_reward / DURATION);

        if (block.timestamp >= reward.periodFinish) {
            reward.rewardRate = rewardRate;
        } else {
            uint256 remaining = reward.periodFinish - block.timestamp;
            uint256 leftover = remaining * reward.rewardRate;
            _reward = _reward + leftover;
            reward.rewardRate = rewardRate;
        }
        uint128 currentRewards = uint128(_reward);
        reward.currentRewards = currentRewards;
        reward.lastUpdateTime = uint32(block.timestamp);
        uint32 periodFinish = uint32(block.timestamp + DURATION);
        reward.periodFinish = periodFinish;

        emit RewardsAdded(periodFinish, rewardRate, currentRewards);
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // assumes biggest decimals is 18
    function _standardizeDecimals(uint256 amount, uint256 decimals) internal pure returns (uint256) {
        return decimals != STANDARD_DECIMALS ? amount * 10 ** (STANDARD_DECIMALS - decimals) : amount;
    }

    function _updateReward(DVmexReward storage rewardInfo, address aToken, address _account) internal {
        uint256 newRewardPerTokenStored = _rewardPerToken(rewardInfo, aToken);
        rewardInfo.rewardPerTokenStored = uint128(newRewardPerTokenStored);
        rewardInfo.lastUpdateTime = uint32(_lastTimeRewardApplicable(rewardInfo));

        if (_account != address(0)) {
            if (_boostedBalances[aToken][_account] != 0) {
                uint256 newEarning = _newEarning(rewardInfo, aToken, _account);

                _userInfo[aToken][_account].reward = uint128(newEarning + _userInfo[aToken][_account].reward);

                _transferVeYfiORewards(_maxEarning(rewardInfo, aToken, _account) - newEarning);
            }
            _userInfo[aToken][_account].rewardPerTokenPaid = uint128(newRewardPerTokenStored);
        }
    }

    function _rewardPerToken(DVmexReward storage rewardInfo, address aToken) internal view returns (uint256) {
        uint256 totalSupply = _standardizeDecimals(IERC20(aToken).totalSupply(), rewardInfo.decimals);
        return totalSupply == 0
            ? rewardInfo.rewardPerTokenStored
            : rewardInfo.rewardPerTokenStored
                + (_lastTimeRewardApplicable(rewardInfo) - rewardInfo.lastUpdateTime) * rewardInfo.rewardRate * PRECISION_FACTOR
                    / totalSupply;
    }

    /**
     * @notice The total undistributed earnings for an account.
     *  @dev Earnings are based on lock duration and boost
     *  @return
     *   Amount of tokens the account has earned that have yet to be distributed.
     */
    function earned(address aToken, address _account) external view returns (uint256) {
        DVmexReward storage rewardInfo = _aTokenReward[aToken];
        uint256 newEarning = _newEarning(rewardInfo, aToken, _account);

        return newEarning + _userInfo[aToken][_account].reward;
    }

    /**
     * @notice Calculates an account's earnings based on their boostedBalance.
     *   This function only reflects the accounts earnings since the last time
     *   the account's rewards were calculated via _updateReward.
     */
    function _newEarning(DVmexReward storage rewardInfo, address aToken, address _account)
        internal
        view
        returns (uint256)
    {
        return (
            _boostedBalances[aToken][_account]
                * (_rewardPerToken(rewardInfo, aToken) - _userInfo[aToken][_account].rewardPerTokenPaid)
        ) / PRECISION_FACTOR;
    }

    /**
     * @notice Calculates an account's potential maximum earnings based on
     *   a maximum boost.
     *   This function only reflects the accounts earnings since the last time
     *   the account's rewards were calculated via _updateReward.
     */
    function _maxEarning(DVmexReward storage rewardInfo, address aToken, address _account)
        internal
        view
        returns (uint256)
    {
        return (
            _standardizeDecimals(IScaledBalanceToken(aToken).scaledBalanceOf(_account), rewardInfo.decimals)
                * (_rewardPerToken(rewardInfo, aToken) - _userInfo[aToken][_account].rewardPerTokenPaid)
        ) / PRECISION_FACTOR;
    }

    /**
     * @notice
     *   Calculates the boosted balance of based on veYFI balance.
     *  @dev
     *   This function expects this._totalAssets to be up to date.
     *  @return
     *   The account's boosted balance. Always lower than or equal to the
     *   account's real balance.
     */
    function nextBoostedBalanceOf(address aToken, address _account) external view returns (uint256) {
        return _boostedBalanceOf(aToken, _account, _aTokenReward[aToken].decimals);
    }

    /**
     * @notice
     *   Calculates the boosted balance of an account based on its gauge stake
     *   proportion & veYFI lock proportion.
     *  @dev This function expects this._totalAssets to be up to date.
     *  @param aToken aToken for which we calculate boosted balance
     *  @param _account The account whose veYFI lock should be checked.
     *  @param decimals aToken decimals
     *  @return
     *   The account's boosted balance. Always lower than or equal to the
     *   account's real balance.
     */
    function _boostedBalanceOf(address aToken, address _account, uint8 decimals) internal view returns (uint256) {
        (uint256 aTokenBalance, uint256 aTokenSupply) =
            IScaledBalanceToken(aToken).getScaledUserBalanceAndSupply(_account);
        aTokenBalance = _standardizeDecimals(aTokenBalance, decimals);

        uint256 veTotalSupply = IVeVmex(VE_VMEX).totalSupply();
        if (veTotalSupply == 0) {
            return aTokenBalance;
        }

        return _min(
            (
                aTokenBalance * BOOSTING_FACTOR
                    + _standardizeDecimals(aTokenSupply, decimals) * IVeVmex(VE_VMEX).balanceOf(_account) / veTotalSupply
                        * (BOOST_DENOMINATOR - BOOSTING_FACTOR)
            ) / BOOST_DENOMINATOR,
            aTokenBalance
        );
    }

    /**
     * @notice
     *  Get rewards for an account
     * @dev rewards are transferred to _account
     * @param _account to claim rewards for
     * @return true
     */
    function claimDVmexReward(address aToken, address _account) external returns (bool) {
        DVmexReward storage reward = _aTokenReward[aToken];
        _updateReward(reward, aToken, _account);
        _getReward(aToken, _account, reward.decimals);
        return true;
    }

    /**
     * @notice Distributes the rewards for the specified account.
     *  @dev
     *   This function MUST NOT be called without the caller invoking
     *   updateReward(_account) first.
     */
    function _getReward(address aToken, address _account, uint8 decimals) internal {
        uint256 boostedBalance = _boostedBalanceOf(aToken, _account, decimals);
        _boostedBalances[aToken][_account] = boostedBalance;

        uint256 reward = _userInfo[aToken][_account].reward;
        if (reward != 0) {
            _userInfo[aToken][_account].reward = 0;
            IERC20(DVMEX).safeTransfer(_account, reward);
        }
    }

    function _transferVeYfiORewards(uint256 _penalty) internal {
        if (_penalty == 0) return;
        IERC20(DVMEX).approve(DVMEX_REWARD_POOL, _penalty);
        IDVmexRewardPool(DVMEX_REWARD_POOL).burn(_penalty);
    }

    function getDVmexReward(address aToken) external view returns (DVmexReward memory) {
        return _aTokenReward[aToken];
    }

    function updateBoostedBalanceOf(address aToken, address user) external onlyGlobalAdmin {
        DVmexReward storage reward = _aTokenReward[aToken];
        _updateReward(reward, aToken, user);

        _boostedBalances[aToken][user] = _boostedBalanceOf(aToken, user, reward.decimals);
    }
}
