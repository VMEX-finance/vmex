// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IYearnStakingRewards} from '../../interfaces/IYearnStakingRewards.sol';
import {IVelodromeStakingRewards} from '../../interfaces/IVelodromeStakingRewards.sol';
import {IAToken} from '../../interfaces/IAToken.sol';
import {ILendingPool} from '../../interfaces/ILendingPool.sol';
import {IAssetMappings} from '../../interfaces/IAssetMappings.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {IExternalRewardsDistributor} from '../../interfaces/IExternalRewardsDistributor.sol';
import {IAuraBooster} from '../../interfaces/IAuraBooster.sol';
import {IAuraRewardPool} from '../../interfaces/IAuraRewardPool.sol';
import {ICurveRewardGauge} from '../../interfaces/ICurveRewardGauge.sol';
import {ICurveGaugeFactory} from '../../interfaces/ICurveGaugeFactory.sol';
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';
import {Errors} from "../libraries/helpers/Errors.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title VMEX External Rewards Distributor.
/// @author Volatile Labs Ltd.
/// @notice This contract allows Vmex users to claim their rewards. This contract is largely inspired by Euler Distributor's contract: https://github.com/euler-xyz/euler-contracts/blob/master/contracts/mining/EulDistributor.sol.
/// Note: msg.sender will always be the aToken who sent the call to IncentivesController
contract ExternalRewardDistributor is IExternalRewardsDistributor, Initializable {
  using SafeERC20 for IERC20;

  mapping(address => address) internal stakingData; // incentivized aToken => address of staking contract
  mapping(address => StakingType) public stakingTypes; // staking contract => type of staking contract
  ILendingPoolAddressesProvider public addressesProvider;

  bytes32 public currRoot; // The merkle tree's root of the current rewards distribution.
  mapping(address => mapping(address => uint256)) public claimed; // The rewards already claimed. account -> amount.

  address public rewardAdmin;

  address public curveGaugeFactory;

  uint256[39] __gap_ExternalRewardDistributor;

  modifier onlyGlobalAdmin() {
      Helpers.onlyGlobalAdmin(addressesProvider, msg.sender);
      _;
  }

  modifier onlyVerifiedTrancheAdmin(uint64 trancheId) {
      Helpers.onlyVerifiedTrancheAdmin(addressesProvider, trancheId, msg.sender);
      _;
  }

  modifier onlyRewardAdmin() {
    require(msg.sender == rewardAdmin, "Only reward admin");
    _;
  }

  function __ExternalRewardDistributor_init(address _addressesProvider) internal onlyInitializing {
    addressesProvider = ILendingPoolAddressesProvider(_addressesProvider);
  }

  /******** External functions ********/

  /**
    * @dev sets new reward admin to control updating the merkle root regularly (not a multisig)
    * @param newRewardAdmin new reward admin address
    **/
  function setRewardAdmin(address newRewardAdmin) external onlyGlobalAdmin {
    rewardAdmin = newRewardAdmin;

    emit RewardAdminChanged(newRewardAdmin);
  }

  /**
    * @dev begins staking reward for a list of tokens
    * @param aTokens atoken address for the reserve that wants to start staking 
    * @param stakingContracts the corresponding address of the staking contract that is staking the underlying of the aToken
    **/
  function batchBeginStakingRewards(
      address[] calldata aTokens,
      address[] calldata stakingContracts
  ) external {
    require(aTokens.length == stakingContracts.length, "Malformed input");

    for(uint256 i; i < aTokens.length;) {
      //essentially enforces onlyVerifiedTrancheAdmin for every list input
      beginStakingReward(aTokens[i], stakingContracts[i]); //this one has modifier

      unchecked { ++i; }
    }
  }

  /**
   * @dev Called by the global admins to approve and set the type of the staking contract
   * @param _stakingTypes The type of the staking contract
   * @param _stakingContracts The staking contract
   **/
  function setStakingType(
    address[] calldata _stakingContracts,
    StakingType[] calldata _stakingTypes
  ) public onlyGlobalAdmin { 
    uint256 length = _stakingContracts.length;
    require(length == _stakingTypes.length, "length mismatch");
    for(uint256 i; i < length;) {
        stakingTypes[_stakingContracts[i]] = _stakingTypes[i];

        emit StakingTypeSet(_stakingContracts[i], uint8(_stakingTypes[i]));

        unchecked { ++i; }
    }
  }

  /**
   * @dev Removes all liquidity from the staking contract and sends back to the atoken. Subsequent calls to handleAction doesn't call onDeposit, etc
   * @param aToken The address of the aToken that wants to exit the staking contract
   **/
  function removeStakingReward(address aToken) external onlyVerifiedTrancheAdmin(IAToken(aToken)._tranche()) {
    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();

    require(ILendingPool(addressesProvider.getLendingPool()).getReserveData(underlying, IAToken(aToken)._tranche()).aTokenAddress == aToken, "Incorrect aToken");

    uint256 amount = IERC20(aToken).totalSupply();
    if(amount!=0){
      unstake(aToken, amount);
      IERC20(underlying).safeTransfer(aToken, amount);
    }
    stakingData[aToken] = address(0);

    //event
    emit StakingRemoved(aToken);
  }

  /**
     * @dev harvests rewards in a specific staking contract, and emits an event for subgraph to track rewards claiming to distribute to users
     * anyone can call this function to harvest
     * @param stakingContract The contract that staked the tokens and collected rewards
     **/
  function harvestReward(address stakingContract) external {
      if(stakingTypes[stakingContract] == StakingType.VELODROME_V2) {
        IVelodromeStakingRewards(stakingContract).getReward(address(this));
      }
      else if(stakingTypes[stakingContract] == StakingType.YEARN_OP) {
        IYearnStakingRewards(stakingContract).getReward();
      }
      else if(stakingTypes[stakingContract] == StakingType.AURA) {
        require(IAuraRewardPool(stakingContract).getReward(address(this), true), "aura getReward failed");
      }
      else if(stakingTypes[stakingContract] == StakingType.CURVE) {
        ICurveRewardGauge(stakingContract).claim_rewards();
        address curveGaugeFactoryAddress = curveGaugeFactory;
        if (curveGaugeFactoryAddress != address(0)) {
          ICurveGaugeFactory(curveGaugeFactoryAddress).mint(stakingContract);
        }
      }
      else {
        revert("Invalid staking contract");
      }
      emit HarvestedReward(stakingContract);
  }

  /**
   * @dev allows transfer of reward tokens in case they are lost in the IncentivesController contract
   Note that rugging the protocol is protected since the IncentivesController contract should not store any underlying. It only stores reward tokens
   * @param reward The address of the reward token needing rescuing
   * @param receiver The address of the receiver of the reward
   **/
  function rescueRewardTokens(IERC20 reward, address receiver) external onlyGlobalAdmin {
    reward.safeTransfer(receiver, reward.balanceOf(address(this)));
  }

  /// @notice Updates the current merkle tree's root.
  /// @param _newRoot The new merkle tree's root.
  function updateRoot(bytes32 _newRoot) external onlyRewardAdmin {
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
      if (candidateRoot != currRoot) revert("ProofInvalidOrExpired");

      uint256 alreadyClaimed = claimed[_account][_rewardToken];
      if (_claimable <= alreadyClaimed) revert("AlreadyClaimed");

      uint256 amount;
      unchecked {
          amount = _claimable - alreadyClaimed;
      }

      claimed[_account][_rewardToken] = _claimable;

      IERC20(_rewardToken).safeTransfer(_account, amount);
      emit RewardsClaimed(_account, amount);
  }

  function getStakingContract(address aToken) external view returns (address stakingContract) {
      return stakingData[aToken];
  }

  /******** Public functions ********/

  /**
   * @dev Called by the tranche admins (with approval from manager) to specify that aToken has an external reward
   * @param aToken The address of the aToken that has underlying that has an external reward
   * @param stakingContract The staking contract. Note Aura staking contracts will be the rewards contract address (also known as the crvRewards contract)
   **/
  function beginStakingReward(
    address aToken,
    address stakingContract
  ) public onlyVerifiedTrancheAdmin(IAToken(aToken)._tranche()) { 
    address assetMappings = addressesProvider.getAssetMappings();
    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();

    require(ILendingPool(addressesProvider.getLendingPool()).getReserveData(underlying, IAToken(aToken)._tranche()).aTokenAddress == aToken, "Incorrect aToken");
    require(stakingTypes[stakingContract] != StakingType.NOT_SET, "staking contract is not approved");
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
      stake(aToken, amount);
    }
    

    emit RewardConfigured(aToken, stakingContract, amount);
  }

  function setCurveGaugeFactory(address newCurveGaugeFactory) external onlyGlobalAdmin {
    curveGaugeFactory = newCurveGaugeFactory;
    
    emit CurveGaugeFactorySet(newCurveGaugeFactory);
  }

  /******** Internal functions ********/

  /**
   * @dev Determines if staking exists for an aToken by seeing if stakingData has been set (in beginStakingReward)
   * @param aToken The address of the aToken that has underlying that has an external reward
   **/
  function stakingExists(address aToken) internal view returns (bool) {
    return stakingData[aToken] != address(0);
  }

  /**
   * @dev stakes the amount of underlying into the staking contract 
   (the underlying should have been transferred to the IncentivesController earlier in the tx)
   * @param aToken The address of the aToken that has underlying that has an external reward
   * @param amount The amount to stake
   **/
  function stake(address aToken, uint256 amount) internal {
    address stakingContract = stakingData[aToken];

    if(stakingTypes[stakingContract] == StakingType.VELODROME_V2) {
      IVelodromeStakingRewards(stakingContract).deposit(amount);
    }
    else if(stakingTypes[stakingContract] == StakingType.YEARN_OP) {
      IYearnStakingRewards(stakingContract).stake(amount);
    }
    else if(stakingTypes[stakingContract] == StakingType.AURA) {
      //approve operator contract or staker contract?
      // IAuraBooster(IAuraRewardPool(stakingContract).operator()).deposit(IAuraRewardPool(stakingContract).pid(), amount, true);
      require(IAuraRewardPool(stakingContract).deposit(amount, address(this)) == amount, "aura staking failed");
    }
    else if(stakingTypes[stakingContract] == StakingType.CURVE) {
      ICurveRewardGauge(stakingContract).deposit(amount);
    }
    else {
      revert("Asset type has no valid staking");
    }
  }

  /**
   * @dev unstakes the amount of underlying out of the staking contract 
   * @param aToken The address of the aToken that has underlying that has an external reward
   * @param amount The amount to unstake
   **/
  function unstake(address aToken, uint256 amount) internal {
    address stakingContract = stakingData[aToken];

    if(stakingTypes[stakingContract] == StakingType.VELODROME_V2) {
      IVelodromeStakingRewards(stakingContract).withdraw(amount);
    }
    else if(stakingTypes[stakingContract] == StakingType.YEARN_OP) {
      IYearnStakingRewards(stakingContract).withdraw(amount);
    }
    else if(stakingTypes[stakingContract] == StakingType.AURA) {
      require(IAuraRewardPool(stakingContract).withdrawAndUnwrap(amount, true), "aura unstaking failed");
    }
    else if(stakingTypes[stakingContract] == StakingType.CURVE) {
      ICurveRewardGauge(stakingContract).withdraw(amount);
    }
    else {
      revert("Asset type has no valid staking");
    }
  }

  /**
   * @dev hook on lendingpool deposit (aToken mint) to transfer underlying tokens to this address, then stake it
   * @param user The user who deposited
   * @param amount The amount he deposited
   Note: msg.sender will always be the aToken who sent the call to IncentivesController
   **/
  function onDeposit(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();

    IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
    stake(msg.sender, amount);

    // event emission necessary for off chain calculation of looping through all active users
    emit UserDeposited(user, msg.sender, amount);
  }

  /**
   * @dev hook on lendingpool withdraw (aToken burn) to unstake, and transfer it back to the user
   * @param user The user who withdrew
   * @param amount The amount he withdrew
   **/
  function onWithdraw(
    address user,
    uint256 amount
  ) internal {
    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();

    unstake(msg.sender, amount);
    IERC20(underlying).safeTransfer(msg.sender, amount);

    // event emission necessary for off chain calculation of looping through all active users
    emit UserWithdraw(user, msg.sender, amount);
  }

  /**
   * @dev hook on lendingpool transfer (aToken transfer). 
   Note no staking or unstaking needs to be done, since the same amount is in the staking, but the off chain indexer needs to know that the user balances have shifted
   * @param user The user who is receiving or sending the transfer
   * @param amount The amount he deposited
   * @param sender True if the user is the sender, false if the user is the receiver
   **/
  function onTransfer(address user, uint256 amount, bool sender) internal {
    //no-op since totalStaked doesn't change, the amounts each person owns is calculated off chain
    emit UserTransfer(user, msg.sender, amount, sender);
  }

}
