// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {DistributionTypes} from '../libraries/types/DistributionTypes.sol';
import {IDistributionManager} from '../../interfaces/IDistributionManager.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {IVeVmex} from "../../interfaces/IVeVmex.sol";
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";

/**
 * @title DistributionManager
 * @notice Accounting contract to manage multiple staking distributions
 * @author Aave and VMEX
 **/
abstract contract DistributionManager is IDistributionManager, Initializable {
  //atoken address to distribution data
  mapping(address => DistributionTypes.IncentivizedAsset) internal _incentivizedAssets;

  address[] internal _allIncentivizedAssets;
  address[] internal _allRewards;

  address public EMISSION_MANAGER;

  address public VE_VMEX;
  address public PENALTY_RECIEVER;

  uint256 internal constant BOOSTING_FACTOR = 1;
  uint256 internal constant BOOST_DENOMINATOR = 10;
  uint256 internal constant STANDARD_DECIMALS = 18;

  uint256[35] __gap_DistributionManager;

  function __DistributionManager_init(address emissionManager) public onlyInitializing {
    EMISSION_MANAGER = emissionManager;
  }

  modifier onlyEmissionManager() {
      _onlyEmissionManager();
      _;
  }

  function _onlyEmissionManager() internal view {
      require(msg.sender == EMISSION_MANAGER, 'ONLY_EMISSION_MANAGER');
  }


  function setVeVmex(address veVmex) external onlyEmissionManager {
      VE_VMEX = veVmex;
  }

  function setPenaltyReciever(address penaltyReciever) external onlyEmissionManager {
      PENALTY_RECIEVER = penaltyReciever;
  }

  function changeDistributionManager(address newManager) external onlyEmissionManager {
    EMISSION_MANAGER = newManager;
  }

  /**
   * @dev Configures the distribution of rewards for a list of assets
   * @param config The list of configurations to apply
   **/
  function configureRewards(RewardConfig[] calldata config) external onlyEmissionManager override {
    uint256 length = config.length;
    for (uint256 i; i < length;) {
      DistributionTypes.IncentivizedAsset storage incentivizedAsset = _incentivizedAssets[
        config[i].incentivizedAsset
      ];
      DistributionTypes.Reward storage reward = incentivizedAsset.rewardData[config[i].reward];

      if (incentivizedAsset.numRewards == 0) {
        // this incentivized asset has not been introduced yet
        _allIncentivizedAssets.push(config[i].incentivizedAsset);
        incentivizedAsset.decimals = IERC20Detailed(config[i].incentivizedAsset).decimals();
      }
      if (reward.lastUpdateTimestamp == 0) {
        // this reward has not been introduced yet
        incentivizedAsset.rewardList[incentivizedAsset.numRewards] = config[i].reward;
        incentivizedAsset.numRewards++;
        _allRewards.push(config[i].reward);
      }

      uint256 totalSupply = IAToken(config[i].incentivizedAsset).scaledTotalSupply();
      (uint256 index, ) = _updateReward(reward, totalSupply, incentivizedAsset.decimals);

      reward.emissionPerSecond = config[i].emissionPerSecond;
      reward.endTimestamp = config[i].endTimestamp;

      emit RewardConfigUpdated(
        config[i].incentivizedAsset,
        config[i].reward,
        config[i].emissionPerSecond,
        config[i].endTimestamp,
        index
      );

      unchecked { ++i; }
    }
  }

  /**
   * @dev Updates the reward's index and lastUpdateTimestamp
   **/
  function _updateReward(
    DistributionTypes.Reward storage reward,
    uint256 totalSupply,
    uint8 decimals
  ) internal returns (uint256, bool) {
    bool updated;
    uint256 newIndex = _getAssetIndex(reward, totalSupply, decimals);

    if (newIndex != reward.index) {
      reward.index = newIndex;
      updated = true;
    }
    reward.lastUpdateTimestamp = uint128(block.timestamp);

    return (newIndex, updated);
  }

  /**
   * @dev Updates the user's accrued rewards, index and lastUpdateTimestamp for a specific reward
   **/
  function _updateUser(
    DistributionTypes.Reward storage reward,
    UpdateUserParams memory params
  ) internal returns (uint256, bool) {
    bool updated;
    uint256 boosted_accrued;
    uint256 userIndex = reward.users[params.user].index;
    uint256 rewardIndex = reward.index;

    if (userIndex != rewardIndex) {
      if (params.balance != 0) {
        uint256 veTotalSupply = IVeVmex(VE_VMEX).totalSupply();
        uint256 veUserBalance = IVeVmex(VE_VMEX).balanceOf(msg.sender);

        uint256 aTokenTotalSupply = _standardizeDecimals(IERC20(params.asset).totalSupply(), _incentivizedAssets[params.asset].decimals);
        uint256 accrued = _getReward(params.balance, rewardIndex, userIndex, params.decimals); 
        //account for boost
        boosted_accrued = _calculateBoostedClaimable(veTotalSupply, aTokenTotalSupply, veUserBalance, accrued);

        uint256 penaltyAmount = accrued - boosted_accrued;

        //send penalty
        if (penaltyAmount != 0) {
            _transferPenaltyRewards(params.rewardAddress, penaltyAmount);
        }

        reward.users[params.user].accrued += boosted_accrued;
      }
      reward.users[params.user].index = rewardIndex;
      updated = true;
    }

    return (boosted_accrued, updated);
  }

  function _transferPenaltyRewards(address reward, uint256 penaltyAmount) internal virtual;


    // assumes biggest decimals is 18
    function _standardizeDecimals(uint256 amount, uint256 decimals) internal pure returns (uint256) {
        return decimals != STANDARD_DECIMALS ? amount * 10 ** (STANDARD_DECIMALS - decimals) : amount;
    }

  function _calculateBoostedClaimable(
        uint256 veTotalSupply,
        uint256 aTokenTotalSupply,
        uint256 veUserBalance,
        uint256 claimable
    ) internal pure returns (uint256) {
        return veTotalSupply == 0
            ? claimable
            : _min(
                (
                    claimable * BOOSTING_FACTOR
                        + ((aTokenTotalSupply * veUserBalance) / veTotalSupply) * (BOOST_DENOMINATOR - BOOSTING_FACTOR)
                ) / BOOST_DENOMINATOR,
                claimable
            );
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

  /**
   * @dev Updates an incentivized asset's index and lastUpdateTimestamp
   **/
  function _updateIncentivizedAsset(
    address asset,
    address user,
    uint256 userBalance,
    uint256 assetSupply
  ) internal {
    assert(userBalance <= assetSupply); // will catch cases such as if userBalance and assetSupply were flipped
    DistributionTypes.IncentivizedAsset storage incentivizedAsset = _incentivizedAssets[asset];
    IDistributionManager.UpdateIncentivizedAsset memory params;

    for (; params.i < incentivizedAsset.numRewards;) {
      params.rewardAddress = incentivizedAsset.rewardList[params.i];

      DistributionTypes.Reward storage reward = incentivizedAsset.rewardData[params.rewardAddress];

      params.decimals = incentivizedAsset.decimals;

      (params.newIndex, params.rewardUpdated) = _updateReward(
        reward,
        assetSupply,
        params.decimals
      );
      (params.rewardAccrued, params.userUpdated) = _updateUser(
        reward,
        UpdateUserParams(
          user,
          userBalance,
          params.decimals,
          asset,
          params.rewardAddress
        )
      );

      if (params.rewardUpdated || params.userUpdated) {
        // note the user index will be the same as the reward index in the case rewardUpdated=true or userUpdated=true
        emit RewardAccrued(asset, params.rewardAddress, user, params.newIndex, params.newIndex, params.rewardAccrued);
      }

      unchecked { ++params.i; }
    }
  }

  /**
   * @dev Updates the index of all incentivized assets the user passes in.
   **/
  function _batchUpdate(
    address user,
    DistributionTypes.UserAssetState[] memory userAssets
  ) internal {
    uint256 length = userAssets.length;
    for (uint256 i; i < length;) {
      _updateIncentivizedAsset(
        userAssets[i].asset,
        user,
        userAssets[i].userBalance,
        userAssets[i].totalSupply
      );
      unchecked { ++i; }
    }
  }

  /**
   * @dev Calculates the user's rewards on a reward distribution
   * @param principalUserBalance Amount staked by the user on a reward
   * @param rewardIndex The index of the reward
   * @param userIndex The index of the user
   * @return The reward calculation
   **/
  function _getReward(
    uint256 principalUserBalance,
    uint256 rewardIndex,
    uint256 userIndex,
    uint8 decimals
  ) internal pure returns (uint256) {
    return principalUserBalance * (rewardIndex - userIndex) / 10 ** decimals;
  }

  /**
   * @dev Calculates the next index of a specific reward
   * @param reward Storage pointer to the distribution reward config
   * @param totalSupply The total supply of the reward asset
   * @param decimals The decimals of reward asset
   * @return The new index.
   **/
  function _getAssetIndex(
    DistributionTypes.Reward storage reward,
    uint256 totalSupply,
    uint8 decimals
  ) internal view returns (uint256) {
    if (
      reward.emissionPerSecond == 0 ||
      totalSupply == 0 ||
      reward.lastUpdateTimestamp == block.timestamp ||
      reward.lastUpdateTimestamp >= reward.endTimestamp
    ) {
      return reward.index;
    }

    uint256 currentTimestamp = block.timestamp > reward.endTimestamp
      ? reward.endTimestamp
      : block.timestamp;

    return (currentTimestamp - reward.lastUpdateTimestamp) * reward.emissionPerSecond * 10 ** decimals / totalSupply + reward.index;
  }

  /**
   * @dev Returns the index of an user on a specific reward streaming for a specific incentivized asset
   * @param user Address of the user
   * @param incentivizedAsset The incentivized asset address
   * @param reward The reward address
   * @return The index
   **/
  function getUserRewardIndex(
    address user,
    address incentivizedAsset,
    address reward
  ) external view returns (uint256) {
    return _incentivizedAssets[incentivizedAsset].rewardData[reward].users[user].index;
  }

  /**
   * @dev Returns the data of a specific reward streaming for a specific incentivized asset
   * @param incentivizedAsset The incentivized asset address
   * @param reward The reward address
   * @return index The index of the reward
   * @return emissionsPerSecond The emissionsPerSecond of the reward
   * @return lastUpdateTimestamp The lastUpdateTimestamp of the reward
   * @return endTimestamp The endTimestamp of the reward
   **/
  function getRewardsData(
    address incentivizedAsset,
    address reward
  ) external view override returns (uint256, uint256, uint256, uint256) {
    return (
      _incentivizedAssets[incentivizedAsset].rewardData[reward].index,
      _incentivizedAssets[incentivizedAsset].rewardData[reward].emissionPerSecond,
      _incentivizedAssets[incentivizedAsset].rewardData[reward].lastUpdateTimestamp,
      _incentivizedAssets[incentivizedAsset].rewardData[reward].endTimestamp
    );
  }

  /**
   * @dev Returns a user's total accrued rewards for a specifc reward address
   * @param user The user's address
   * @param reward The reward address
   * @return total The total amount of accrued rewards
   **/
  function getAccruedRewards(
    address user,
    address reward
  ) external view override returns (uint256) {
    uint256 total;
    uint256 length = _allIncentivizedAssets.length;
    for (uint256 i; i < length;) {
      total += _incentivizedAssets[_allIncentivizedAssets[i]]
        .rewardData[reward]
        .users[user]
        .accrued;

      unchecked { ++i; }
    }

    return total;
  }
}
