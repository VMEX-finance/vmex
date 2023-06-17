// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IStakingRewards} from '../../interfaces/IStakingRewards.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {ILendingPool} from '../../interfaces/ILendingPool.sol';
import {IAssetMappings} from '../../interfaces/IAssetMappings.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {IExternalRewardsDistributor} from '../../interfaces/IExternalRewardsDistributor.sol';
import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';

contract ExternalRewardDistributor is IExternalRewardsDistributor {
  using SafeERC20 for IERC20;

  mapping(address => mapping(uint64 => address)) internal stakingData; // incentivized underlying asset => trancheId => address of staking contract
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
    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
    uint64 trancheId = IAToken(aToken)._tranche();
    return stakingData[underlying][trancheId] != address(0);
  }

  /**
   * @dev Called by the tranche admins (with approval from manager) to specify that aToken has an external reward
   * @param aToken The address of the aToken that has underlying that has an external reward
   * @param stakingContract The staking contract
   **/
  function beginStakingReward(
    address aToken,
    address stakingContract
  ) public onlyManager { //if tranches want to activate they need to talk to us first
    address assetMappings = addressesProvider.getAssetMappings();
    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
    uint64 trancheId = IAToken(aToken)._tranche();
    
    require(!stakingExists(aToken), "Cannot add staking reward for a token that already has staking");
    require(!IAssetMappings(assetMappings).getAssetBorrowable(underlying), "Underlying cannot be borrowable for external rewards");

    stakingData[underlying][trancheId] = stakingContract;
    IERC20(underlying).approve(stakingContract, type(uint).max);

    //transfer all aToken's underlying to this contract and stake it
    uint256 amount = IERC20(underlying).balanceOf(aToken);
    if(amount!=0){
      IERC20(underlying).safeTransferFrom(aToken, address(this), amount);
      IStakingRewards(stakingContract).stake(amount);
    }
    

    emit RewardConfigured(aToken, stakingContract, amount);
  }

  function batchBeginStakingRewards(
      address[] calldata aTokens,
      address[] calldata stakingContracts
  ) external onlyManager {
    require(aTokens.length == stakingContracts.length, "Malformed input");

    for(uint i = 0; i < aTokens.length; i++) {
        beginStakingReward(aTokens[i], stakingContracts[i]);
    }
  }

  /**
   * @dev Removes all liquidity from the staking contract and sends back to the atoken. Subsequent calls to handleAction doesn't call onDeposit, etc
   * @param aToken The address of the aToken that wants to exit the staking contract
   **/
  function removeStakingReward(address aToken) external onlyManager {
    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
    uint64 trancheId = IAToken(aToken)._tranche();

    uint256 amount = IERC20(aToken).totalSupply();
    if(amount!=0){
      IStakingRewards(stakingData[underlying][trancheId]).withdraw(amount);
      IERC20(underlying).safeTransfer(aToken, amount);
    }
    stakingData[underlying][trancheId] = address(0);

    //event
    emit StakingRemoved(aToken);
  }

  function onDeposit(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
    uint64 trancheId = IAToken(msg.sender)._tranche();

    IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
    IStakingRewards(stakingData[underlying][trancheId]).stake(amount);

    // event emission necessary for off chain calculation of looping through all active users
    emit UserDeposited(user, underlying, trancheId, amount);
  }

  function onWithdraw(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
    uint64 trancheId = IAToken(msg.sender)._tranche();

    IStakingRewards(stakingData[underlying][trancheId]).withdraw(amount);
    IERC20(underlying).safeTransfer(msg.sender, amount);

    // event emission necessary for off chain calculation of looping through all active users
    emit UserWithdraw(user, underlying, trancheId, amount);
  }

  function onTransfer(address user, uint256 amount, bool sender) internal {
    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
    uint64 trancheId = IAToken(msg.sender)._tranche();
    //no-op since totalStaked doesn't change, the amounts each person owns is calculated off chain
    emit UserTransfer(user, underlying, trancheId, amount, sender);
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

  function getStakingContract(address aToken) external view returns (address stakingContract) {
      address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
      uint64 trancheId = IAToken(aToken)._tranche();
      return stakingData[underlying][trancheId];
  }

  function rescueRewardTokens(IERC20 reward, address receiver) external onlyManager {
    reward.safeTransfer(receiver, reward.balanceOf(address(this)));
  }
}
