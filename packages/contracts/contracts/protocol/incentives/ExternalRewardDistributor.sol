// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IStakingRewards} from '../../interfaces/IStakingRewards.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {ILendingPool} from '../../interfaces/ILendingPool.sol';
import {IAssetMappings} from '../../interfaces/IAssetMappings.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {IExternalRewardsDistributor} from '../../interfaces/IExternalRewardsDistributor.sol';
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title VMEX External Rewards Distributor.
/// @author Volatile Labs Ltd.
/// @notice This contract allows Vmex users to claim their rewards. This contract is largely inspired by Euler Distributor's contract: https://github.com/euler-xyz/euler-contracts/blob/master/contracts/mining/EulDistributor.sol.
contract ExternalRewardDistributor is IExternalRewardsDistributor, Initializable {
  using SafeERC20 for IERC20;

  mapping(address => address) internal stakingData; // incentivized aToken => address of staking contract
  address public manager;
  ILendingPoolAddressesProvider public addressesProvider;

  bytes32 public currRoot; // The merkle tree's root of the current rewards distribution.
  bytes32 public prevRoot; // The merkle tree's root of the previous rewards distribution.
  mapping(address => mapping(address => uint256)) public claimed; // The rewards already claimed. account -> amount.

  uint256[40] __gap_ExternalRewardDistributor;

  function __ExternalRewardDistributor_init(address _addressesProvider) internal onlyInitializing {
    addressesProvider = ILendingPoolAddressesProvider(_addressesProvider);
    manager = addressesProvider.getGlobalAdmin();
  }

  modifier onlyManager() {
    require(msg.sender == manager, 'Only manager');
    _;
  }

  function stakingExists(address aToken) internal view returns (bool) {
    return stakingData[aToken] != address(0);
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
    
    require(!stakingExists(aToken), "Cannot add staking reward for a token that already has staking");
    require(!IAssetMappings(assetMappings).getAssetBorrowable(underlying), "Underlying cannot be borrowable for external rewards");

    stakingData[aToken] = stakingContract;
    if(IERC20(underlying).allowance(address(this), stakingContract) == 0) {
      IERC20(underlying).safeIncreaseAllowance(stakingContract, type(uint).max);
    }
    
    //transfer all aToken's underlying to this contract and stake it
    uint256 amount = IERC20(aToken).totalSupply();
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

    uint256 amount = IERC20(aToken).totalSupply();
    if(amount!=0){
      IStakingRewards(stakingData[aToken]).withdraw(amount);
      IERC20(underlying).safeTransfer(aToken, amount);
    }
    stakingData[aToken] = address(0);

    //event
    emit StakingRemoved(aToken);
  }

  function onDeposit(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();

    IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
    IStakingRewards(stakingData[msg.sender]).stake(amount);

    // event emission necessary for off chain calculation of looping through all active users
    emit UserDeposited(user, msg.sender, amount);
  }

  function onWithdraw(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();

    IStakingRewards(stakingData[msg.sender]).withdraw(amount);
    IERC20(underlying).safeTransfer(msg.sender, amount);

    // event emission necessary for off chain calculation of looping through all active users
    emit UserWithdraw(user, msg.sender, amount);
  }

  function onTransfer(address user, uint256 amount, bool sender) internal {
    //no-op since totalStaked doesn't change, the amounts each person owns is calculated off chain
    emit UserTransfer(user, msg.sender, amount, sender);
  }

  function getStakingContract(address aToken) external view returns (address stakingContract) {
      return stakingData[aToken];
  }

  function harvestReward(address stakingContract) external onlyManager {
      IStakingRewards(stakingContract).getReward();
  }

  function rescueRewardTokens(IERC20 reward, address receiver) external onlyManager {
    reward.safeTransfer(receiver, reward.balanceOf(address(this)));
  }

  /// @notice Updates the current merkle tree's root.
  /// @param _newRoot The new merkle tree's root.
  function updateRoot(bytes32 _newRoot) external onlyManager {
      prevRoot = currRoot;
      currRoot = _newRoot;
      emit RootUpdated(_newRoot);
  }

  /// @notice Claims rewards.
  /// @param _account The address of the claimer.
  /// @param _rewardToken The address of the reward token.
  /// @param _claimable The overall claimable amount of token rewards.
  /// @param _proof The merkle proof that validates this claim.
  function claim(
      address _account,
      address _rewardToken,
      uint256 _claimable,
      bytes32[] calldata _proof
  ) external {
      bytes32 candidateRoot = MerkleProof.processProof(
          _proof,
          keccak256(abi.encodePacked(_account, _rewardToken, _claimable))
      );
      if (candidateRoot != currRoot && candidateRoot != prevRoot) revert ProofInvalidOrExpired();

      uint256 alreadyClaimed = claimed[_account][_rewardToken];
      if (_claimable <= alreadyClaimed) revert AlreadyClaimed();

      uint256 amount;
      unchecked {
          amount = _claimable - alreadyClaimed;
      }

      claimed[_account][_rewardToken] = _claimable;

      IERC20(_rewardToken).safeTransfer(_account, amount);
      emit RewardsClaimed(_account, amount);
  }
}
