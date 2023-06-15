// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IStakingRewards} from '../../interfaces/IStakingRewards.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {IAssetMappings} from '../../interfaces/IAssetMappings.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {IExternalRewardsDistributor} from '../../interfaces/IExternalRewardsDistributor.sol';
import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';

contract ExternalRewardDistributor is IExternalRewardsDistributor {
  using SafeERC20 for IERC20;

  mapping(address => StakingReward) internal stakingData; // incentivized underlying asset => reward info
  mapping(address => ATokenData) internal aTokenStaking; //  aToken => selected reward index => amount that atoken has staked
  address public immutable manager;
  ILendingPoolAddressesProvider public immutable addressesProvider;

  constructor(address _manager, address _addressesProvider) {
    manager = _manager;
    addressesProvider = ILendingPoolAddressesProvider(_addressesProvider);
  }

  modifier onlyManager() {
    require(msg.sender == manager, 'Only manager');
    _;
  }

  function stakingExists(address aToken) internal view returns (bool) {
    uint256 currentInd = aTokenStaking[aToken].currentStakingContractIndex;
    return aTokenStaking[aToken].metadata[currentInd].enabled;
  }

  /**
   * @dev Called by the manager to specify that an underlying has an external reward (once it's added, it cannot be edited)
   * @param underlying The address of the underlying that has an external reward
   * @param staking The address of the staking contract
   * @param reward The address of the reward token
   **/
  function addStakingReward(
    address underlying,
    address staking,
    address reward
  ) public onlyManager {
    require(staking != address(0) && reward != address(0), 'No zero address');
    address assetMappings = addressesProvider.getAssetMappings();
    require(!IAssetMappings(assetMappings).getAssetBorrowable(underlying), "Underlying cannot be borrowable for external rewards");
    
    StakingReward storage dat = stakingData[underlying];
    
    dat.staking[dat.numStakingContracts].stakingContract = IStakingRewards(staking);
    IERC20(underlying).approve(staking, type(uint).max);
    dat.staking[dat.numStakingContracts].rewardContract = IERC20(reward);

    dat.numStakingContracts += 1;

    emit RewardConfigured(underlying, reward, staking, dat.numStakingContracts);
  }

  /**
   * @dev Called by the tranche admins to specify that aToken has an external reward
   * @param aToken The address of the underlying that has an external reward
   * @param stakingContractIndex The index of the staking contract in the StakingReward list
   **/
  function beginStakingReward(
    address aToken,
    uint256 stakingContractIndex
  ) public onlyManager { //if tranches want to activate they need to talk to us first
    require(!stakingExists(aToken), "Cannot add staking reward for a token that already has staking");

    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();

    require(stakingContractIndex < stakingData[underlying].numStakingContracts, "invalid index of staking contract");

    address assetMappings = addressesProvider.getAssetMappings();
    ATokenMetadata storage aTokenData = aTokenStaking[aToken].metadata[stakingContractIndex];

    require(!IAssetMappings(assetMappings).getAssetBorrowable(underlying), "Underlying cannot be borrowable for external rewards");

    aTokenData.enabled = true;

    //transfer all aToken's underlying to this contract and stake it
    uint256 amount = IAToken(aToken).totalSupply();
    IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
    stakingData[underlying].staking[stakingContractIndex].stakingContract.stake(amount);
    aTokenData.totalStaked += amount;

    emit ATokenRewardStarted(aToken, stakingContractIndex, amount);
  }

  function batchAddStakingRewards(
      address[] calldata underlyings,
      address[] calldata stakingContracts,
      address[] calldata rewards
  ) external onlyManager {
    require(underlyings.length == stakingContracts.length
        && stakingContracts.length == rewards.length, "Malformed input");

    for(uint i = 0; i < underlyings.length; i++) {
        addStakingReward(underlyings[i], stakingContracts[i], rewards[i]);
    }
  }

  /**
   * @dev Removes all liquidity from the staking contract and sends back to the atoken. Subsequent calls to handleAction doesn't call onDeposit, etc
   * @param aToken The address of the aToken that wants to exit the staking contract
   **/
  function removeStakingReward(address aToken) external onlyManager {
    uint256 stakingContractIndex = aTokenStaking[aToken].currentStakingContractIndex;
    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();

    uint256 amount = aTokenStaking[aToken].metadata[stakingContractIndex].totalStaked;
    stakingData[underlying].staking[stakingContractIndex].stakingContract.withdraw(amount);
    IERC20(underlying).safeTransfer(aToken, amount);
    aTokenStaking[aToken].metadata[stakingContractIndex].totalStaked = 0;
    aTokenStaking[aToken].metadata[stakingContractIndex].enabled = false;

    //event
    emit StakingRemoved(aToken);
  }

  function onDeposit(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
    uint256 stakingContractIndex = aTokenStaking[msg.sender].currentStakingContractIndex;

    StakingContractMetadata storage rewardData = stakingData[underlying].staking[stakingContractIndex];
    ATokenMetadata storage aTokenData = aTokenStaking[msg.sender].metadata[stakingContractIndex];

    IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
    rewardData.stakingContract.stake(amount);
    aTokenData.totalStaked += amount;
  }

  function onWithdraw(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
    uint256 stakingContractIndex = aTokenStaking[msg.sender].currentStakingContractIndex;

    StakingContractMetadata storage rewardData = stakingData[underlying].staking[stakingContractIndex];
    ATokenMetadata storage aTokenData = aTokenStaking[msg.sender].metadata[stakingContractIndex];

    rewardData.stakingContract.withdraw(amount);
    IERC20(underlying).safeTransfer(msg.sender, amount);
    aTokenData.totalStaked -= amount;
  }

  function onTransfer(address user, uint256 amount, bool sender) internal {
    //no-op since totalStaked doesn't change, the amounts each person owns is calculated off chain
  }

  // function _claimStakingReward(
  //   address underlying,
  //   uint256 amount
  // ) internal {

  //   StakingReward storage rewardData = stakingData[underlying];
  //   require(rewardData.users[msg.sender].rewardBalance >= amount, 'Insufficient balance');
  //   rewardData.reward.safeTransfer(msg.sender, amount);
  //   rewardData.users[msg.sender].rewardBalance -= amount;
  //   emit StakingRewardClaimed(msg.sender, underlying, address(rewardData.reward), amount);
  // }

  // function claimStakingReward(address underlying, uint256 amount) external {
  //   _claimStakingReward(underlying, amount);
  // }

  // function batchClaimStakingRewards(
  //   address[] calldata assets,
  //   uint256[] calldata amounts
  // ) external {
  //   require(assets.length == amounts.length, 'Malformed input');
  //   for (uint256 i = 0; i < assets.length; i++) {
  //     _claimStakingReward(assets[i], amounts[i]);
  //   }
  // }

  function getDataByAToken(address aToken) external view
  returns (address underlyingContract, address stakingContract, address rewardContract) {
      
    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
    uint256 stakingContractIndex = aTokenStaking[aToken].currentStakingContractIndex;

    StakingContractMetadata storage rewardData = stakingData[underlying].staking[stakingContractIndex];
    ATokenMetadata storage aTokenData = aTokenStaking[aToken].metadata[stakingContractIndex];
      return (
          underlying,
          address(rewardData.stakingContract),
          address(rewardData.rewardContract)
      );
  }

  function _totalStaked(address aToken) internal view returns (uint256) {
    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
    uint256 stakingContractIndex = aTokenStaking[aToken].currentStakingContractIndex;

    StakingContractMetadata storage rewardData = stakingData[underlying].staking[stakingContractIndex];
    ATokenMetadata storage aTokenData = aTokenStaking[aToken].metadata[stakingContractIndex];
    return aTokenData.totalStaked;
  }

  function rescueRewardTokens(IERC20 reward, address receiver) external onlyManager {
    reward.safeTransfer(receiver, reward.balanceOf(address(this)));
  }
}
