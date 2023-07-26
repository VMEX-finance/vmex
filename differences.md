diff --git a/packages/contracts/contracts/protocol/configuration/LendingPoolAddressesProvider.sol b/packages/contracts/contracts/protocol/configuration/LendingPoolAddressesProvider.sol
index 124f3e617..ebf5d5bd6 100644
--- a/packages/contracts/contracts/protocol/configuration/LendingPoolAddressesProvider.sol
+++ b/packages/contracts/contracts/protocol/configuration/LendingPoolAddressesProvider.sol
@@ -53,7 +53,6 @@ contract LendingPoolAddressesProvider is
 
     constructor(string memory marketId) {
         _setMarketId(marketId);
-        permissionlessTranches = false;
     }
 
     function getVMEXTreasury() external view override returns(address){
@@ -439,7 +438,7 @@ contract LendingPoolAddressesProvider is
             _addresses[id] = address(proxy);
             emit ProxyCreated(id, address(proxy));
         } else {
-            proxy.upgradeToAndCall(newAddress, params);
+            proxy.upgradeTo(newAddress); // no more re-initialization of proxies
         }
     }
 
@@ -470,7 +469,7 @@ contract LendingPoolAddressesProvider is
     }
 
     function setIncentivesController(address incentives) external override onlyOwner{
-        _addresses[INCENTIVES_CONTROLLER] = incentives;
+        _updateImpl(INCENTIVES_CONTROLLER, incentives);
         emit IncentivesControllerUpdated(incentives);
     }
 }
diff --git a/packages/contracts/contracts/protocol/configuration/LendingPoolAddressesProviderRegistry.sol b/packages/contracts/contracts/protocol/configuration/LendingPoolAddressesProviderRegistry.sol
index 877cac238..11b48ae48 100644
--- a/packages/contracts/contracts/protocol/configuration/LendingPoolAddressesProviderRegistry.sol
+++ b/packages/contracts/contracts/protocol/configuration/LendingPoolAddressesProviderRegistry.sol
@@ -38,10 +38,14 @@ contract LendingPoolAddressesProviderRegistry is
 
         address[] memory activeProviders = new address[](maxLength);
 
-        for (uint256 i = 0; i < maxLength; i++) {
-            if (_addressesProviders[addressesProvidersList[i]] > 0) {
-                activeProviders[i] = addressesProvidersList[i];
+        address addr;
+        for (uint256 i; i < maxLength;) {
+            addr = addressesProvidersList[i];
+            if (_addressesProviders[addr] != 0) {
+                activeProviders[i] = addr;
             }
+
+            unchecked { ++i; }
         }
 
         return activeProviders;
@@ -74,7 +78,7 @@ contract LendingPoolAddressesProviderRegistry is
         onlyOwner
     {
         require(
-            _addressesProviders[provider] > 0,
+            _addressesProviders[provider] != 0,
             Errors.LPAPR_PROVIDER_NOT_REGISTERED
         );
         _addressesProviders[provider] = 0;
@@ -97,10 +101,12 @@ contract LendingPoolAddressesProviderRegistry is
     function _addToAddressesProvidersList(address provider) internal {
         uint256 providersCount = _addressesProvidersList.length;
 
-        for (uint256 i = 0; i < providersCount; i++) {
+        for (uint256 i; i < providersCount;) {
             if (_addressesProvidersList[i] == provider) {
                 return;
             }
+
+            unchecked { ++i; }
         }
 
         _addressesProvidersList.push(provider);
diff --git a/packages/contracts/contracts/protocol/incentives/DistributionManager.sol b/packages/contracts/contracts/protocol/incentives/DistributionManager.sol
index 8c6476c50..c5506cd0d 100644
--- a/packages/contracts/contracts/protocol/incentives/DistributionManager.sol
+++ b/packages/contracts/contracts/protocol/incentives/DistributionManager.sol
@@ -1,29 +1,29 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {DistributionTypes} from '../libraries/types/DistributionTypes.sol';
 import {IDistributionManager} from '../../interfaces/IDistributionManager.sol';
 import {IAToken} from '../../interfaces/IAToken.sol';
 import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 
 /**
  * @title DistributionManager
  * @notice Accounting contract to manage multiple staking distributions
  * @author Aave and VMEX
  **/
-contract DistributionManager is IDistributionManager {
-  using SafeMath for uint256;
-
+contract DistributionManager is IDistributionManager, Initializable {
   //atoken address to distribution data
   mapping(address => DistributionTypes.IncentivizedAsset) internal _incentivizedAssets;
 
   address[] internal _allIncentivizedAssets;
   address[] internal _allRewards;
 
-  address public immutable EMISSION_MANAGER;
+  address public EMISSION_MANAGER;
+
+  uint256[40] __gap_DistributionManager;
 
-  constructor(address emissionManager) {
+  function __DistributionManager_init(address emissionManager) public onlyInitializing {
     EMISSION_MANAGER = emissionManager;
   }
 
@@ -33,13 +33,14 @@ contract DistributionManager is IDistributionManager {
    **/
   function configureRewards(RewardConfig[] calldata config) external override {
     require(msg.sender == EMISSION_MANAGER, 'ONLY_EMISSION_MANAGER');
-    for (uint256 i = 0; i < config.length; i++) {
+    uint256 length = config.length;
+    for (uint256 i; i < length;) {
       DistributionTypes.IncentivizedAsset storage incentivizedAsset = _incentivizedAssets[
         config[i].incentivizedAsset
       ];
       DistributionTypes.Reward storage reward = incentivizedAsset.rewardData[config[i].reward];
 
-      if (incentivizedAsset.decimals == 0) {
+      if (incentivizedAsset.numRewards == 0) {
         // this incentivized asset has not been introduced yet
         _allIncentivizedAssets.push(config[i].incentivizedAsset);
         incentivizedAsset.decimals = IERC20Detailed(config[i].incentivizedAsset).decimals();
@@ -64,6 +65,8 @@ contract DistributionManager is IDistributionManager {
         config[i].endTimestamp,
         index
       );
+
+      unchecked { ++i; }
     }
   }
 
@@ -88,7 +91,7 @@ contract DistributionManager is IDistributionManager {
   }
 
   /**
-   * @dev Updates the user's index and lastUpdateTimestamp for a specific reward
+   * @dev Updates the user's accrued rewards, index and lastUpdateTimestamp for a specific reward
    **/
   function _updateUser(
     DistributionTypes.Reward storage reward,
@@ -99,13 +102,14 @@ contract DistributionManager is IDistributionManager {
     bool updated;
     uint256 accrued;
     uint256 userIndex = reward.users[user].index;
+    uint256 rewardIndex = reward.index;
 
-    if (userIndex != reward.index) {
+    if (userIndex != rewardIndex) {
       if (balance != 0) {
-        accrued = _getReward(balance, reward.index, userIndex, decimals);
+        accrued = _getReward(balance, rewardIndex, userIndex, decimals);
         reward.users[user].accrued += accrued;
       }
-      reward.users[user].index = reward.index;
+      reward.users[user].index = rewardIndex;
       updated = true;
     }
 
@@ -124,26 +128,31 @@ contract DistributionManager is IDistributionManager {
     assert(userBalance <= assetSupply); // will catch cases such as if userBalance and assetSupply were flipped
     DistributionTypes.IncentivizedAsset storage incentivizedAsset = _incentivizedAssets[asset];
 
-    for (uint128 i = 0; i < incentivizedAsset.numRewards; i++) {
+    for (uint256 i; i < incentivizedAsset.numRewards;) {
       address rewardAddress = incentivizedAsset.rewardList[i];
 
       DistributionTypes.Reward storage reward = incentivizedAsset.rewardData[rewardAddress];
 
+      uint8 decimals = incentivizedAsset.decimals;
+
       (uint256 newIndex, bool rewardUpdated) = _updateReward(
         reward,
         assetSupply,
-        incentivizedAsset.decimals
+        decimals
       );
       (uint256 rewardAccrued, bool userUpdated) = _updateUser(
         reward,
         user,
         userBalance,
-        incentivizedAsset.decimals
+        decimals
       );
 
       if (rewardUpdated || userUpdated) {
-        emit RewardAccrued(asset, rewardAddress, user, newIndex, rewardAccrued);
+        // note the user index will be the same as the reward index in the case rewardUpdated=true or userUpdated=true
+        emit RewardAccrued(asset, rewardAddress, user, newIndex, newIndex, rewardAccrued);
       }
+
+      unchecked { ++i; }
     }
   }
 
@@ -154,13 +163,15 @@ contract DistributionManager is IDistributionManager {
     address user,
     DistributionTypes.UserAssetState[] memory userAssets
   ) internal {
-    for (uint256 i = 0; i < userAssets.length; i++) {
+    uint256 length = userAssets.length;
+    for (uint256 i; i < length;) {
       _updateIncentivizedAsset(
         userAssets[i].asset,
         user,
         userAssets[i].userBalance,
         userAssets[i].totalSupply
       );
+      unchecked { ++i; }
     }
   }
 
@@ -177,7 +188,7 @@ contract DistributionManager is IDistributionManager {
     uint256 userIndex,
     uint8 decimals
   ) internal pure returns (uint256) {
-    return principalUserBalance.mul(rewardIndex.sub(userIndex)).div(10 ** decimals);
+    return principalUserBalance * (rewardIndex - userIndex) / 10 ** decimals;
   }
 
   /**
@@ -204,11 +215,8 @@ contract DistributionManager is IDistributionManager {
     uint256 currentTimestamp = block.timestamp > reward.endTimestamp
       ? reward.endTimestamp
       : block.timestamp;
-    uint256 timeDelta = currentTimestamp.sub(reward.lastUpdateTimestamp);
-    return
-      uint256(reward.emissionPerSecond).mul(timeDelta).mul(10 ** decimals).div(totalSupply).add(
-        reward.index
-      );
+
+    return (currentTimestamp - reward.lastUpdateTimestamp) * reward.emissionPerSecond * 10 ** decimals / totalSupply + reward.index;
   }
 
   /**
@@ -258,11 +266,14 @@ contract DistributionManager is IDistributionManager {
     address reward
   ) external view override returns (uint256) {
     uint256 total;
-    for (uint256 i = 0; i < _allIncentivizedAssets.length; i++) {
+    uint256 length = _allIncentivizedAssets.length;
+    for (uint256 i; i < length;) {
       total += _incentivizedAssets[_allIncentivizedAssets[i]]
         .rewardData[reward]
         .users[user]
         .accrued;
+
+      unchecked { ++i; }
     }
 
     return total;
diff --git a/packages/contracts/contracts/protocol/incentives/ExternalRewardDistributor.sol b/packages/contracts/contracts/protocol/incentives/ExternalRewardDistributor.sol
index 8815218d7..166a84eb2 100644
--- a/packages/contracts/contracts/protocol/incentives/ExternalRewardDistributor.sol
+++ b/packages/contracts/contracts/protocol/incentives/ExternalRewardDistributor.sol
@@ -2,83 +2,94 @@
 pragma solidity 0.8.19;
 
 import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
-import {IStakingRewards} from '../../interfaces/IStakingRewards.sol';
+import {IYearnStakingRewards} from '../../interfaces/IYearnStakingRewards.sol';
+import {IVelodromeStakingRewards} from '../../interfaces/IVelodromeStakingRewards.sol';
 import {IAToken} from '../../interfaces/IAToken.sol';
 import {ILendingPool} from '../../interfaces/ILendingPool.sol';
 import {IAssetMappings} from '../../interfaces/IAssetMappings.sol';
 import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
 import {IExternalRewardsDistributor} from '../../interfaces/IExternalRewardsDistributor.sol';
+import {IAuraBooster} from '../../interfaces/IAuraBooster.sol';
+import {IAuraRewardPool} from '../../interfaces/IAuraRewardPool.sol';
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';
+import {Errors} from "../libraries/helpers/Errors.sol";
+import {Helpers} from "../libraries/helpers/Helpers.sol";
 import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
 
 /// @title VMEX External Rewards Distributor.
 /// @author Volatile Labs Ltd.
 /// @notice This contract allows Vmex users to claim their rewards. This contract is largely inspired by Euler Distributor's contract: https://github.com/euler-xyz/euler-contracts/blob/master/contracts/mining/EulDistributor.sol.
-contract ExternalRewardDistributor is IExternalRewardsDistributor {
+contract ExternalRewardDistributor is IExternalRewardsDistributor, Initializable {
   using SafeERC20 for IERC20;
 
-  mapping(address => mapping(uint64 => address)) internal stakingData; // incentivized underlying asset => trancheId => address of staking contract
-  address public immutable manager;
-  ILendingPoolAddressesProvider public immutable addressesProvider;
+  mapping(address => address) internal stakingData; // incentivized aToken => address of staking contract
+  mapping(address => StakingType) internal stakingTypes; // staking contract => type of staking contract
+  ILendingPoolAddressesProvider public addressesProvider;
 
   bytes32 public currRoot; // The merkle tree's root of the current rewards distribution.
-  bytes32 public prevRoot; // The merkle tree's root of the previous rewards distribution.
   mapping(address => mapping(address => uint256)) public claimed; // The rewards already claimed. account -> amount.
 
-  constructor(address _manager, address _addressesProvider) {
-    manager = _manager;
-    addressesProvider = ILendingPoolAddressesProvider(_addressesProvider);
+  address public rewardAdmin;
+
+  uint256[40] __gap_ExternalRewardDistributor;
+
+  modifier onlyGlobalAdmin() {
+      Helpers.onlyGlobalAdmin(addressesProvider, msg.sender);
+      _;
   }
 
-  modifier onlyManager() {
-    require(msg.sender == manager, 'Only manager');
-    _;
+  modifier onlyVerifiedTrancheAdmin(uint64 trancheId) {
+      Helpers.onlyVerifiedTrancheAdmin(addressesProvider, trancheId, msg.sender);
+      _;
   }
 
-  function stakingExists(address aToken) internal view returns (bool) {
-    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
-    uint64 trancheId = IAToken(aToken)._tranche();
-    return stakingData[underlying][trancheId] != address(0);
+  modifier onlyRewardAdmin() {
+    require(msg.sender == rewardAdmin, "Only reward admin");
+    _;
   }
 
-  /**
-   * @dev Called by the tranche admins (with approval from manager) to specify that aToken has an external reward
-   * @param aToken The address of the aToken that has underlying that has an external reward
-   * @param stakingContract The staking contract
-   **/
-  function beginStakingReward(
-    address aToken,
-    address stakingContract
-  ) public onlyManager { //if tranches want to activate they need to talk to us first
-    address assetMappings = addressesProvider.getAssetMappings();
-    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
-    uint64 trancheId = IAToken(aToken)._tranche();
-    
-    require(!stakingExists(aToken), "Cannot add staking reward for a token that already has staking");
-    require(!IAssetMappings(assetMappings).getAssetBorrowable(underlying), "Underlying cannot be borrowable for external rewards");
+  function __ExternalRewardDistributor_init(address _addressesProvider) internal onlyInitializing {
+    addressesProvider = ILendingPoolAddressesProvider(_addressesProvider);
+  }
 
-    stakingData[underlying][trancheId] = stakingContract;
-    IERC20(underlying).approve(stakingContract, type(uint).max);
+  /******** External functions ********/
 
-    //transfer all aToken's underlying to this contract and stake it
-    uint256 amount = IERC20(aToken).totalSupply();
-    if(amount!=0){
-      IERC20(underlying).safeTransferFrom(aToken, address(this), amount);
-      IStakingRewards(stakingContract).stake(amount);
-    }
-    
+  function setRewardAdmin(address newRewardAdmin) external onlyGlobalAdmin {
+    rewardAdmin = newRewardAdmin;
 
-    emit RewardConfigured(aToken, stakingContract, amount);
+    emit RewardAdminChanged(newRewardAdmin);
   }
 
   function batchBeginStakingRewards(
       address[] calldata aTokens,
       address[] calldata stakingContracts
-  ) external onlyManager {
+  ) external {
     require(aTokens.length == stakingContracts.length, "Malformed input");
 
-    for(uint i = 0; i < aTokens.length; i++) {
-        beginStakingReward(aTokens[i], stakingContracts[i]);
+    for(uint256 i; i < aTokens.length;) {
+      //essentially enforces onlyVerifiedTrancheAdmin for every list input
+      beginStakingReward(aTokens[i], stakingContracts[i]); //this one has modifier
+
+      unchecked { ++i; }
+    }
+  }
+
+  /**
+   * @dev Called by the global admins to approve and set the type of the staking contract
+   * @param _stakingTypes The type of the staking contract
+   * @param _stakingContracts The staking contract
+   **/
+  function setStakingType(
+    address[] calldata _stakingContracts,
+    StakingType[] calldata _stakingTypes
+  ) public onlyGlobalAdmin { //if tranches want to activate they need to talk to us first
+    uint256 length = _stakingContracts.length;
+    require(length == _stakingTypes.length, "length mismatch");
+    for(uint256 i; i < length;) {
+        stakingTypes[_stakingContracts[i]] = _stakingTypes[i];
+
+        unchecked { ++i; }
     }
   }
 
@@ -86,74 +97,48 @@ contract ExternalRewardDistributor is IExternalRewardsDistributor {
    * @dev Removes all liquidity from the staking contract and sends back to the atoken. Subsequent calls to handleAction doesn't call onDeposit, etc
    * @param aToken The address of the aToken that wants to exit the staking contract
    **/
-  function removeStakingReward(address aToken) external onlyManager {
+  function removeStakingReward(address aToken) external onlyVerifiedTrancheAdmin(IAToken(aToken)._tranche()) {
     address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
-    uint64 trancheId = IAToken(aToken)._tranche();
 
     uint256 amount = IERC20(aToken).totalSupply();
     if(amount!=0){
-      IStakingRewards(stakingData[underlying][trancheId]).withdraw(amount);
+      unstake(aToken, amount);
       IERC20(underlying).safeTransfer(aToken, amount);
     }
-    stakingData[underlying][trancheId] = address(0);
+    stakingData[aToken] = address(0);
 
     //event
     emit StakingRemoved(aToken);
   }
 
-  function onDeposit(
-    address user,
-    uint256 amount
-  ) internal {
-    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
-    uint64 trancheId = IAToken(msg.sender)._tranche();
-
-    IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
-    IStakingRewards(stakingData[underlying][trancheId]).stake(amount);
-
-    // event emission necessary for off chain calculation of looping through all active users
-    emit UserDeposited(user, underlying, trancheId, amount);
-  }
-
-  function onWithdraw(
-    address user,
-    uint256 amount
-  ) internal {
-    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
-    uint64 trancheId = IAToken(msg.sender)._tranche();
-
-    IStakingRewards(stakingData[underlying][trancheId]).withdraw(amount);
-    IERC20(underlying).safeTransfer(msg.sender, amount);
-
-    // event emission necessary for off chain calculation of looping through all active users
-    emit UserWithdraw(user, underlying, trancheId, amount);
-  }
-
-  function onTransfer(address user, uint256 amount, bool sender) internal {
-    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
-    uint64 trancheId = IAToken(msg.sender)._tranche();
-    //no-op since totalStaked doesn't change, the amounts each person owns is calculated off chain
-    emit UserTransfer(user, underlying, trancheId, amount, sender);
-  }
-
-  function getStakingContract(address aToken) external view returns (address stakingContract) {
-      address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
-      uint64 trancheId = IAToken(aToken)._tranche();
-      return stakingData[underlying][trancheId];
-  }
-
-  function harvestReward(address stakingContract) external onlyManager {
-      IStakingRewards(stakingContract).getReward();
+  /**
+     * @dev harvests rewards in a specific staking contract, and emits an event for subgraph to track rewards claiming to distribute to users
+     * anyone can call this function to harvest
+     * @param stakingContract The contract that staked the tokens and collected rewards
+     **/
+  function harvestReward(address stakingContract) external {
+      if(stakingTypes[stakingContract] == StakingType.VELODROME_V2) {
+        IVelodromeStakingRewards(stakingContract).getReward(address(this));
+      }
+      else if(stakingTypes[stakingContract] == StakingType.YEARN_OP) {
+        IYearnStakingRewards(stakingContract).getReward();
+      }
+      else if(stakingTypes[stakingContract] == StakingType.AURA) {
+        require(IAuraRewardPool(stakingContract).getReward(address(this), true), "aura getReward failed");
+      }
+      else {
+        revert("Invalid staking contract");
+      }
+      emit HarvestedReward(stakingContract);
   }
 
-  function rescueRewardTokens(IERC20 reward, address receiver) external onlyManager {
+  function rescueRewardTokens(IERC20 reward, address receiver) external onlyGlobalAdmin {
     reward.safeTransfer(receiver, reward.balanceOf(address(this)));
   }
 
   /// @notice Updates the current merkle tree's root.
   /// @param _newRoot The new merkle tree's root.
-  function updateRoot(bytes32 _newRoot) external onlyManager {
-      prevRoot = currRoot;
+  function updateRoot(bytes32 _newRoot) external onlyRewardAdmin {
       currRoot = _newRoot;
       emit RootUpdated(_newRoot);
   }
@@ -173,10 +158,10 @@ contract ExternalRewardDistributor is IExternalRewardsDistributor {
           _proof,
           keccak256(abi.encodePacked(_account, _rewardToken, _claimable))
       );
-      if (candidateRoot != currRoot && candidateRoot != prevRoot) revert ProofInvalidOrExpired();
+      if (candidateRoot != currRoot) revert("ProofInvalidOrExpired");
 
       uint256 alreadyClaimed = claimed[_account][_rewardToken];
-      if (_claimable <= alreadyClaimed) revert AlreadyClaimed();
+      if (_claimable <= alreadyClaimed) revert("AlreadyClaimed");
 
       uint256 amount;
       unchecked {
@@ -188,4 +173,116 @@ contract ExternalRewardDistributor is IExternalRewardsDistributor {
       IERC20(_rewardToken).safeTransfer(_account, amount);
       emit RewardsClaimed(_account, amount);
   }
+
+  function getStakingContract(address aToken) external view returns (address stakingContract) {
+      return stakingData[aToken];
+  }
+
+  /******** Public functions ********/
+
+  /**
+   * @dev Called by the tranche admins (with approval from manager) to specify that aToken has an external reward
+   * @param aToken The address of the aToken that has underlying that has an external reward
+   * @param stakingContract The staking contract. Note Aura staking contracts will be the rewards contract address (also known as the crvRewards contract)
+   **/
+  function beginStakingReward(
+    address aToken,
+    address stakingContract
+  ) public onlyVerifiedTrancheAdmin(IAToken(aToken)._tranche()) { 
+    address assetMappings = addressesProvider.getAssetMappings();
+    address underlying = IAToken(aToken).UNDERLYING_ASSET_ADDRESS();
+    
+    require(stakingTypes[stakingContract] != StakingType.NOT_SET, "staking contract is not approved");
+    require(!stakingExists(aToken), "Cannot add staking reward for a token that already has staking");
+    require(!IAssetMappings(assetMappings).getAssetBorrowable(underlying), "Underlying cannot be borrowable for external rewards");
+
+    stakingData[aToken] = stakingContract;
+    if(IERC20(underlying).allowance(address(this), stakingContract) == 0) {
+      IERC20(underlying).safeIncreaseAllowance(stakingContract, type(uint).max);
+    }
+    
+    //transfer all aToken's underlying to this contract and stake it
+    uint256 amount = IERC20(aToken).totalSupply();
+    if(amount!=0){
+      IERC20(underlying).safeTransferFrom(aToken, address(this), amount);
+      stake(aToken, amount);
+    }
+    
+
+    emit RewardConfigured(aToken, stakingContract, amount);
+  }
+
+  /******** Internal functions ********/
+
+  function stakingExists(address aToken) internal view returns (bool) {
+    return stakingData[aToken] != address(0);
+  }
+
+  function stake(address aToken, uint256 amount) internal {
+    address stakingContract = stakingData[aToken];
+
+    if(stakingTypes[stakingContract] == StakingType.VELODROME_V2) {
+      IVelodromeStakingRewards(stakingContract).deposit(amount);
+    }
+    else if(stakingTypes[stakingContract] == StakingType.YEARN_OP) {
+      IYearnStakingRewards(stakingContract).stake(amount);
+    }
+    else if(stakingTypes[stakingContract] == StakingType.AURA) {
+      //approve operator contract or staker contract?
+      // IAuraBooster(IAuraRewardPool(stakingContract).operator()).deposit(IAuraRewardPool(stakingContract).pid(), amount, true);
+      require(IAuraRewardPool(stakingContract).deposit(amount, address(this)) == amount, "aura staking failed");
+    }
+    else {
+      revert("Asset type has no valid staking");
+    }
+  }
+
+  function unstake(address aToken, uint256 amount) internal {
+    address stakingContract = stakingData[aToken];
+
+    if(stakingTypes[stakingContract] == StakingType.VELODROME_V2) {
+      IVelodromeStakingRewards(stakingContract).withdraw(amount);
+    }
+    else if(stakingTypes[stakingContract] == StakingType.YEARN_OP) {
+      IYearnStakingRewards(stakingContract).withdraw(amount);
+    }
+    else if(stakingTypes[stakingContract] == StakingType.AURA) {
+      require(IAuraRewardPool(stakingContract).withdrawAndUnwrap(amount, true), "aura unstaking failed");
+    }
+    else {
+      revert("Asset type has no valid staking");
+    }
+  }
+
+  function onDeposit(
+    address user,
+    uint256 amount
+  ) internal {
+    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
+
+    IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
+    stake(msg.sender, amount);
+
+    // event emission necessary for off chain calculation of looping through all active users
+    emit UserDeposited(user, msg.sender, amount);
+  }
+
+  function onWithdraw(
+    address user,
+    uint256 amount
+  ) internal {
+    address underlying = IAToken(msg.sender).UNDERLYING_ASSET_ADDRESS();
+
+    unstake(msg.sender, amount);
+    IERC20(underlying).safeTransfer(msg.sender, amount);
+
+    // event emission necessary for off chain calculation of looping through all active users
+    emit UserWithdraw(user, msg.sender, amount);
+  }
+
+  function onTransfer(address user, uint256 amount, bool sender) internal {
+    //no-op since totalStaked doesn't change, the amounts each person owns is calculated off chain
+    emit UserTransfer(user, msg.sender, amount, sender);
+  }
+
 }
diff --git a/packages/contracts/contracts/protocol/incentives/IncentivesController.sol b/packages/contracts/contracts/protocol/incentives/IncentivesController.sol
index 8332a8fe9..d0865ce68 100644
--- a/packages/contracts/contracts/protocol/incentives/IncentivesController.sol
+++ b/packages/contracts/contracts/protocol/incentives/IncentivesController.sol
@@ -2,16 +2,17 @@
 pragma solidity 0.8.19;
 
 import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
-import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {DistributionTypes} from '../libraries/types/DistributionTypes.sol';
 import {IDistributionManager} from '../../interfaces/IDistributionManager.sol';
 import {IAToken} from '../../interfaces/IAToken.sol';
 import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
 import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
 import {IIncentivesController} from '../../interfaces/IIncentivesController.sol';
-import {VersionedInitializable} from "../../dependencies/aave-upgradeability/VersionedInitializable.sol";
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 import {DistributionManager} from './DistributionManager.sol';
 import {ExternalRewardDistributor} from './ExternalRewardDistributor.sol';
+import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
+import {Errors} from "../libraries/helpers/Errors.sol";
 
 /**
  * @title IncentivesController
@@ -20,47 +21,31 @@ import {ExternalRewardDistributor} from './ExternalRewardDistributor.sol';
  **/
 contract IncentivesController is
   IIncentivesController,
-  VersionedInitializable,
+  Initializable,
   DistributionManager,
   ExternalRewardDistributor
 {
-  using SafeMath for uint256;
   using SafeERC20 for IERC20;
-  uint256 public constant REVISION = 1;
 
-  address public immutable REWARDS_VAULT;
-
-  constructor(
-    address rewardsVault,
-    address emissionManager,
-    address externalRewardManager,
-    address addressesProvider
-  ) DistributionManager(emissionManager) 
-    ExternalRewardDistributor(externalRewardManager, addressesProvider) {
-    REWARDS_VAULT = rewardsVault;
-  }
+  address public REWARDS_VAULT;
 
   /**
-   * @dev Called by the proxy contract. Not used at the moment, but for the future
+   * @dev Called by the proxy contract
    **/
-  function initialize() external initializer {
-    // to unlock possibility to stake on behalf of the user
-    // REWARD_TOKEN.approve(address(PSM), type(uint256).max);
+  function initialize(address _addressesProvider) public initializer {
+    ExternalRewardDistributor.__ExternalRewardDistributor_init(_addressesProvider);
+    DistributionManager.__DistributionManager_init(ILendingPoolAddressesProvider(_addressesProvider).getGlobalAdmin());
   }
 
-  /**
-   * @dev Returns the revision of the implementation contract
-   * @return uint256, current revision version
-   */
-  function getRevision() internal pure override returns (uint256) {
-    return REVISION;
+  function setRewardsVault(address rewardsVault) external onlyGlobalAdmin {
+    REWARDS_VAULT = rewardsVault;
   }
 
   /**
    * @dev Called by the corresponding asset on any update that affects the rewards distribution
    * @param user The address of the user
-   * @param oldBalance The old balance of the user of the asset in the lending pool
    * @param totalSupply The (old) total supply of the asset in the lending pool
+   * @param oldBalance The old balance of the user of the asset in the lending pool
    * @param newBalance The new balance of the user of the asset in the lending pool
    * @param action Deposit, withdrawal, or transfer
    **/
@@ -85,23 +70,25 @@ contract IncentivesController is
           } else if (newBalance > oldBalance) {
             onTransfer(user, newBalance - oldBalance, false);
           }
-          
       }
     }
   }
 
   function _getUserState(
-    address[] memory assets,
+    address[] calldata assets,
     address user
   ) internal view returns (DistributionTypes.UserAssetState[] memory) {
     DistributionTypes.UserAssetState[] memory userState = new DistributionTypes.UserAssetState[](
       assets.length
     );
 
-    for (uint256 i = 0; i < assets.length; i++) {
+    uint256 length = assets.length;
+    for (uint256 i; i < length;) {
       userState[i].asset = assets[i];
       (userState[i].userBalance, userState[i].totalSupply) = IAToken(assets[i])
         .getScaledUserBalanceAndSupply(user);
+
+      unchecked { ++i; }
     }
 
     return userState;
@@ -117,12 +104,15 @@ contract IncentivesController is
     address user
   ) external view override returns (address[] memory, uint256[] memory) {
     address[] memory rewards = _allRewards;
-    uint256[] memory amounts = new uint256[](_allRewards.length);
+    uint256 rewardsLength = rewards.length;
+    uint256[] memory amounts = new uint256[](rewardsLength);
     DistributionTypes.UserAssetState[] memory balanceData = _getUserState(assets, user);
 
-    for (uint256 i = 0; i < assets.length; i++) {
+    // cant cache because of the stack too deep
+    for (uint256 i; i < assets.length;) {
       address asset = assets[i];
-      for (uint256 j = 0; j < _allRewards.length; j++) {
+
+      for (uint256 j; j < rewardsLength;) {
         DistributionTypes.Reward storage reward = _incentivizedAssets[asset].rewardData[
           _allRewards[j]
         ];
@@ -134,7 +124,9 @@ contract IncentivesController is
             reward.users[user].index,
             _incentivizedAssets[asset].decimals
           );
+          unchecked { ++j; }
       }
+      unchecked { ++i; }
     }
 
     return (rewards, amounts);
@@ -164,10 +156,12 @@ contract IncentivesController is
     _batchUpdate(user, userState);
 
     uint256 rewardAccrued;
-    for (uint256 i = 0; i < incentivizedAssets.length; i++) {
+    uint256 length = incentivizedAssets.length;
+    for (uint256 i; i < length;) {
       address asset = incentivizedAssets[i];
 
       if (_incentivizedAssets[asset].rewardData[reward].users[user].accrued == 0) {
+        unchecked { ++i; }
         continue;
       }
 
@@ -181,6 +175,8 @@ contract IncentivesController is
         _incentivizedAssets[asset].rewardData[reward].users[user].accrued = remainder;
         break;
       }
+
+      unchecked { ++i; }
     }
 
     if (rewardAccrued == 0) {
@@ -205,25 +201,36 @@ contract IncentivesController is
     address to
   ) external override returns (address[] memory, uint256[] memory) {
     address[] memory rewards = _allRewards;
-    uint256[] memory amounts = new uint256[](_allRewards.length);
+    uint256 rewardsLength = _allRewards.length;
+    uint256[] memory amounts = new uint256[](rewardsLength);
     address user = msg.sender;
+    DistributionTypes.UserAssetState[] memory userState = _getUserState(incentivizedAssets, user);
+    _batchUpdate(user, userState);
 
-    for (uint256 i = 0; i < incentivizedAssets.length; i++) {
+    uint256 assetsLength = incentivizedAssets.length; 
+    for (uint256 i; i < assetsLength;) {
       address asset = incentivizedAssets[i];
-      for (uint256 j = 0; j < _allRewards.length; j++) {
+      for (uint256 j; j < rewardsLength;) {
         uint256 amount = _incentivizedAssets[asset].rewardData[rewards[j]].users[user].accrued;
         if (amount != 0) {
           amounts[j] += amount;
           _incentivizedAssets[asset].rewardData[rewards[j]].users[user].accrued = 0;
         }
+
+        unchecked { ++j; }
       }
+
+      unchecked { ++i; }
     }
 
-    for (uint256 i = 0; i < amounts.length; i++) {
+    uint256 amountsLength = amounts.length;
+    for (uint256 i; i < amountsLength;) {
       if (amounts[i] != 0) {
         IERC20(rewards[i]).safeTransferFrom(REWARDS_VAULT, to, amounts[i]);
         emit RewardClaimed(msg.sender, rewards[i], to, amounts[i]);
       }
+
+      unchecked { ++i; }
     }
 
     return (rewards, amounts);
diff --git a/packages/contracts/contracts/protocol/lendingpool/AssetMappings.sol b/packages/contracts/contracts/protocol/lendingpool/AssetMappings.sol
index 7230fdcce..aa8337ae1 100644
--- a/packages/contracts/contracts/protocol/lendingpool/AssetMappings.sol
+++ b/packages/contracts/contracts/protocol/lendingpool/AssetMappings.sol
@@ -8,12 +8,12 @@ import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";
 import {DataTypes} from "../libraries/types/DataTypes.sol";
 import {Errors} from "../libraries/helpers/Errors.sol";
 import {PercentageMath} from "../libraries/math/PercentageMath.sol";
-import {VersionedInitializable} from "../../dependencies/aave-upgradeability/VersionedInitializable.sol";
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
 import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
 import {Helpers} from "../libraries/helpers/Helpers.sol";
 import {SafeCast} from "../../dependencies/openzeppelin/contracts/SafeCast.sol";
-
+import {ValidationLogic} from "../libraries/logic/ValidationLogic.sol";
 /**
  * @title AssetMappings contract
  * @notice Stores information on the assets used across all tranches in the VMEX protocol
@@ -28,7 +28,7 @@ import {SafeCast} from "../../dependencies/openzeppelin/contracts/SafeCast.sol";
  *   # Add curve metadata for pricing curve assets
  * @author VMEX
  **/
-contract AssetMappings is IAssetMappings, VersionedInitializable{
+contract AssetMappings is IAssetMappings, Initializable{
     using PercentageMath for uint256;
     using Helpers for address;
     using SafeCast for uint256;
@@ -38,16 +38,11 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
     address public approvedAssetsTail;
 
     mapping(address => DataTypes.AssetData) internal assetMappings;
-    mapping(address => mapping(uint8=>address)) internal interestRateStrategyAddress;
-    mapping(address => uint8) public numInterestRateStrategyAddress;
     mapping(address => DataTypes.CurveMetadata) internal curveMetadata;
     mapping(address => DataTypes.BeethovenMetadata) internal beethovenMetadata;
 
     modifier onlyGlobalAdmin() {
-        require(
-            addressesProvider.getGlobalAdmin() == msg.sender,
-            Errors.CALLER_NOT_GLOBAL_ADMIN
-        );
+        Helpers.onlyGlobalAdmin(addressesProvider, msg.sender);
         _;
     }
 
@@ -65,7 +60,7 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
         ).totalTranches();
 
         ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());
-        for (uint64 tranche = 0; tranche < totalTranches; tranche++) {
+        for (uint64 tranche; tranche < totalTranches;) {
             DataTypes.ReserveData memory reserve = lendingPool.getReserveData(asset, tranche);
             //no outstanding borrows allowed
             if (reserve.variableDebtTokenAddress != address(0)) {
@@ -83,21 +78,16 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
                     Errors.AM_UNABLE_TO_DISALLOW_ASSET
                 );
             }
+            unchecked { ++tranche; }
         }
 
     }
 
-    function getRevision() internal pure override returns (uint256) {
-        return 0x1;
-    }
-
     function initialize(ILendingPoolAddressesProvider provider)
         public
         initializer
     {
         addressesProvider = ILendingPoolAddressesProvider(provider);
-        approvedAssetsHead = address(0);
-        approvedAssetsTail = address(0);
     }
 
     /**
@@ -113,19 +103,18 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
     /**
      * @dev Updates the vmex reserve factor of a reserve
      * @param asset The address of the reserve you want to set
-     * @param reserveFactor The new reserve factor of the reserve. Passed in with 2 decimal places (0 < reserveFactor < 10000).
+     * @param reserveFactor The new reserve factor of the reserve. Passed in with 18 decimals.
      **/
     function setVMEXReserveFactor(
         address asset,
         uint256 reserveFactor
     ) public onlyGlobalAdmin {
         require(isAssetInMappings(asset), Errors.AM_ASSET_DOESNT_EXIST);
-        uint256 thisReserveFactor = reserveFactor.convertToPercent();
-        validateVMEXReserveFactor(thisReserveFactor);
+        validateVMEXReserveFactor(reserveFactor);
 
-        assetMappings[asset].VMEXReserveFactor = thisReserveFactor.toUint64();
+        assetMappings[asset].VMEXReserveFactor = reserveFactor.toUint64();
 
-        emit VMEXReserveFactorChanged(asset, thisReserveFactor);
+        emit VMEXReserveFactorChanged(asset, reserveFactor);
     }
 
     /**
@@ -143,45 +132,6 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
         emit BorrowingEnabledChanged(asset, borrowingEnabled);
     }
 
-    /**
-     * @dev Validates the collateral params: ltv must be less than 100%, liquidation Bonus must be greater than 100%,
-     * liquidation threshold * liquidation bonus must be less than 100% for liquidators to break even, borrow factor must be greater than 100%
-     * @param baseLTV The LTV (in decimals adjusted for percentage math decimals)
-     * @param liquidationThreshold The liquidation threshold (in decimals adjusted for percentage math decimals)
-     * @param liquidationBonus The liquidation bonus (in decimals adjusted for percentage math decimals)
-     * @param borrowFactor The borrow factor (in decimals adjusted for percentage math decimals)
-     **/
-    function validateCollateralParams(
-        uint64 baseLTV,
-        uint64 liquidationThreshold,
-        uint64 liquidationBonus,
-        uint64 borrowFactor
-    ) internal pure {
-        require(baseLTV <= liquidationThreshold, Errors.AM_INVALID_CONFIGURATION);
-
-        if (liquidationThreshold != 0) {
-            //liquidation bonus must be bigger than 100.00%, otherwise the liquidator would receive less
-            //collateral than needed to cover the debt
-            require(
-                uint256(liquidationBonus) > PercentageMath.PERCENTAGE_FACTOR,
-                Errors.AM_INVALID_CONFIGURATION
-            );
-
-            //if threshold * bonus is less than PERCENTAGE_FACTOR, it's guaranteed that at the moment
-            //a loan is taken there is enough collateral available to cover the liquidation bonus
-
-            require(
-                uint256(liquidationThreshold).percentMul(uint256(liquidationBonus)) <=
-                    PercentageMath.PERCENTAGE_FACTOR,
-                Errors.AM_INVALID_CONFIGURATION
-            );
-        }
-        require(
-            uint256(borrowFactor) >= PercentageMath.PERCENTAGE_FACTOR,
-            Errors.AM_INVALID_CONFIGURATION
-        );
-    }
-
     /**
      * @dev validates if asset is able to be added to the asset mappings
      * @param inputAsset contains all input info for an asset
@@ -198,20 +148,15 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
      *      that were already added
      **/
     function addAssetMapping(
-        AddAssetMappingInput[] memory input
+        AddAssetMappingInput[] calldata input
     ) external onlyGlobalAdmin {
-        for(uint256 i = 0; i<input.length; i++) {
+        uint256 length = input.length;
+        for(uint256 i; i<length;) {
             AddAssetMappingInput memory inputAsset = input[i];
             address currentAssetAddress = inputAsset.asset;
             validateAddAssetMapping(inputAsset);
 
-            inputAsset.baseLTV = uint256(inputAsset.baseLTV).convertToPercent().toUint64();
-            inputAsset.liquidationThreshold = uint256(inputAsset.liquidationThreshold).convertToPercent().toUint64();
-            inputAsset.liquidationBonus = uint256(inputAsset.liquidationBonus).convertToPercent().toUint64();
-            inputAsset.borrowFactor = uint256(inputAsset.borrowFactor).convertToPercent().toUint64();
-            inputAsset.VMEXReserveFactor = uint256(inputAsset.VMEXReserveFactor).convertToPercent().toUint64();
-
-            validateCollateralParams(inputAsset.baseLTV, inputAsset.liquidationThreshold, inputAsset.liquidationBonus, inputAsset.borrowFactor);
+            ValidationLogic.validateCollateralParams(inputAsset.baseLTV, inputAsset.liquidationThreshold, inputAsset.liquidationBonus, inputAsset.borrowFactor);
             validateVMEXReserveFactor(inputAsset.VMEXReserveFactor);
 
             DataTypes.AssetData storage currentAssetMapping = assetMappings[currentAssetAddress];
@@ -225,10 +170,10 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
             currentAssetMapping.VMEXReserveFactor = inputAsset.VMEXReserveFactor;
             currentAssetMapping.borrowingEnabled = inputAsset.borrowingEnabled;
             currentAssetMapping.assetType = inputAsset.assetType;
+            currentAssetMapping.defaultInterestRateStrategyAddress = inputAsset.defaultInterestRateStrategyAddress;
             currentAssetMapping.isAllowed = true;
             currentAssetMapping.exists = true;
 
-            interestRateStrategyAddress[currentAssetAddress][0] = inputAsset.defaultInterestRateStrategyAddress;
 
             if (approvedAssetsHead==address(0)) {
                 // head not set, add first asset to linked list
@@ -251,15 +196,18 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
                 inputAsset.liquidationThreshold,
                 inputAsset.liquidationBonus,
                 inputAsset.borrowFactor,
+                inputAsset.defaultInterestRateStrategyAddress,
                 inputAsset.borrowingEnabled,
                 inputAsset.VMEXReserveFactor
             );
+
+            unchecked { ++i; }
         }
     }
 
     /**
      * @dev Configures an existing asset mapping's risk parameters
-     * @param asset Address of asset token you want to set
+     * @param asset Address of asset token you want to set. Note that the percentage values use 18 decimals
      **/
     function configureAssetMapping(
         address asset,//20
@@ -271,11 +219,7 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
         uint64 borrowFactor //2 words, 24 bytes --> 3 words total
     ) external onlyGlobalAdmin {
         require(isAssetInMappings(asset), Errors.AM_ASSET_DOESNT_EXIST);
-        baseLTV = uint256(baseLTV).convertToPercent().toUint64();
-        liquidationThreshold = uint256(liquidationThreshold).convertToPercent().toUint64();
-        liquidationBonus = uint256(liquidationBonus).convertToPercent().toUint64();
-        borrowFactor = uint256(borrowFactor).convertToPercent().toUint64();
-        validateCollateralParams(baseLTV, liquidationThreshold, liquidationBonus, borrowFactor);
+        ValidationLogic.validateCollateralParams(baseLTV, liquidationThreshold, liquidationBonus, borrowFactor);
 
         assetMappings[asset].baseLTV = baseLTV;
         assetMappings[asset].liquidationThreshold = (liquidationThreshold);
@@ -313,7 +257,7 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
      * @dev Gets the number of allowed assets in the linked list
      **/
     function getNumApprovedTokens() view public returns (uint256) {
-        uint256 numTokens = 0;
+        uint256 numTokens;
         address tmp = approvedAssetsHead;
 
         while(tmp != address(0)) {
@@ -339,7 +283,7 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
         uint256 numTokens = getNumApprovedTokens();
         address tmp = approvedAssetsHead;
         tokens = new address[](numTokens);
-        uint256 i = 0;
+        uint256 i;
 
         while(tmp != address(0)) {
             if(assetMappings[tmp].isAllowed) {
@@ -366,13 +310,19 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
         return assetMappings[asset].liquidationThreshold != 0;
     }
 
-    function getInterestRateStrategyAddress(address asset, uint8 choice) view external returns(address){
+    function getInterestRateStrategyAddress(address asset, uint64 trancheId) view external override returns(address){
         require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED);
-        require(interestRateStrategyAddress[asset][choice]!=address(0), Errors.AM_NO_INTEREST_STRATEGY);
-        return interestRateStrategyAddress[asset][choice];
+        ILendingPool pool = ILendingPool(addressesProvider.getLendingPool());
+        return pool.getTrancheParams(trancheId).verified ?
+            pool.getReserveData(asset, trancheId).interestRateStrategyAddress :
+            assetMappings[asset].defaultInterestRateStrategyAddress;
+    }
+
+    function getDefaultInterestRateStrategyAddress(address asset) view external override returns(address){
+        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED);
+        return assetMappings[asset].defaultInterestRateStrategyAddress;
     }
 
-    
     function getAssetType(address asset) view external returns(DataTypes.ReserveAssetType){
         require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
         return DataTypes.ReserveAssetType(assetMappings[asset].assetType);
@@ -400,15 +350,11 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
     /**
      * @dev Adds an interest rate strategy to the end of the array.
      **/
-    function addInterestRateStrategyAddress(address asset, address strategy) external onlyGlobalAdmin {
+    function setInterestRateStrategyAddress(address asset, address strategy) external onlyGlobalAdmin {
         require(Address.isContract(strategy), Errors.AM_INTEREST_STRATEGY_NOT_CONTRACT);
-        while(interestRateStrategyAddress[asset][numInterestRateStrategyAddress[asset]]!=address(0)){
-            numInterestRateStrategyAddress[asset]++;
-        }
-        interestRateStrategyAddress[asset][numInterestRateStrategyAddress[asset]] = strategy;
+        assetMappings[asset].defaultInterestRateStrategyAddress = strategy;
         emit AddedInterestRateStrategyAddress(
             asset,
-            numInterestRateStrategyAddress[asset],
             strategy
         );
     }
@@ -425,7 +371,7 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
      **/
     function setCurveMetadata(address[] calldata assets, DataTypes.CurveMetadata[] calldata vars) external override onlyGlobalAdmin {
         require(assets.length == vars.length, Errors.ARRAY_LENGTH_MISMATCH);
-        for(uint i = 0;i<assets.length;i++){
+        for(uint256 i;i<assets.length;i++){
             curveMetadata[assets[i]] = vars[i];
         }
     }
@@ -439,7 +385,7 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
      **/
     function setBeethovenMetadata(address[] calldata assets, DataTypes.BeethovenMetadata[] calldata vars) external onlyGlobalAdmin {
         require(assets.length == vars.length, Errors.ARRAY_LENGTH_MISMATCH);
-        for(uint i = 0;i<assets.length;i++){
+        for(uint256 i;i<assets.length;i++){
             beethovenMetadata[assets[i]] = vars[i];
         }
     }
@@ -454,8 +400,8 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
      * @dev Gets the configuration paramters of the reserve
      * @param asset Address of asset token you want params for
      **/
-    function getParams(address asset)
-        external view
+    function getParams(address asset, uint64 trancheId)
+        external view override
         returns (
             uint256 baseLTV,
             uint256 liquidationThreshold,
@@ -464,13 +410,47 @@ contract AssetMappings is IAssetMappings, VersionedInitializable{
             uint256 borrowFactor
         )
     {
+        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
+        ILendingPool pool = ILendingPool(addressesProvider.getLendingPool());
+        if(pool.getTrancheParams(trancheId).verified) {
+            DataTypes.ReserveData memory dat = pool.getReserveData(asset, trancheId);
+            return (
+                dat.baseLTV,
+                dat.liquidationThreshold,
+                dat.liquidationBonus,
+                IERC20Detailed(asset).decimals(),
+                dat.borrowFactor
+            );
+        } else {
+            return (
+                assetMappings[asset].baseLTV,
+                assetMappings[asset].liquidationThreshold,
+                assetMappings[asset].liquidationBonus,
+                IERC20Detailed(asset).decimals(),
+                assetMappings[asset].borrowFactor
+            );
+        }
 
+    }
+
+    /**
+     * @dev Gets the configuration paramters of the reserve
+     * @param asset Address of asset token you want params for
+     **/
+    function getDefaultCollateralParams(address asset)
+        external view override
+        returns (
+            uint64,
+            uint64,
+            uint64,
+            uint64
+        )
+    {
         require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
         return (
             assetMappings[asset].baseLTV,
             assetMappings[asset].liquidationThreshold,
             assetMappings[asset].liquidationBonus,
-            IERC20Detailed(asset).decimals(),
             assetMappings[asset].borrowFactor
         );
     }
diff --git a/packages/contracts/contracts/protocol/lendingpool/DefaultReserveInterestRateStrategy.sol b/packages/contracts/contracts/protocol/lendingpool/DefaultReserveInterestRateStrategy.sol
index dc15cf961..12d3b1401 100644
--- a/packages/contracts/contracts/protocol/lendingpool/DefaultReserveInterestRateStrategy.sol
+++ b/packages/contracts/contracts/protocol/lendingpool/DefaultReserveInterestRateStrategy.sol
@@ -1,7 +1,6 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {IReserveInterestRateStrategy} from "../../interfaces/IReserveInterestRateStrategy.sol";
 import {IIncentivesController} from "../../interfaces/IIncentivesController.sol";
 import {IAToken} from "../../interfaces/IAToken.sol";
@@ -23,7 +22,6 @@ import {DataTypes} from "../libraries/types/DataTypes.sol";
  **/
 contract DefaultReserveInterestRateStrategy is IReserveInterestRateStrategy {
     using WadRayMath for uint256;
-    using SafeMath for uint256;
     using PercentageMath for uint256;
 
     /**
@@ -59,7 +57,7 @@ contract DefaultReserveInterestRateStrategy is IReserveInterestRateStrategy {
         uint256 __variableRateSlope2
     ) {
         OPTIMAL_UTILIZATION_RATE = optimalUtilizationRate;
-        EXCESS_UTILIZATION_RATE = WadRayMath.ray().sub(optimalUtilizationRate);
+        EXCESS_UTILIZATION_RATE = WadRayMath.ray() - optimalUtilizationRate;
         addressesProvider = provider;
         _baseVariableBorrowRate = __baseVariableBorrowRate;
         _variableRateSlope1 = __variableRateSlope1;
@@ -85,9 +83,7 @@ contract DefaultReserveInterestRateStrategy is IReserveInterestRateStrategy {
         returns (uint256)
     {
         return
-            _baseVariableBorrowRate.add(_variableRateSlope1).add(
-                _variableRateSlope2
-            );
+            _baseVariableBorrowRate + _variableRateSlope1 +  _variableRateSlope2;
     }
 
     /**
@@ -96,7 +92,7 @@ contract DefaultReserveInterestRateStrategy is IReserveInterestRateStrategy {
      * @return The liquidity rate and the variable borrow rate
      **/
     function calculateInterestRates(
-        DataTypes.calculateInterestRatesVars memory calvars
+        DataTypes.calculateInterestRatesVars calldata calvars
     )
         external
         view
@@ -110,45 +106,36 @@ contract DefaultReserveInterestRateStrategy is IReserveInterestRateStrategy {
         uint256 availableLiquidity = IERC20(calvars.reserve).balanceOf(
             calvars.aToken
         );
-        availableLiquidity = availableLiquidity.add(IAToken(calvars.aToken).getStakedAmount());
+        availableLiquidity = availableLiquidity + IAToken(calvars.aToken).getStakedAmount();
 
-        availableLiquidity = availableLiquidity
-            .add(calvars.liquidityAdded)
-            .sub(calvars.liquidityTaken);
+        availableLiquidity = availableLiquidity + calvars.liquidityAdded - calvars.liquidityTaken;
 
         CalcInterestRatesLocalVars memory vars;
         vars.totalDebt = calvars.totalVariableDebt;
-        vars.currentVariableBorrowRate = 0;
-        vars.currentLiquidityRate = 0;
         vars.utilizationRate = vars.totalDebt == 0
             ? 0
-            : vars.totalDebt.rayDiv(availableLiquidity.add(vars.totalDebt));
+            : vars.totalDebt.rayDiv(availableLiquidity + vars.totalDebt);
 
 
         if (vars.utilizationRate > OPTIMAL_UTILIZATION_RATE) {
-            uint256 excessUtilizationRateRatio = vars
-                .utilizationRate
-                .sub(OPTIMAL_UTILIZATION_RATE)
+            uint256 excessUtilizationRateRatio = (vars.utilizationRate - OPTIMAL_UTILIZATION_RATE)
                 .rayDiv(EXCESS_UTILIZATION_RATE);
 
-            vars.currentVariableBorrowRate = _baseVariableBorrowRate
-                .add(_variableRateSlope1)
-                .add(_variableRateSlope2.rayMul(excessUtilizationRateRatio));
+            vars.currentVariableBorrowRate = _baseVariableBorrowRate + _variableRateSlope1 +
+                _variableRateSlope2.rayMul(excessUtilizationRateRatio);
         } else {
-            vars.currentVariableBorrowRate = _baseVariableBorrowRate.add(
+            vars.currentVariableBorrowRate = _baseVariableBorrowRate + 
                 vars.utilizationRate.rayMul(_variableRateSlope1).rayDiv(
                     OPTIMAL_UTILIZATION_RATE
-                )
-            );
+                );
         }
 
         vars.currentLiquidityRate = vars.currentVariableBorrowRate
             .rayMul(vars.utilizationRate) // % return per asset borrowed * amount borrowed = total expected return in pool
-            .percentMul(PercentageMath.PERCENTAGE_FACTOR.sub(calvars.reserveFactor)) //this is percentage of pool being borrowed.
+            .percentMul(PercentageMath.PERCENTAGE_FACTOR - calvars.reserveFactor) //this is percentage of pool being borrowed.
                 .percentMul(
-                    PercentageMath.PERCENTAGE_FACTOR.sub(
-                        calvars.globalVMEXReserveFactor
-                    ) //global VMEX treasury interest rate
+                    PercentageMath.PERCENTAGE_FACTOR - calvars.globalVMEXReserveFactor
+                     //global VMEX treasury interest rate
                 );
 
         //borrow interest rate * (1-reserve factor) *(1- global VMEX reserve factor) = deposit interest rate
diff --git a/packages/contracts/contracts/protocol/lendingpool/LendingPool.sol b/packages/contracts/contracts/protocol/lendingpool/LendingPool.sol
index 84b0fbd73..ce138651b 100644
--- a/packages/contracts/contracts/protocol/lendingpool/LendingPool.sol
+++ b/packages/contracts/contracts/protocol/lendingpool/LendingPool.sol
@@ -1,7 +1,6 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
 import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
 import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
@@ -11,7 +10,7 @@ import {IAToken} from "../../interfaces/IAToken.sol";
 import {IVariableDebtToken} from "../../interfaces/IVariableDebtToken.sol";
 import {IPriceOracleGetter} from "../../interfaces/IPriceOracleGetter.sol";
 import {ILendingPool} from "../../interfaces/ILendingPool.sol";
-import {VersionedInitializable} from "../../dependencies/aave-upgradeability/VersionedInitializable.sol";
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 import {Helpers} from "../libraries/helpers/Helpers.sol";
 import {Errors} from "../libraries/helpers/Errors.sol";
 import {WadRayMath} from "../libraries/math/WadRayMath.sol";
@@ -40,11 +39,10 @@ import {DepositWithdrawLogic} from "../libraries/logic/DepositWithdrawLogic.sol"
  * @author Aave and VMEX
  **/
 contract LendingPool is
-    VersionedInitializable,
+    Initializable,
     ILendingPool,
     LendingPoolStorage
 {
-    using SafeMath for uint256;
     using WadRayMath for uint256;
     using SafeERC20 for IERC20;
     using ReserveLogic for DataTypes.ReserveData;
@@ -52,14 +50,13 @@ contract LendingPool is
     using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
     using DepositWithdrawLogic for DataTypes.ReserveData;
 
-    uint256 public constant LENDINGPOOL_REVISION = 0x1;
-
     modifier whenTrancheNotPausedAndExists(uint64 trancheId) {
         _whenTrancheNotPausedAndExists(trancheId);
         _;
     }
     function _whenTrancheNotPausedAndExists(uint64 trancheId) internal view {
-        require(!trancheParams[trancheId].paused && !_everythingPaused, Errors.LP_IS_PAUSED);
+        require(!trancheParams[trancheId].paused, Errors.LP_IS_PAUSED);
+        require(!_everythingPaused, Errors.LP_IS_PAUSED);
         uint64 totalTranches = ILendingPoolConfigurator(_addressesProvider.getLendingPoolConfigurator()).totalTranches();
         require(trancheId<totalTranches, Errors.INVALID_TRANCHE);
     }
@@ -90,10 +87,6 @@ contract LendingPool is
         }
     }
 
-    function getRevision() internal pure override returns (uint256) {
-        return LENDINGPOOL_REVISION;
-    }
-
     /**
      * @dev Function is invoked by the proxy contract when the LendingPool contract is added to the
      * LendingPoolAddressesProvider of the market.
@@ -325,9 +318,15 @@ contract LendingPool is
             reserve.variableBorrowIndex
         );
 
-        reserve.updateInterestRates(asset, trancheId, paybackAmount, 0, _assetMappings.getVMEXReserveFactor(asset));
+        reserve.updateInterestRates(
+            _assetMappings, 
+            asset, 
+            trancheId, 
+            paybackAmount, 
+            0
+        );
 
-        if (variableDebt.sub(paybackAmount) == 0) {
+        if (variableDebt - paybackAmount == 0) {
             _usersConfig[onBehalfOf][trancheId].configuration.setBorrowing(reserve.id, false);
         }
 
@@ -575,7 +574,7 @@ contract LendingPool is
         uint8 reservesCount = trancheParams[trancheId].reservesCount;
         address[] memory _activeReserves = new address[](reservesCount);
 
-        for (uint256 i = 0; i < reservesCount; i++) {
+        for (uint256 i; i < reservesCount; ++i) {
             _activeReserves[i] = _reservesList[trancheId][i];
         }
         return _activeReserves;
@@ -635,7 +634,7 @@ contract LendingPool is
 
 
         if (from != to) {
-            if (balanceFromBefore.sub(amount) == 0) {
+            if (balanceFromBefore - amount == 0) {
                 DataTypes.UserConfigurationMap
                     storage fromConfig = _usersConfig[from][trancheId].configuration;
                 fromConfig.setUsingAsCollateral(reserve.id, false);
@@ -662,14 +661,12 @@ contract LendingPool is
      * - Only callable by the LendingPoolConfigurator contract
      * @param underlyingAsset The address of the underlying asset (like USDC)
      * @param trancheId The tranche id
-     * @param interestRateStrategyAddress The address of the interest rate strategy
      * @param aTokenAddress The address of the aToken that will be assigned to the reserve
      * @param variableDebtAddress The address of the VariableDebtToken that will be assigned to the reserve
      **/
     function initReserve(
         address underlyingAsset,
         uint64 trancheId,
-        address interestRateStrategyAddress,
         address aTokenAddress,
         address variableDebtAddress
     ) external override onlyLendingPoolConfigurator {
@@ -679,8 +676,7 @@ contract LendingPool is
         );
         _reserves[underlyingAsset][trancheId].init(
             aTokenAddress,
-            variableDebtAddress,
-            interestRateStrategyAddress
+            variableDebtAddress
         );
 
         _addReserveToList(underlyingAsset, trancheId);
@@ -717,6 +713,30 @@ contract LendingPool is
         _reserves[asset][trancheId].configuration.data = configuration;
     }
 
+    /**
+     * @dev Sets the configuration bitmap of the reserve as a whole
+     * - Only callable by the LendingPoolConfigurator contract
+     * @param asset The address of the underlying asset of the reserve
+     * @param trancheId The tranche id of the reserve
+     * @param ltv The new ltv
+     * @param liquidationThreshold The new liquidationThreshold
+     * @param liquidationBonus The new liquidationBonus
+     * @param borrowFactor The new borrowFactor
+     **/
+    function setCollateralParams(
+        address asset,
+        uint64 trancheId,
+        uint64 ltv,
+        uint64 liquidationThreshold,
+        uint64 liquidationBonus,
+        uint64 borrowFactor
+    ) external override onlyLendingPoolConfigurator {
+        _reserves[asset][trancheId].baseLTV = ltv;
+        _reserves[asset][trancheId].liquidationThreshold = liquidationThreshold;
+        _reserves[asset][trancheId].liquidationBonus = liquidationBonus;
+        _reserves[asset][trancheId].borrowFactor = borrowFactor;
+    }
+
     /**
      * @dev Set the _pause state of the entire lending pool
      * - Only callable by the LendingPoolConfigurator contract
@@ -753,6 +773,11 @@ contract LendingPool is
         }
     }
 
+    function reserveAdded(address asset, uint64 trancheId) public view override returns(bool) {
+        return _reserves[asset][trancheId].id != 0 ||
+            _reservesList[trancheId][0] == asset;
+    }
+
     function _addReserveToList(address asset, uint64 trancheId) internal {
         uint256 reservesCount = trancheParams[trancheId].reservesCount;
 
@@ -763,8 +788,7 @@ contract LendingPool is
 
         // all reserves start at zero, so if it is not zero then it was already added OR
         // the first asset that was added will have id = 0, so we need to make sure that that asset wasn't already added
-        bool reserveAlreadyAdded = _reserves[asset][trancheId].id != 0 ||
-            _reservesList[trancheId][0] == asset;
+        bool reserveAlreadyAdded = reserveAdded(asset, trancheId);
 
         if (!reserveAlreadyAdded) {
             _reserves[asset][trancheId].id = uint8(reservesCount);
@@ -835,4 +859,15 @@ contract LendingPool is
         return trancheParams[trancheId];
     }
 
+
+    /**
+     * @dev sets if a tranche admin is verified. For now, it can only be callable by configurator, which is bounded by global admin, but eventually should be callable by configurator if admin stakes sufficient VMEX
+     * @param verified Whether an admin is verified
+     * @param trancheId The id of the tranche
+     **/
+    function setTrancheAdminVerified(uint64 trancheId, bool verified) external override onlyLendingPoolConfigurator {
+        trancheParams[trancheId].verified = verified;
+        emit ConfigurationAdminVerifiedUpdated(trancheId, verified);
+    }
+
 }
diff --git a/packages/contracts/contracts/protocol/lendingpool/LendingPoolCollateralManager.sol b/packages/contracts/contracts/protocol/lendingpool/LendingPoolCollateralManager.sol
index f6d884b7e..5114ee49a 100644
--- a/packages/contracts/contracts/protocol/lendingpool/LendingPoolCollateralManager.sol
+++ b/packages/contracts/contracts/protocol/lendingpool/LendingPoolCollateralManager.sol
@@ -1,13 +1,12 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {SafeMath} from "../../dependencies/openzeppelin/contracts//SafeMath.sol";
 import {IERC20} from "../../dependencies/openzeppelin/contracts//IERC20.sol";
 import {IAToken} from "../../interfaces/IAToken.sol";
 import {IVariableDebtToken} from "../../interfaces/IVariableDebtToken.sol";
 import {IPriceOracleGetter} from "../../interfaces/IPriceOracleGetter.sol";
 import {ILendingPoolCollateralManager} from "../../interfaces/ILendingPoolCollateralManager.sol";
-import {VersionedInitializable} from "../../dependencies/aave-upgradeability/VersionedInitializable.sol";
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 import {GenericLogic} from "../libraries/logic/GenericLogic.sol";
 import {WadRayMath} from "../libraries/math/WadRayMath.sol";
 import {PercentageMath} from "../libraries/math/PercentageMath.sol";
@@ -32,11 +31,10 @@ import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";
  **/
 contract LendingPoolCollateralManager is
     ILendingPoolCollateralManager,
-    VersionedInitializable,
+    Initializable,
     LendingPoolStorage
 {
     using SafeERC20 for IERC20;
-    using SafeMath for uint256;
     using WadRayMath for uint256;
     using PercentageMath for uint256;
     using ReserveLogic for *;
@@ -59,25 +57,16 @@ contract LendingPoolCollateralManager is
         uint256 debtAmountNeeded;
         uint256 healthFactor;
         uint256 liquidatorPreviousATokenBalance;
-        bool isCollateralEnabled;
-        DataTypes.InterestRateMode borrowRateMode;
         uint256 errorCode;
         string errorMsg;
         IAssetMappings _assetMappings;
+        bool isCollateralEnabled;
+        DataTypes.InterestRateMode borrowRateMode;
         address debtAsset;
         address collateralAsset;
         address collateralAToken;
     }
 
-    /**
-     * @dev As this contract extends the VersionedInitializable contract to match the state
-     * of the LendingPool contract, the getRevision() function is needed, but the value is not
-     * important, as the initialize() function will never be called here
-     */
-    function getRevision() internal pure override returns (uint256) {
-        return 0;
-    }
-
     /**
      * @dev Function to liquidate a position if its Health Factor drops below 1
      * - The caller (liquidator) covers `debtToCover` amount of debt of the user getting liquidated, and receives
@@ -168,7 +157,8 @@ contract LendingPoolCollateralManager is
             vars.collateralAsset,
             vars.debtAsset,
             vars.actualDebtToLiquidate,
-            vars.userCollateralBalance
+            vars.userCollateralBalance,
+            trancheId
         );
 
         // If debtAmountNeeded < actualDebtToLiquidate, there isn't enough
@@ -184,7 +174,7 @@ contract LendingPoolCollateralManager is
         if (!receiveAToken) {
             uint256 currentAvailableCollateral = IERC20(vars.collateralAsset)
                 .balanceOf(vars.collateralAToken);
-            currentAvailableCollateral = currentAvailableCollateral.add(IAToken(vars.collateralAToken).getStakedAmount());
+            currentAvailableCollateral = currentAvailableCollateral + IAToken(vars.collateralAToken).getStakedAmount();
 
             if (currentAvailableCollateral < vars.maxCollateralToLiquidate) {
                 return (
@@ -206,7 +196,7 @@ contract LendingPoolCollateralManager is
             );
         } else {
             // If the user doesn't have variable debt, no need to try to burn variable debt tokens
-            if (vars.userVariableDebt > 0) {
+            if (vars.userVariableDebt != 0) {
                 IVariableDebtToken(debtReserve.variableDebtTokenAddress).burn(
                     user,
                     vars.userVariableDebt,
@@ -215,11 +205,11 @@ contract LendingPoolCollateralManager is
             }
         }
         debtReserve.updateInterestRates(
+            _assetMappings,
             vars.debtAsset,
             trancheId,
             vars.actualDebtToLiquidate,
-            0,
-            vars._assetMappings.getVMEXReserveFactor(vars.debtAsset)
+            0
         );
 
         if (receiveAToken) {
@@ -251,11 +241,11 @@ contract LendingPoolCollateralManager is
 
             collateralReserve.updateState(vars._assetMappings.getVMEXReserveFactor(collateralAsset));
             collateralReserve.updateInterestRates(
+                _assetMappings,
                 vars.collateralAsset,
                 trancheId,
                 0,
-                vars.maxCollateralToLiquidate,
-                vars._assetMappings.getVMEXReserveFactor(vars.collateralAsset)
+                vars.maxCollateralToLiquidate
             );
             // Burn the equivalent amount of aToken, sending the underlying to the liquidator
             IAToken(vars.collateralAToken).burn(
@@ -316,19 +306,17 @@ contract LendingPoolCollateralManager is
      * @param debtAsset The address of the underlying borrowed asset to be repaid with the liquidation
      * @param debtToCover The debt amount of borrowed `asset` the liquidator wants to cover
      * @param userCollateralBalance The collateral balance for the specific `collateralAsset` of the user being liquidated
-     * @return collateralAmount: The maximum amount that is possible to liquidate given all the liquidation constraints
+     * @return collateralAmount The maximum amount that is possible to liquidate given all the liquidation constraints
      *                           (user balance, close factor)
-     * @return debtAmountNeeded: The amount to repay with the liquidation
+     * @return debtAmountNeeded The amount to repay with the liquidation
      **/
     function _calculateAvailableCollateralToLiquidate(
         address collateralAsset,
         address debtAsset,
         uint256 debtToCover,
-        uint256 userCollateralBalance
-    ) internal returns (uint256, uint256) {
-        uint256 collateralAmount = 0;
-        uint256 debtAmountNeeded = 0;
-
+        uint256 userCollateralBalance,
+        uint64 trancheId
+    ) internal returns (uint256 collateralAmount, uint256 debtAmountNeeded) {
         AvailableCollateralToLiquidateLocalVars memory vars;
         {
             address oracleAddress = _addressesProvider.getPriceOracle();
@@ -345,25 +333,19 @@ contract LendingPoolCollateralManager is
             vars.liquidationBonus,
             vars.collateralDecimals,
 
-        ) = _assetMappings.getParams(collateralAsset);
+        ) = _assetMappings.getParams(collateralAsset, trancheId);
         vars.debtAssetDecimals = _assetMappings.getDecimals(debtAsset);
 
         // This is the maximum possible amount of the selected collateral that can be liquidated, given the
         // max amount of liquidatable debt
-        vars.maxAmountCollateralToLiquidate = vars
-            .debtAssetPrice
-            .mul(debtToCover)
-            .mul(10**vars.collateralDecimals)
+        vars.maxAmountCollateralToLiquidate = (vars.debtAssetPrice * debtToCover * 10**vars.collateralDecimals)
             .percentMul(vars.liquidationBonus)
-            .div(vars.collateralPrice.mul(10**vars.debtAssetDecimals));
+            / (vars.collateralPrice * 10**vars.debtAssetDecimals);
 
         if (vars.maxAmountCollateralToLiquidate > userCollateralBalance) {
             collateralAmount = userCollateralBalance;
-            debtAmountNeeded = vars
-                .collateralPrice
-                .mul(collateralAmount)
-                .mul(10**vars.debtAssetDecimals)
-                .div(vars.debtAssetPrice.mul(10**vars.collateralDecimals))
+            debtAmountNeeded = (vars.collateralPrice * collateralAmount * 10**vars.debtAssetDecimals
+                / (vars.debtAssetPrice * 10**vars.collateralDecimals))
                 .percentDiv(vars.liquidationBonus);
         } else {
             collateralAmount = vars.maxAmountCollateralToLiquidate;
diff --git a/packages/contracts/contracts/protocol/lendingpool/LendingPoolConfigurator.sol b/packages/contracts/contracts/protocol/lendingpool/LendingPoolConfigurator.sol
index b6ebf72de..d050a1c01 100644
--- a/packages/contracts/contracts/protocol/lendingpool/LendingPoolConfigurator.sol
+++ b/packages/contracts/contracts/protocol/lendingpool/LendingPoolConfigurator.sol
@@ -1,13 +1,13 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
-import {VersionedInitializable} from "../../dependencies/aave-upgradeability/VersionedInitializable.sol";
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
 import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
 import {ILendingPool} from "../../interfaces/ILendingPool.sol";
 import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
 import {Errors} from "../libraries/helpers/Errors.sol";
+import {Helpers} from "../libraries/helpers/Helpers.sol";
 import {PercentageMath} from "../libraries/math/PercentageMath.sol";
 import {DataTypes} from "../libraries/types/DataTypes.sol";
 import {ILendingPoolConfigurator} from "../../interfaces/ILendingPoolConfigurator.sol";
@@ -16,6 +16,10 @@ import {IAToken} from "../../interfaces/IAToken.sol";
 import {IInitializableAToken} from "../../interfaces/IInitializableAToken.sol";
 import {IInitializableDebtToken} from "../../interfaces/IInitializableDebtToken.sol";
 import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
+import {ValidationLogic} from "../libraries/logic/ValidationLogic.sol";
+import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
+import {SafeCast} from "../../dependencies/openzeppelin/contracts/SafeCast.sol";
+
 
 /**
  * @title LendingPoolConfigurator contract
@@ -23,12 +27,12 @@ import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol"
  * @dev Implements the configuration methods for the VMEX protocol
  **/
 contract LendingPoolConfigurator is
-    VersionedInitializable,
+    Initializable,
     ILendingPoolConfigurator
 {
-    using SafeMath for uint256;
     using PercentageMath for uint256;
     using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
+    using SafeCast for uint256;
 
     ILendingPoolAddressesProvider internal addressesProvider;
     IAssetMappings internal assetMappings;
@@ -40,38 +44,29 @@ contract LendingPoolConfigurator is
      **/
     mapping(uint64 => address) override public trancheAdminTreasuryAddresses;
 
-    modifier onlyEmergencyAdmin {
-        require(
-            addressesProvider.getEmergencyAdmin() == msg.sender ||
-            addressesProvider.getGlobalAdmin() == msg.sender,
-            Errors.LPC_CALLER_NOT_EMERGENCY_ADMIN
-        );
+    modifier onlyEmergencyAdmin() {
+        Helpers.onlyEmergencyAdmin(addressesProvider, msg.sender);
         _;
     }
 
-    modifier onlyGlobalAdmin() {
-        _onlyGlobalAdmin();
+    modifier onlyEmergencyTrancheAdmin(uint64 trancheId) {
+        Helpers.onlyEmergencyTrancheAdmin(addressesProvider, trancheId, msg.sender);
         _;
     }
 
-    function _onlyGlobalAdmin() internal view {
-        require(
-            addressesProvider.getGlobalAdmin() == msg.sender,
-            Errors.CALLER_NOT_GLOBAL_ADMIN
-        );
+    modifier onlyGlobalAdmin() {
+        Helpers.onlyGlobalAdmin(addressesProvider, msg.sender);
+        _;
     }
 
-    modifier onlyTrancheAdmin(uint64 trancheId) {
-        _onlyTrancheAdmin(trancheId);
+    modifier onlyVerifiedTrancheAdmin(uint64 trancheId) {
+        Helpers.onlyVerifiedTrancheAdmin(addressesProvider, trancheId, msg.sender);
         _;
     }
 
-    function _onlyTrancheAdmin(uint64 trancheId) internal view {
-        require(
-            addressesProvider.getTrancheAdmin(trancheId) == msg.sender ||
-                addressesProvider.getGlobalAdmin() == msg.sender,
-            Errors.CALLER_NOT_TRANCHE_ADMIN
-        );
+    modifier onlyTrancheAdmin(uint64 trancheId) {
+        Helpers.onlyTrancheAdmin(addressesProvider, trancheId, msg.sender);
+        _;
     }
 
     modifier whitelistedAddress() {
@@ -82,12 +77,6 @@ contract LendingPoolConfigurator is
         _;
     }
 
-    uint256 internal constant CONFIGURATOR_REVISION = 0x1;
-
-    function getRevision() internal pure override returns (uint256) {
-        return CONFIGURATOR_REVISION;
-    }
-
     function initialize(address provider) public initializer {
         addressesProvider = ILendingPoolAddressesProvider(provider);
         pool = ILendingPool(addressesProvider.getLendingPool());
@@ -117,6 +106,60 @@ contract LendingPoolConfigurator is
     }
 
 
+    /**
+     * @dev Verifies tranche for more privileges
+     * @param trancheId the tranche that is verified
+     **/
+    function verifyTranche(
+        uint64 trancheId
+    ) external onlyGlobalAdmin {
+        require(trancheId<totalTranches, Errors.INVALID_TRANCHE);
+        require(!pool.getTrancheParams(trancheId).verified, Errors.ALREADY_VERIFIED);
+        // TODO: enforce possible staking of VMEX
+
+        // loop through all reserves in this tranche, and set the local values of LTV, threshold, bonus, and borrow factor
+        address[] memory reserves = pool.getReservesList(trancheId);
+        uint cachedLength = reserves.length;
+        for(uint256 i;i<cachedLength;) { //initialize with initial global asset params
+            (
+                uint64 ltv,
+                uint64 liquidationThreshold,
+                uint64 liquidationBonus,
+                uint64 borrowFactor
+            ) = assetMappings.getDefaultCollateralParams(reserves[i]); //it doesn't matter what the tranche and user address is since it will get params from global params
+            pool.setCollateralParams(
+                reserves[i], 
+                trancheId, 
+                ltv, 
+                liquidationThreshold, 
+                liquidationBonus, 
+                borrowFactor
+            );
+
+            _setReserveInterestRateStrategyAddress(
+                reserves[i], 
+                trancheId, 
+                assetMappings.getDefaultInterestRateStrategyAddress(reserves[i])
+            );
+
+            unchecked { ++i; }
+        }
+
+        pool.setTrancheAdminVerified(trancheId, true);
+    }
+
+
+    /**
+     * @dev Unverifies tranche to revoke privileges, unstake, and return to global parameters
+     * @param trancheId the tranche that is verified
+     **/
+    function unverifyTranche(
+        uint64 trancheId
+    ) external onlyVerifiedTrancheAdmin(trancheId) {
+        require(trancheId<totalTranches, Errors.INVALID_TRANCHE);
+        // TODO: enforce unstaking of VMEX
+        pool.setTrancheAdminVerified(trancheId, false);
+    }
     /* ******************************************************************************** */
     /* This next section contains functions only accessible to Tranche Admins and above */
     /* ******************************************************************************** */
@@ -144,18 +187,79 @@ contract LendingPoolConfigurator is
         uint64 trancheId
     ) external onlyTrancheAdmin(trancheId) {
         ILendingPool cachedPool = pool;
-        for (uint256 i = 0; i < input.length; i++) {
+        uint256 length = input.length;
+        for (uint256 i; i < length;) {
+            address asset = input[i].underlyingAsset;
+            if(pool.reserveAdded(asset, trancheId)) {
+                unchecked { ++i; }
+                continue;
+            }
             _initReserve(
                 input[i],
                 trancheId,
-                assetMappings.getAssetMapping(input[i].underlyingAsset),
+                assetMappings.getAssetMapping(asset),
                 cachedPool
             );
+
+            if(pool.getTrancheParams(trancheId).verified) { //perform extra initialization
+                (
+                    uint256 baseLTV,
+                    uint256 liquidationThreshold,
+                    uint256 liquidationBonus,
+                    uint256 borrowFactor
+                ) = assetMappings.getDefaultCollateralParams(asset);
+                _configureCollateralParams(
+                    input[i].underlyingAsset,
+                    trancheId,
+                    ConfigureCollateralParams(
+                        baseLTV.toUint64(),
+                        liquidationThreshold.toUint64(),
+                        liquidationBonus.toUint64(),
+                        borrowFactor.toUint64()
+                    )
+                );
+                _setReserveInterestRateStrategyAddress(
+                    asset, 
+                    trancheId, 
+                    assetMappings.getDefaultInterestRateStrategyAddress(asset)
+                );
+            }
+
+            unchecked { ++i; }
+        }
+    }
+
+    /**
+     * @dev Initializes reserves in batch. Can be called directly by those who created tranches
+     * and want to add new reserves to their tranche
+     * @param input The specifications of the reserves to initialize
+     * @param trancheId The trancheId that the msg.sender should be the admin of
+     **/
+    function batchConfigureCollateralParams(
+        ConfigureCollateralParamsInput[] calldata input,
+        uint64 trancheId
+    ) external onlyVerifiedTrancheAdmin(trancheId) {
+        uint256 length = input.length;
+        for (uint256 i; i < length;) {
+            ConfigureCollateralParams memory params = input[i].collateralParams;
+            ValidationLogic.validateCollateralParams(
+                params.baseLTV, 
+                params.liquidationThreshold,
+                params.liquidationBonus,
+                params.borrowFactor
+            );
+            _configureCollateralParams(
+                input[i].underlyingAsset,
+                trancheId,
+                params
+            );
+
+            unchecked { ++i; }
         }
     }
 
     function _initReserve(
-        InitReserveInput memory input,
+        InitReserveInput calldata input,
         uint64 trancheId,
         DataTypes.AssetData memory assetdata,
         ILendingPool cachedPool
@@ -192,7 +296,6 @@ contract LendingPoolConfigurator is
         cachedPool.initReserve(
             input.underlyingAsset,
             trancheId,
-            assetMappings.getInterestRateStrategyAddress(input.underlyingAsset,input.interestRateChoice),
             aTokenProxyAddress,
             variableDebtTokenProxyAddress
         );
@@ -219,9 +322,7 @@ contract LendingPoolConfigurator is
             currentConfig.setBorrowingEnabled(false);
         }
 
-        uint256 percentReserveFactor = uint256(input.reserveFactor).convertToPercent();
-
-        currentConfig.setReserveFactor(percentReserveFactor, input.underlyingAsset, assetMappings);
+        currentConfig.setReserveFactor(uint256(input.reserveFactor), input.underlyingAsset, assetMappings);
 
         currentConfig.setActive(true);
         currentConfig.setFrozen(false);
@@ -237,13 +338,43 @@ contract LendingPoolConfigurator is
             trancheId,
             aTokenProxyAddress,
             variableDebtTokenProxyAddress,
-            assetMappings.getInterestRateStrategyAddress(input.underlyingAsset,input.interestRateChoice),
             currentConfig.getBorrowingEnabled(input.underlyingAsset, assetMappings),
             currentConfig.getCollateralEnabled(input.underlyingAsset, assetMappings),
             currentConfig.getReserveFactor()
         );
     }
 
+    /**
+     * @dev Updates the treasury address of the atoken
+     * @param underlyingAsset The underlying asset
+     * @param trancheId The tranche id
+     * @param params The collateral parameters such as ltv, threshold, with 4 decimals (so need to convert)
+     **/
+    function _configureCollateralParams(
+        address underlyingAsset,
+        uint64 trancheId,
+        ConfigureCollateralParams memory params
+    ) internal {
+        pool.setCollateralParams(
+            underlyingAsset, 
+            trancheId, 
+            params.baseLTV, 
+            params.liquidationThreshold, 
+            params.liquidationBonus, 
+            params.borrowFactor
+        );
+        emit VerifiedAdminConfiguredCollateral(
+            underlyingAsset, 
+            trancheId, 
+            params.baseLTV, 
+            params.liquidationThreshold, 
+            params.liquidationBonus, 
+            params.borrowFactor
+        );
+    }
+
+    
+
     /**
      * @dev Updates the treasury address of the atoken
      * @param newAddress The new address (NO VALIDATIONS ARE DONE)
@@ -271,7 +402,7 @@ contract LendingPoolConfigurator is
         bool[] calldata borrowingEnabled
     ) external onlyTrancheAdmin(trancheId) {
         require(asset.length == borrowingEnabled.length, Errors.ARRAY_LENGTH_MISMATCH);
-        for(uint i = 0; i<asset.length;i++){
+        for(uint256 i; i<asset.length;i++){
             require(!borrowingEnabled[i] || assetMappings.getAssetBorrowable(asset[i]), Errors.LPC_NOT_APPROVED_BORROWABLE);
             DataTypes.ReserveConfigurationMap memory currentConfig = pool
                 .getConfiguration(asset[i], trancheId);
@@ -297,7 +428,7 @@ contract LendingPoolConfigurator is
         bool[] calldata collateralEnabled
     ) external onlyTrancheAdmin(trancheId) {
         require(asset.length == collateralEnabled.length, Errors.ARRAY_LENGTH_MISMATCH);
-        for(uint i = 0; i<asset.length;i++){
+        for(uint256 i; i<asset.length;i++){
             if(!collateralEnabled[i]){
                 _checkNoLiquidity(asset[i], trancheId);
             }
@@ -324,14 +455,14 @@ contract LendingPoolConfigurator is
         uint256[] calldata reserveFactor
     ) external onlyTrancheAdmin(trancheId) {
         require(asset.length == reserveFactor.length, Errors.ARRAY_LENGTH_MISMATCH);
-        for(uint i = 0; i<asset.length;i++){
+        for(uint256 i; i<asset.length;i++){
             //reserve factor can only be changed if no one deposited in it, otherwise tranche admins could "rug pull" the interest earnings in there
             _checkNoLiquidity(asset[i], trancheId);
             DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
                 pool
             ).getConfiguration(asset[i], trancheId);
 
-            uint256 thisReserveFactor = reserveFactor[i].convertToPercent();
+            uint256 thisReserveFactor = reserveFactor[i];
             currentConfig.setReserveFactor(thisReserveFactor, asset[i], assetMappings);
 
             ILendingPool(pool).setConfiguration(
@@ -356,7 +487,7 @@ contract LendingPoolConfigurator is
         onlyTrancheAdmin(trancheId)
     {
         require(asset.length == isFrozen.length, Errors.ARRAY_LENGTH_MISMATCH);
-        for(uint i = 0; i<asset.length;i++){
+        for(uint256 i; i<asset.length;i++){
             DataTypes.ReserveConfigurationMap memory currentConfig = ILendingPool(
                 pool
             ).getConfiguration(asset[i], trancheId);
@@ -401,7 +532,7 @@ contract LendingPoolConfigurator is
         bool[] calldata isWhitelisted
     ) external onlyTrancheAdmin(trancheId) {
         require(user.length == isWhitelisted.length, Errors.ARRAY_LENGTH_MISMATCH);
-        for(uint i = 0;i<user.length;i++) {
+        for(uint256 i;i<user.length;i++) {
             pool.addToWhitelist(trancheId, user[i], isWhitelisted[i]);
             emit UserChangedWhitelist(trancheId, user[i], isWhitelisted[i]);
         }
@@ -420,7 +551,7 @@ contract LendingPoolConfigurator is
         bool[] calldata isBlacklisted
     ) external onlyTrancheAdmin(trancheId) {
         require(user.length == isBlacklisted.length, Errors.ARRAY_LENGTH_MISMATCH);
-        for(uint i = 0;i<user.length;i++) {
+        for(uint256 i;i<user.length;i++) {
             pool.addToBlacklist(trancheId, user[i], isBlacklisted[i]);
             emit UserChangedBlacklist(trancheId, user[i], isBlacklisted[i]);
         }
@@ -430,17 +561,25 @@ contract LendingPoolConfigurator is
      * @dev Sets the interest rate strategy of a reserve
      * @param asset The address of the underlying asset of the reserve
      * @param trancheId The tranche id to set strategy on
-     * @param rateStrategyAddressId The new address of the interest strategy contract
+     * @param rateStrategyAddress The new address of the interest strategy contract
      **/
     function setReserveInterestRateStrategyAddress(
         address asset,
         uint64 trancheId,
-        uint8 rateStrategyAddressId
-    ) external onlyTrancheAdmin(trancheId) {
+        address rateStrategyAddress
+    ) external onlyVerifiedTrancheAdmin(trancheId) {
         //interest rate can only be changed if no one deposited in it, otherwise tranche admins could potentially trick users
+        require(Address.isContract(rateStrategyAddress), Errors.LP_NOT_CONTRACT);
         _checkNoLiquidity(asset, trancheId);
-        address rateStrategyAddress = assetMappings.getInterestRateStrategyAddress(asset, rateStrategyAddressId);
 
+        _setReserveInterestRateStrategyAddress(asset,trancheId,rateStrategyAddress);
+    }
+
+    function _setReserveInterestRateStrategyAddress(
+        address asset,
+        uint64 trancheId,
+        address rateStrategyAddress
+    ) internal {
         pool.setReserveInterestRateStrategyAddress(
             asset,
             trancheId,
@@ -499,7 +638,7 @@ contract LendingPoolConfigurator is
      **/
     function setTranchePause(bool val, uint64 trancheId)
         external
-        onlyEmergencyAdmin
+        onlyEmergencyTrancheAdmin(trancheId)
     {
         pool.setPause(val, trancheId);
     }
@@ -532,10 +671,8 @@ contract LendingPoolConfigurator is
 
         availableLiquidity += IAToken(reserveData.aTokenAddress).getStakedAmount();
 
-        require(
-            availableLiquidity == 0 && reserveData.currentLiquidityRate == 0,
-            Errors.LPC_RESERVE_LIQUIDITY_NOT_0
-        );
+        require(availableLiquidity == 0, Errors.LPC_RESERVE_LIQUIDITY_NOT_0);
+        require(reserveData.currentLiquidityRate == 0, Errors.LPC_RESERVE_LIQUIDITY_NOT_0);
     }
 
     /**
diff --git a/packages/contracts/contracts/protocol/libraries/helpers/Errors.sol b/packages/contracts/contracts/protocol/libraries/helpers/Errors.sol
index b8dbd5d32..7521ac933 100644
--- a/packages/contracts/contracts/protocol/libraries/helpers/Errors.sol
+++ b/packages/contracts/contracts/protocol/libraries/helpers/Errors.sol
@@ -26,7 +26,6 @@ library Errors {
     string public constant CALLER_NOT_TRANCHE_ADMIN = "33"; // 'The caller must be the tranche admin'
     string public constant CALLER_NOT_GLOBAL_ADMIN = "0"; // 'The caller must be the global admin'
     string public constant BORROW_ALLOWANCE_NOT_ENOUGH = "59"; // User borrows on behalf, but allowance are too small
-    string public constant INVALID_TRANCHE = "100"; // 'The caller must be the global admin'
     string public constant ARRAY_LENGTH_MISMATCH = "85";
 
     //contract specific errors
@@ -131,18 +130,29 @@ library Errors {
     string public constant VO_SEQUENCER_DOWN = "97";
     string public constant VO_SEQUENCER_GRACE_PERIOD_NOT_OVER = "98";
     string public constant VO_BASE_CURRENCY_SET_ONLY_ONCE = "99";
-    string public constant VO_WETH_SET_ONLY_ONCE = "105";
-    string public constant VO_BAD_DENOMINATION = "106";
 
     string public constant AM_ASSET_ALREADY_IN_MAPPINGS = "100";
     string public constant AM_ASSET_NOT_CONTRACT = "101";
     string public constant AM_INTEREST_STRATEGY_NOT_CONTRACT = "102";
     string public constant AM_INVALID_CONFIGURATION = "103";
     string public constant AM_UNABLE_TO_DISALLOW_ASSET = "104";
-    string public constant LPAPR_ALREADY_SET = "105";
 
-    string public constant LPC_TREASURY_ADDRESS_ZERO = "106"; //assetmappings does not allow setting collateral
-    string public constant LPC_WHITELISTING_NOT_ALLOWED = "107"; //setting whitelist enabled is not allowed after initializing reserves
+    string public constant VO_WETH_SET_ONLY_ONCE = "105";
+    string public constant VO_BAD_DENOMINATION = "106";
+    string public constant VO_BAD_DECIMALS = "107";
+    
+    string public constant LPAPR_ALREADY_SET = "108";
+
+    string public constant LPC_TREASURY_ADDRESS_ZERO = "109"; //assetmappings does not allow setting collateral
+    string public constant LPC_WHITELISTING_NOT_ALLOWED = "110"; //setting whitelist enabled is not allowed after initializing reserves
+
+    string public constant INVALID_TRANCHE = "111"; // 'The tranche doesn't exist
+
+    string public constant TRANCHE_ADMIN_NOT_VERIFIED = "112"; // 'The caller must be verified tranche admin
+
+    string public constant ALREADY_VERIFIED = "113";
+
+    string public constant LPC_CALLER_NOT_EMERGENCY_ADMIN_OR_VERIFIED_TRANCHE = "114";
 
     enum CollateralManagerErrors {
         NO_ERROR,
diff --git a/packages/contracts/contracts/protocol/libraries/helpers/Helpers.sol b/packages/contracts/contracts/protocol/libraries/helpers/Helpers.sol
index 9f8deed7d..ae7145c9d 100644
--- a/packages/contracts/contracts/protocol/libraries/helpers/Helpers.sol
+++ b/packages/contracts/contracts/protocol/libraries/helpers/Helpers.sol
@@ -3,11 +3,19 @@ pragma solidity 0.8.19;
 
 import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
 import {DataTypes} from "../types/DataTypes.sol";
+import {Errors} from "./Errors.sol";
+import {PercentageMath} from "../math/PercentageMath.sol";
+import {SafeCast} from "../../../dependencies/openzeppelin/contracts/SafeCast.sol";
+import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
+import {ILendingPool} from "../../../interfaces/ILendingPool.sol";
+
 /**
  * @title Helpers library
  * @author Aave and VMEX
  */
 library Helpers {
+    using PercentageMath for uint256;
+    using SafeCast for uint256;
     /**
      * @dev Fetches the user current variable debt balance
      * @param user The user address
@@ -28,18 +36,6 @@ library Helpers {
         return IERC20(reserve.variableDebtTokenAddress).balanceOf(user);
     }
 
-    /**
-     * @dev Converts a bytes32 variable type to a bytes type
-     * @param data The bytes32 type
-     **/
-    function bytes32ToBytes(bytes memory data) internal pure returns (bytes memory result) {
-        assembly {
-            result := mload(0x40)
-            mstore(result, 0x20)
-            mstore(add(result, 0x20), mload(add(data, 0x20)))
-        }
-    }
-
     /**
      * @dev Gets a string attribute of a token (in our case, the name and symbol attribute), where it could 
      * not be implemented, or return bytes32, or return a string
@@ -53,18 +49,15 @@ library Helpers {
     {
         bytes memory payload = abi.encodeWithSignature(functionToQuery);
         (bool success, bytes memory result) = token.staticcall(payload);
-        if (success && result.length > 0) {
+        if (success && result.length != 0) {
             if (result.length == 32) {
                 // If the result is 32 bytes long, assume it's a bytes32 value
-                queryResult = string(abi.encodePacked(bytes32ToBytes(result)));
+                queryResult = string(result);
             } else {
                 // Otherwise, assume it's a string
                 queryResult = abi.decode(result, (string));
             }
         }
-        else {
-            queryResult = "";
-        }
     }
 
     /**
@@ -100,8 +93,10 @@ library Helpers {
 
         bytes memory suffixBytes = new bytes(targetLen);
 
-        for (uint i = 0; i < targetLen; i++) {
+        for (uint256 i; i < targetLen;) {
             suffixBytes[i] = bytes(str)[suffixStart + i];
+
+            unchecked { ++i; }
         }
 
         string memory suffix = string(suffixBytes);
@@ -110,4 +105,59 @@ library Helpers {
 
         return ret;
     }
+
+    function onlyEmergencyAdmin(ILendingPoolAddressesProvider addressesProvider, address user) internal view {
+        require(
+            _isEmergencyAdmin(addressesProvider, user) ||
+            _isGlobalAdmin(addressesProvider, user),
+            Errors.LPC_CALLER_NOT_EMERGENCY_ADMIN
+        );
+    }
+
+    function onlyEmergencyTrancheAdmin(ILendingPoolAddressesProvider addressesProvider, uint64 trancheId, address user) internal view {
+        ILendingPool pool = ILendingPool(addressesProvider.getLendingPool());
+        require(
+            _isEmergencyAdmin(addressesProvider, user) ||
+            (_isTrancheAdmin(addressesProvider,trancheId, user) && pool.getTrancheParams(trancheId).verified) || //allow verified tranche admins to pause tranches
+            _isGlobalAdmin(addressesProvider, user),
+            Errors.LPC_CALLER_NOT_EMERGENCY_ADMIN_OR_VERIFIED_TRANCHE
+        );
+    }
+
+    function onlyGlobalAdmin(ILendingPoolAddressesProvider addressesProvider, address user) internal view {
+        require(
+            _isGlobalAdmin(addressesProvider, user),
+            Errors.CALLER_NOT_GLOBAL_ADMIN
+        );
+    }
+
+    function onlyTrancheAdmin(ILendingPoolAddressesProvider addressesProvider, uint64 trancheId, address user) internal view {
+        require(
+            _isTrancheAdmin(addressesProvider,trancheId, user) ||
+                _isGlobalAdmin(addressesProvider, user),
+            Errors.CALLER_NOT_TRANCHE_ADMIN
+        );
+    }
+
+
+    function onlyVerifiedTrancheAdmin(ILendingPoolAddressesProvider addressesProvider, uint64 trancheId, address user) internal view {
+        ILendingPool pool = ILendingPool(addressesProvider.getLendingPool());
+        require(
+            (_isTrancheAdmin(addressesProvider,trancheId, user) && pool.getTrancheParams(trancheId).verified) ||
+                _isGlobalAdmin(addressesProvider, user),
+            Errors.TRANCHE_ADMIN_NOT_VERIFIED
+        );
+    }
+
+    function _isGlobalAdmin(ILendingPoolAddressesProvider addressesProvider, address user) internal view returns(bool){
+        return addressesProvider.getGlobalAdmin() == user;
+    }
+
+    function _isTrancheAdmin(ILendingPoolAddressesProvider addressesProvider, uint64 trancheId, address user) internal view returns(bool) {
+        return addressesProvider.getTrancheAdmin(trancheId) == user;
+    }
+
+    function _isEmergencyAdmin(ILendingPoolAddressesProvider addressesProvider, address user) internal view returns(bool) {
+        return addressesProvider.getEmergencyAdmin() == user;
+    }
 }
diff --git a/packages/contracts/contracts/protocol/libraries/logic/DepositWithdrawLogic.sol b/packages/contracts/contracts/protocol/libraries/logic/DepositWithdrawLogic.sol
index c4fa12176..f819c05a6 100644
--- a/packages/contracts/contracts/protocol/libraries/logic/DepositWithdrawLogic.sol
+++ b/packages/contracts/contracts/protocol/libraries/logic/DepositWithdrawLogic.sol
@@ -1,7 +1,6 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {SafeMath} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
 import {WadRayMath} from "../math/WadRayMath.sol";
 import {PercentageMath} from "../math/PercentageMath.sol";
@@ -22,7 +21,6 @@ import {IAssetMappings} from "../../../interfaces/IAssetMappings.sol";
  * @notice Implements functions to deposit and withdraw
  */
 library DepositWithdrawLogic {
-    using SafeMath for uint256;
     using WadRayMath for uint256;
     using PercentageMath for uint256;
     using SafeERC20 for IERC20;
@@ -61,11 +59,11 @@ library DepositWithdrawLogic {
         ValidationLogic.validateDeposit(vars.asset, self, vars.amount, vars._assetMappings);
 
         self.updateInterestRates(
+            vars._assetMappings,
             vars.asset,
             vars.trancheId,
             vars.amount,
-            0,
-            vars._assetMappings.getVMEXReserveFactor(vars.asset)
+            0
         );
 
         IERC20(vars.asset).safeTransferFrom(msg.sender, aToken, vars.amount);
@@ -133,7 +131,7 @@ library DepositWithdrawLogic {
             _assetMappings
         );
 
-        reserve.updateInterestRates(vars.asset, vars.trancheId, 0, vars.amount, _assetMappings.getVMEXReserveFactor(vars.asset));
+        reserve.updateInterestRates(_assetMappings, vars.asset, vars.trancheId, 0, vars.amount);
 
         if (vars.amount == userBalance) {
             user.setUsingAsCollateral(reserve.id, false);
@@ -189,11 +187,11 @@ library DepositWithdrawLogic {
         }
 
         reserve.updateInterestRates(
+            vars._assetMappings,
             vars.asset,
             vars.trancheId,
             0,
-            vars.releaseUnderlying ? vars.amount : 0,
-            vars._assetMappings.getVMEXReserveFactor(vars.asset)
+            vars.releaseUnderlying ? vars.amount : 0
         );
 
         if (vars.releaseUnderlying) {
diff --git a/packages/contracts/contracts/protocol/libraries/logic/GenericLogic.sol b/packages/contracts/contracts/protocol/libraries/logic/GenericLogic.sol
index 6395ac770..5952b9a5e 100644
--- a/packages/contracts/contracts/protocol/libraries/logic/GenericLogic.sol
+++ b/packages/contracts/contracts/protocol/libraries/logic/GenericLogic.sol
@@ -1,7 +1,6 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {SafeMath} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
 import {ReserveLogic} from "./ReserveLogic.sol";
 import {ReserveConfiguration} from "../configuration/ReserveConfiguration.sol";
@@ -19,7 +18,6 @@ import {IAssetMappings} from "../../../interfaces/IAssetMappings.sol";
  */
 library GenericLogic {
     using ReserveLogic for DataTypes.ReserveData;
-    using SafeMath for uint256;
     using WadRayMath for uint256;
     using PercentageMath for uint256;
     using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
@@ -79,7 +77,7 @@ library GenericLogic {
 
         BalanceDecreaseAllowedLocalVars memory vars;
 
-        (, vars.liquidationThreshold, , vars.decimals, ) = params.assetMappings.getParams(params.asset);
+        (, vars.liquidationThreshold, , vars.decimals, ) = params.assetMappings.getParams(params.asset, params.trancheId);
 
         (
             vars.totalCollateralInETH,
@@ -108,22 +106,18 @@ library GenericLogic {
             )
         ).getAssetPrice(params.asset);
 
-        vars.amountToDecreaseInETH  = vars.currentPrice.mul(params.amount).div(10**vars.decimals);
+        vars.amountToDecreaseInETH  = vars.currentPrice * params.amount / 10**vars.decimals;
 
-        vars.collateralBalanceAfterDecrease = vars.totalCollateralInETH.sub(
-            vars.amountToDecreaseInETH
-        );
+        vars.collateralBalanceAfterDecrease = vars.totalCollateralInETH - vars.amountToDecreaseInETH;
 
         //if there is a borrow, there can't be 0 collateral
         if (vars.collateralBalanceAfterDecrease == 0) {
             return false;
         }
 
-        vars.liquidationThresholdAfterDecrease = vars
-            .totalCollateralInETH
-            .mul(vars.avgLiquidationThreshold)
-            .sub(vars.amountToDecreaseInETH.mul(vars.liquidationThreshold))
-            .div(vars.collateralBalanceAfterDecrease);
+        vars.liquidationThresholdAfterDecrease = (vars.totalCollateralInETH * vars.avgLiquidationThreshold
+            - vars.amountToDecreaseInETH * vars.liquidationThreshold)
+            / vars.collateralBalanceAfterDecrease;
 
 
         vars.healthFactorAfterDecrease = calculateHealthFactorFromBalances(
@@ -138,8 +132,6 @@ library GenericLogic {
     }
 
     struct CalculateUserAccountDataVars {
-        uint64 currentTranche;
-        uint64 trancheId;
         uint256 reserveUnitPrice;
         uint256 tokenUnit;
         uint256 compoundedLiquidityBalance;
@@ -158,7 +150,9 @@ library GenericLogic {
         uint256 avgBorrowFactor;
         uint256 reservesLength;
         uint256 liquidityBalanceETH;
+        uint64 currentTranche;
         address currentReserveAddress;
+        uint64 trancheId;
         address oracle;
         address user;
         bool healthFactorBelowThreshold;
@@ -208,7 +202,7 @@ library GenericLogic {
 
         vars.oracle = addressesProvider.getPriceOracle();
 
-        for (vars.i = 0; vars.i < reservesCount; vars.i++) {
+        for (; vars.i < reservesCount; ++vars.i) {
             // continue if not allowed. Not allowed will only be set if NO Borrows outstanding, so no chance of unaccounted debt
             if (!userConfig.isUsingAsCollateralOrBorrowing(vars.i) || !assetMappings.getAssetAllowed(reserves[vars.i])) {
                 continue;
@@ -225,7 +219,7 @@ library GenericLogic {
                 ,
                 vars.decimals,
                 vars.borrowFactor
-            ) = assetMappings.getParams(vars.currentReserveAddress);
+            ) = assetMappings.getParams(vars.currentReserveAddress, vars.trancheId);
 
             vars.tokenUnit = 10**vars.decimals;
             vars.reserveUnitPrice = IPriceOracleGetter(vars.oracle)
@@ -239,51 +233,36 @@ library GenericLogic {
                     currentReserve.aTokenAddress
                 ).balanceOf(vars.user);
                 // could also be in USD if reserveUnitPrice is in USD (with 8 decimals)
-                vars.liquidityBalanceETH = vars
-                    .reserveUnitPrice
-                    .mul(vars.compoundedLiquidityBalance)
-                    .div(vars.tokenUnit);
-
-                vars.totalCollateralInETH = vars.totalCollateralInETH.add(
-                    vars.liquidityBalanceETH
-                );
-
-                vars.avgLtv = vars.avgLtv.add(
-                    vars.liquidityBalanceETH.mul(vars.ltv)
-                );
-                vars.avgLiquidationThreshold = vars.avgLiquidationThreshold.add(
-                    vars.liquidityBalanceETH.mul(vars.liquidationThreshold)
-                );
+                vars.liquidityBalanceETH = vars.reserveUnitPrice * vars.compoundedLiquidityBalance / vars.tokenUnit;
+
+                vars.totalCollateralInETH = vars.totalCollateralInETH + vars.liquidityBalanceETH;
+
+                vars.avgLtv = vars.avgLtv + vars.liquidityBalanceETH * vars.ltv;
+                vars.avgLiquidationThreshold = vars.avgLiquidationThreshold + vars.liquidityBalanceETH * vars.liquidationThreshold;
             }
 
             if (userConfig.isBorrowing(vars.i)) {
                 vars.compoundedBorrowBalance =
                     IERC20(currentReserve.variableDebtTokenAddress).balanceOf(vars.user);
 
-                vars.thisDebtInEth = vars.reserveUnitPrice.mul(vars.compoundedBorrowBalance).div(
-                        vars.tokenUnit
-                    );
+                vars.thisDebtInEth = vars.reserveUnitPrice * vars.compoundedBorrowBalance / vars.tokenUnit;
 
-                vars.totalDebtInETH = vars.totalDebtInETH.add(
-                    vars.thisDebtInEth
-                );
+                vars.totalDebtInETH = vars.totalDebtInETH + vars.thisDebtInEth;
 
                 if(vars.borrowFactor != 0){
-                    vars.avgBorrowFactor = vars.avgBorrowFactor.add(
-                        vars.thisDebtInEth.mul(vars.borrowFactor)
-                    );
+                    vars.avgBorrowFactor = vars.avgBorrowFactor + vars.thisDebtInEth * vars.borrowFactor;
                 }
             }
         }
 
-        vars.avgLtv = vars.totalCollateralInETH > 0
-            ? vars.avgLtv.div(vars.totalCollateralInETH)
+        vars.avgLtv = vars.totalCollateralInETH != 0
+            ? vars.avgLtv / vars.totalCollateralInETH
             : 0; //weighted average of all ltv's across all supplied assets
-        vars.avgLiquidationThreshold = vars.totalCollateralInETH > 0
-            ? vars.avgLiquidationThreshold.div(vars.totalCollateralInETH)
+        vars.avgLiquidationThreshold = vars.totalCollateralInETH != 0
+            ? vars.avgLiquidationThreshold / vars.totalCollateralInETH
             : 0;
-        vars.avgBorrowFactor = vars.totalDebtInETH > 0
-            ? vars.avgBorrowFactor.div(vars.totalDebtInETH)
+        vars.avgBorrowFactor = vars.totalDebtInETH != 0
+            ? vars.avgBorrowFactor / vars.totalDebtInETH
             : 0;
 
         vars.healthFactor = calculateHealthFactorFromBalances(
@@ -345,7 +324,7 @@ library GenericLogic {
             return 0;
         }
 
-        availableBorrowsETH = availableBorrowsETH.sub(totalDebtInETH.percentMul(avgBorrowFactor));
+        availableBorrowsETH = availableBorrowsETH - totalDebtInETH.percentMul(avgBorrowFactor);
         return availableBorrowsETH;
     }
 }
diff --git a/packages/contracts/contracts/protocol/libraries/logic/ReserveLogic.sol b/packages/contracts/contracts/protocol/libraries/logic/ReserveLogic.sol
index 6181ff820..8bc424e25 100644
--- a/packages/contracts/contracts/protocol/libraries/logic/ReserveLogic.sol
+++ b/packages/contracts/contracts/protocol/libraries/logic/ReserveLogic.sol
@@ -1,10 +1,10 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {SafeMath} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
 import {SafeERC20} from "../../../dependencies/openzeppelin/contracts/SafeERC20.sol";
 import {IAToken} from "../../../interfaces/IAToken.sol";
+import {IAssetMappings} from "../../../interfaces/IAssetMappings.sol";
 import {IVariableDebtToken} from "../../../interfaces/IVariableDebtToken.sol";
 import {IReserveInterestRateStrategy} from "../../../interfaces/IReserveInterestRateStrategy.sol";
 import {ReserveConfiguration} from "../configuration/ReserveConfiguration.sol";
@@ -19,7 +19,6 @@ import {DataTypes} from "../types/DataTypes.sol";
  * @notice Implements the logic to update the reserves state
  */
 library ReserveLogic {
-    using SafeMath for uint256;
     using WadRayMath for uint256;
     using PercentageMath for uint256;
     using SafeERC20 for IERC20;
@@ -149,7 +148,7 @@ library ReserveLogic {
             totalLiquidity.wadToRay()
         );
 
-        uint256 result = amountToLiquidityRatio.add(WadRayMath.ray());
+        uint256 result = amountToLiquidityRatio + WadRayMath.ray();
 
         result = result.rayMul(reserve.liquidityIndex);
         require(
@@ -168,23 +167,17 @@ library ReserveLogic {
     function init(
         DataTypes.ReserveData storage reserve,
         address aTokenAddress,
-        address variableDebtTokenAddress,
-        address interestRateStrategyAddress
+        address variableDebtTokenAddress
     ) external {
         require(
             reserve.aTokenAddress == address(0),
             Errors.RL_RESERVE_ALREADY_INITIALIZED
         );
-        {
-            reserve.liquidityIndex = uint128(WadRayMath.ray());
-            reserve.variableBorrowIndex = uint128(WadRayMath.ray());
-            reserve.aTokenAddress = aTokenAddress;
-            reserve.variableDebtTokenAddress = variableDebtTokenAddress;
-        }
-        {
-            reserve.interestRateStrategyAddress = interestRateStrategyAddress;
-            reserve.lastUpdateTimestamp =  uint40(block.timestamp);
-        }
+        reserve.liquidityIndex = uint128(WadRayMath.ray());
+        reserve.variableBorrowIndex = uint128(WadRayMath.ray());
+        reserve.aTokenAddress = aTokenAddress;
+        reserve.variableDebtTokenAddress = variableDebtTokenAddress;
+        reserve.lastUpdateTimestamp =  uint40(block.timestamp);
     }
 
     struct UpdateInterestRatesLocalVars {
@@ -199,18 +192,19 @@ library ReserveLogic {
      * @param reserve The address of the reserve to be updated
      * @param liquidityAdded The amount of liquidity added to the protocol (deposit or repay) in the previous action
      * @param liquidityTaken The amount of liquidity taken from the protocol (redeem or borrow)
-     * @param vmexReserveFactor The vmex reserve factor
      **/
     function updateInterestRates(
         DataTypes.ReserveData storage reserve,
+        IAssetMappings assetMappings,
         address reserveAddress,
         uint64 trancheId,
         uint256 liquidityAdded,
-        uint256 liquidityTaken,
-        uint256 vmexReserveFactor
+        uint256 liquidityTaken
     ) internal {
         UpdateInterestRatesLocalVars memory vars;
 
+        uint256 vmexReserveFactor = assetMappings.getVMEXReserveFactor(reserveAddress);
+
         //calculates the total variable debt locally using the scaled total supply instead
         //of totalSupply(), as it's noticeably cheaper. Also, the index has been
         //updated by the previous updateState() call
@@ -232,7 +226,7 @@ library ReserveLogic {
             vars.newLiquidityRate,
             vars.newVariableRate
         ) = IReserveInterestRateStrategy(
-            reserve.interestRateStrategyAddress
+            assetMappings.getInterestRateStrategyAddress(reserveAddress, trancheId)
         ).calculateInterestRates(calvars);
 
         require(
@@ -306,9 +300,7 @@ library ReserveLogic {
 
         //debt accrued is the sum of the current debt minus the sum of the debt at the last update
         //note that repay did not have to occur for this to be higher.
-        vars.totalDebtAccrued = vars
-            .currentVariableDebt
-            .sub(vars.previousVariableDebt);
+        vars.totalDebtAccrued = vars.currentVariableDebt - vars.previousVariableDebt;
 
         vars.amountToMint = vars
             .totalDebtAccrued
@@ -323,9 +315,7 @@ library ReserveLogic {
 
         vars.amountToMintVMEX = vars
             .totalDebtAccrued
-            .percentMul(
-                PercentageMath.PERCENTAGE_FACTOR.sub(vars.reserveFactor)
-            )
+            .percentMul(PercentageMath.PERCENTAGE_FACTOR - vars.reserveFactor)
             .percentMul(
                 vars.globalVMEXReserveFactor //for global VMEX reserve
             );
diff --git a/packages/contracts/contracts/protocol/libraries/logic/ValidationLogic.sol b/packages/contracts/contracts/protocol/libraries/logic/ValidationLogic.sol
index 86d04d13e..1eec1fc3c 100644
--- a/packages/contracts/contracts/protocol/libraries/logic/ValidationLogic.sol
+++ b/packages/contracts/contracts/protocol/libraries/logic/ValidationLogic.sol
@@ -1,7 +1,6 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {SafeMath} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
 import {ReserveLogic} from "./ReserveLogic.sol";
 import {GenericLogic} from "./GenericLogic.sol";
@@ -23,7 +22,6 @@ import {IAToken} from "../../../interfaces/IAToken.sol";
  */
 library ValidationLogic {
     using ReserveLogic for DataTypes.ReserveData;
-    using SafeMath for uint256;
     using WadRayMath for uint256;
     using PercentageMath for uint256;
     using SafeERC20 for IERC20;
@@ -151,7 +149,7 @@ library ValidationLogic {
     }
 
     function validateBorrow(
-        DataTypes.ExecuteBorrowParams memory exvars,
+        DataTypes.ExecuteBorrowParams calldata exvars,
         DataTypes.ReserveData storage reserve,
         mapping(address => mapping(uint64 => DataTypes.ReserveData))
             storage reservesData,
@@ -199,14 +197,12 @@ library ValidationLogic {
         );
 
         // amountInETH always has 18 decimals (or if oracle has 8 decimals, this also has 8 decimals), since the assetPrice always has 18 decimals. Scaling by amount/asset decimals.
-        uint256 amountInETH = exvars.assetPrice.mul(exvars.amount).div(
-                10**exvars._assetMappings.getDecimals(exvars.asset)
-            );
+        uint256 amountInETH = exvars.assetPrice * exvars.amount / 10**exvars._assetMappings.getDecimals(exvars.asset);
 
         //(uint256(14), uint256(14), uint256(14), uint256(14), uint256(14));
 
         require(
-            vars.userCollateralBalanceETH > 0,
+            vars.userCollateralBalanceETH != 0,
             Errors.VL_COLLATERAL_BALANCE_IS_0
         );
 
@@ -218,10 +214,8 @@ library ValidationLogic {
 
         //add the current already borrowed amount to the amount requested to calculate the total collateral needed.
         //risk adjusted debt
-        vars.amountOfCollateralNeededETH = vars
-            .userBorrowBalanceETH
-            .percentMul(vars.avgBorrowFactor)
-            .add(amountInETH.percentMul(exvars._assetMappings.getBorrowFactor(exvars.asset))) //this amount that we are borrowing also has a borrow factor that increases the actual debt
+        vars.amountOfCollateralNeededETH = (vars.userBorrowBalanceETH.percentMul(vars.avgBorrowFactor)
+            + amountInETH.percentMul(exvars._assetMappings.getBorrowFactor(exvars.asset))) //this amount that we are borrowing also has a borrow factor that increases the actual debt
             .percentDiv(vars.currentLtv); //LTV is calculated in percentage
 
         require(
@@ -251,9 +245,9 @@ library ValidationLogic {
 
         require(isActive, Errors.VL_NO_ACTIVE_RESERVE);
 
-        require(amountSent > 0, Errors.VL_INVALID_AMOUNT);
+        require(amountSent != 0, Errors.VL_INVALID_AMOUNT);
 
-        require(variableDebt > 0, Errors.VL_NO_DEBT_OF_SELECTED_TYPE);
+        require(variableDebt != 0, Errors.VL_NO_DEBT_OF_SELECTED_TYPE);
 
         require(
             amountSent != type(uint256).max || msg.sender == onBehalfOf,
@@ -290,7 +284,7 @@ library ValidationLogic {
         );
 
         require(
-            underlyingBalance > 0,
+            underlyingBalance != 0,
             Errors.VL_UNDERLYING_BALANCE_NOT_GREATER_THAN_0
         );
 
@@ -416,4 +410,44 @@ library ValidationLogic {
             Errors.VL_TRANSFER_NOT_ALLOWED
         );
     }
+
+
+    /**
+     * @dev Validates the collateral params: ltv must be less than 100%, liquidation Bonus must be greater than 100%,
+     * liquidation threshold * liquidation bonus must be less than 100% for liquidators to break even, borrow factor must be greater than 100%
+     * @param baseLTV The LTV (in decimals adjusted for percentage math decimals)
+     * @param liquidationThreshold The liquidation threshold (in decimals adjusted for percentage math decimals)
+     * @param liquidationBonus The liquidation bonus (in decimals adjusted for percentage math decimals)
+     * @param borrowFactor The borrow factor (in decimals adjusted for percentage math decimals)
+     **/
+    function validateCollateralParams(
+        uint64 baseLTV,
+        uint64 liquidationThreshold,
+        uint64 liquidationBonus,
+        uint64 borrowFactor
+    ) external pure {
+        require(baseLTV <= liquidationThreshold, Errors.AM_INVALID_CONFIGURATION);
+
+        if (liquidationThreshold != 0) {
+            //liquidation bonus must be bigger than 100.00%, otherwise the liquidator would receive less
+            //collateral than needed to cover the debt
+            require(
+                uint256(liquidationBonus) > PercentageMath.PERCENTAGE_FACTOR,
+                Errors.AM_INVALID_CONFIGURATION
+            );
+
+            //if threshold * bonus is less than PERCENTAGE_FACTOR, it's guaranteed that at the moment
+            //a loan is taken there is enough collateral available to cover the liquidation bonus
+
+            require(
+                uint256(liquidationThreshold).percentMul(uint256(liquidationBonus)) <=
+                    PercentageMath.PERCENTAGE_FACTOR,
+                Errors.AM_INVALID_CONFIGURATION
+            );
+        }
+        require(
+            uint256(borrowFactor) >= PercentageMath.PERCENTAGE_FACTOR,
+            Errors.AM_INVALID_CONFIGURATION
+        );
+    }
 }
diff --git a/packages/contracts/contracts/protocol/libraries/math/MathUtils.sol b/packages/contracts/contracts/protocol/libraries/math/MathUtils.sol
index baad74b41..48f5160cf 100644
--- a/packages/contracts/contracts/protocol/libraries/math/MathUtils.sol
+++ b/packages/contracts/contracts/protocol/libraries/math/MathUtils.sol
@@ -1,13 +1,9 @@
 // SPDX-License-Identifier: agpl-3.0
 pragma solidity 0.8.19;
 
-import {
-    SafeMath
-} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {WadRayMath} from "./WadRayMath.sol";
 
 library MathUtils {
-    using SafeMath for uint256;
     using WadRayMath for uint256;
 
     /// @dev Ignoring leap years
@@ -26,11 +22,9 @@ library MathUtils {
         returns (uint256)
     {
         //solium-disable-next-line
-        uint256 timeDifference =
-            block.timestamp.sub(uint256(lastUpdateTimestamp));
+        uint256 timeDifference = block.timestamp - lastUpdateTimestamp;
 
-        return
-            (rate.mul(timeDifference) / SECONDS_PER_YEAR).add(WadRayMath.ray());
+        return rate * timeDifference / SECONDS_PER_YEAR + WadRayMath.ray();
     }
 
     /**
@@ -52,7 +46,7 @@ library MathUtils {
         uint256 currentTimestamp
     ) internal pure returns (uint256) {
         //solium-disable-next-line
-        uint256 exp = currentTimestamp.sub(uint256(lastUpdateTimestamp));
+        uint256 exp = currentTimestamp - lastUpdateTimestamp;
 
         if (exp == 0) {
             return WadRayMath.ray();
@@ -67,14 +61,10 @@ library MathUtils {
         uint256 basePowerTwo = ratePerSecond.rayMul(ratePerSecond);
         uint256 basePowerThree = basePowerTwo.rayMul(ratePerSecond);
 
-        uint256 secondTerm = exp.mul(expMinusOne).mul(basePowerTwo) / 2;
-        uint256 thirdTerm =
-            exp.mul(expMinusOne).mul(expMinusTwo).mul(basePowerThree) / 6;
+        uint256 secondTerm = exp * expMinusOne * basePowerTwo / 2;
+        uint256 thirdTerm = exp * expMinusOne * expMinusTwo * basePowerThree / 6;
 
-        return
-            WadRayMath.ray().add(ratePerSecond.mul(exp)).add(secondTerm).add(
-                thirdTerm
-            );
+        return WadRayMath.ray() + ratePerSecond * exp + secondTerm + thirdTerm;
     }
 
     /**
diff --git a/packages/contracts/contracts/protocol/libraries/math/PercentageMath.sol b/packages/contracts/contracts/protocol/libraries/math/PercentageMath.sol
index 02918561b..e5f378ae8 100644
--- a/packages/contracts/contracts/protocol/libraries/math/PercentageMath.sol
+++ b/packages/contracts/contracts/protocol/libraries/math/PercentageMath.sol
@@ -16,19 +16,6 @@ library PercentageMath {
     uint256 constant PERCENTAGE_FACTOR = 10**NUM_DECIMALS; //percentage plus 16 decimals
     uint256 constant HALF_PERCENT = PERCENTAGE_FACTOR / 2;
 
-    /**
-     * @dev Converts the original Aave Percentage math values (2 decimals of precision) to
-     * an arbitrary number of decimals determined by NUM_DECIMALS
-     * @param value The value with 2 decimals of precision to convert
-     **/
-    function convertToPercent(uint256 value)
-        internal
-        pure
-        returns (uint256)
-    {
-        return value*10**(NUM_DECIMALS-4);
-    }
-
     /**
      * @dev Executes a percentage multiplication
      * @param value The value of which the percentage needs to be calculated
diff --git a/packages/contracts/contracts/protocol/libraries/types/DataTypes.sol b/packages/contracts/contracts/protocol/libraries/types/DataTypes.sol
index 600bd37cd..a2cfede48 100644
--- a/packages/contracts/contracts/protocol/libraries/types/DataTypes.sol
+++ b/packages/contracts/contracts/protocol/libraries/types/DataTypes.sol
@@ -4,16 +4,18 @@ pragma solidity 0.8.19;
 import {IAssetMappings} from "../../../interfaces/IAssetMappings.sol";
 import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
 import {ILendingPool} from "../../../interfaces/ILendingPool.sol";
+import {ICurvePool} from "../../../interfaces/ICurvePool.sol";
 
 library DataTypes {
     struct TrancheParams {
         uint8 reservesCount;
         bool paused;
         bool isUsingWhitelist;
+        bool verified;
     }
 
     struct CurveMetadata {
-        bool _checkReentrancy;
+        ICurvePool.CurveReentrancyType _reentrancyType;
         uint8 _poolSize;
         address _curvePool;
     }
@@ -39,8 +41,7 @@ library DataTypes {
         bool exists;    //true if the asset was added to the linked list, false otherwise
         uint8 assetType; //to choose what oracle to use
         uint64 VMEXReserveFactor; //64 bits. is sufficient (percentages can all be stored in 64 bits)
-        //mapping(uint8=>address) interestRateStrategyAddress;//user must choose from this set list (index 0 is default)
-        //the only difference between the different strategies is the value of the slopes and optimal utilization
+        address defaultInterestRateStrategyAddress;
         //pointer to the next asset that is approved. This allows us to avoid using a list
         address nextApprovedAsset;
     }
@@ -52,7 +53,8 @@ library DataTypes {
         YEARN, //3
         BEEFY, //4
         VELODROME, //5
-        BEETHOVEN //6
+        BEETHOVEN, //6
+        RETH //7
     } //update with other possible types of the underlying asset
     //AAVE is the original assets in the aave protocol
     //CURVE is the new LP tokens we are providing support for
@@ -78,7 +80,13 @@ library DataTypes {
         address variableDebtTokenAddress; //not used for nonlendable assets
         //the id of the reserve. Represents the position in the list of the active reserves
         uint8 id;
+
+        // these are only set if tranche becomes verified
         address interestRateStrategyAddress;
+        uint64 baseLTV; // % of value of collateral that can be used to borrow. "Collateral factor." 64 bits
+        uint64 liquidationThreshold; //if this is zero, then disabled as collateral. 64 bits
+        uint64 liquidationBonus; // 64 bits
+        uint64 borrowFactor; // borrowFactor * baseLTV * value = truly how much you can borrow of an asset. 64 bits
     }
 
     // uint8 constant NUM_TRANCHES = 3;
diff --git a/packages/contracts/contracts/protocol/libraries/types/DistributionTypes.sol b/packages/contracts/contracts/protocol/libraries/types/DistributionTypes.sol
index c6cbd7a97..c203f2900 100644
--- a/packages/contracts/contracts/protocol/libraries/types/DistributionTypes.sol
+++ b/packages/contracts/contracts/protocol/libraries/types/DistributionTypes.sol
@@ -29,7 +29,7 @@ library DistributionTypes {
    **/
   struct IncentivizedAsset {
     mapping(address => Reward) rewardData;
-    mapping(uint128 => address) rewardList;
+    mapping(uint256 => address) rewardList;
     uint128 numRewards;
     uint8 decimals;
   }
diff --git a/packages/contracts/contracts/protocol/oracles/BalancerOracle.sol b/packages/contracts/contracts/protocol/oracles/BalancerOracle.sol
index 40c42076a..99d865ecb 100644
--- a/packages/contracts/contracts/protocol/oracles/BalancerOracle.sol
+++ b/packages/contracts/contracts/protocol/oracles/BalancerOracle.sol
@@ -113,11 +113,11 @@ library BalancerOracle {
 		uint256 pxB,
 		bool legacy
 		) internal returns (uint) {
-				(IBalancer pool, 
-				IERC20[] memory tokens,
-				uint256[] memory balances,
-				uint256[] memory weights) = 
-					get_balancer_variables(bal_pool); 	
+			(IBalancer pool, 
+			IERC20[] memory tokens,
+			uint256[] memory balances,
+			uint256[] memory weights) = 
+			get_balancer_variables(bal_pool); 	
 
     		require(balances.length == 2, 'num tokens must be 2');
 
diff --git a/packages/contracts/contracts/protocol/oracles/CurveOracle.sol b/packages/contracts/contracts/protocol/oracles/CurveOracle.sol
index 23ee7a8ec..03a68519e 100644
--- a/packages/contracts/contracts/protocol/oracles/CurveOracle.sol
+++ b/packages/contracts/contracts/protocol/oracles/CurveOracle.sol
@@ -6,102 +6,56 @@ import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20De
 import {vMath} from "./libs/vMath.sol"; 
 import {Errors} from "../libraries/helpers/Errors.sol";
 import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
-import "hardhat/console.sol";
+//import "hardhat/console.sol";
 
 //used for all curveV1 amd V2 tokens, no need to redeploy
 library CurveOracle {
-	function try_remove_liquidity_3(address curve_pool) internal returns(bool){
-    	uint[3] memory amounts = [uint(0), uint(0), uint(0)];
-		try ICurvePool(curve_pool).remove_liquidity(0, amounts) returns(uint256[3] memory) {
-			return true;
-		} catch {
-			try ICurvePool2(curve_pool).remove_liquidity(0, amounts) {
-				return true;
-			} catch {
-				return false;
-			}
-		}
-	}
-	function try_remove_liquidity_2(address curve_pool) internal returns(bool){
-    	uint[2] memory amounts = [uint(0), uint(0)];
-		try ICurvePool(curve_pool).remove_liquidity(0, amounts) returns(uint256[2] memory) {
-			return true;
-		} catch {
-			try ICurvePool2(curve_pool).remove_liquidity(0, amounts) {
-				return true;
-			} catch {
-				return false;
-			}
-		}
-	}
-
-	function try_remove_liquidity_one_coin(address curve_pool) internal returns(bool){
-		try ICurvePool(curve_pool).remove_liquidity_one_coin(0,1,0) {
-			return true;
-		} catch {
-			try ICurvePool2(curve_pool).remove_liquidity_one_coin(0,1,0) returns(uint256){
-				return true;
-			} catch {
-
-				return false;
-			}
-		}
-	}
-
-	// function try_admin_fees(address curve_pool) internal returns(bool){
-	// 	try ICurvePool(curve_pool).claim_admin_fees() {
-	// 		return true;
-    //     } catch {
-	// 		try ICurvePool(curve_pool).withdraw_admin_fees() {
-	// 			return true;
-	// 		} catch {
-	// 			return false;
-	// 		}
-    //     }
-	// }
-
 	/**
      * @dev Helper to prevent read-only re-entrancy attacks with virtual price. Only needed if the underlying has ETH.
      * @param curve_pool The curve pool address (not the token address!)
      **/
-	function check_reentrancy(address curve_pool, uint256 num_tokens) internal {
+	function check_reentrancy(address curve_pool, ICurvePool.CurveReentrancyType reentrancyType) internal {
 		//makerdao uses remove_liquidity to trigger reentrancy lock
-		// if(try_admin_fees(curve_pool)){
-		// 	return;
-		// }
-		// address owner = ICurvePool(curve_pool).owner();
-		// if(Address.isContract(owner)) {
-		// 	if(try_admin_fees(owner)){
-		// 		return;
-		// 	}
-		// }
-		if(try_remove_liquidity_one_coin(curve_pool)){
+		if(reentrancyType == ICurvePool.CurveReentrancyType.NO_CHECK){
 			return;
 		}
-		if(num_tokens==2 && try_remove_liquidity_2(curve_pool)){
-			return;
+		else if(reentrancyType == ICurvePool.CurveReentrancyType.REMOVE_LIQUIDITY_ONE_COIN){
+			ICurvePool(curve_pool).remove_liquidity_one_coin(0,1,0);
 		}
-		if(num_tokens==3 && try_remove_liquidity_3(curve_pool)){
-			return;
+		else if(reentrancyType == ICurvePool.CurveReentrancyType.REMOVE_LIQUIDITY_ONE_COIN_RETURNS){
+			ICurvePool2(curve_pool).remove_liquidity_one_coin(0,1,0);
+		}
+		else if(reentrancyType == ICurvePool.CurveReentrancyType.REMOVE_LIQUIDITY_2){
+			uint[2] memory amounts = [uint(0), uint(0)];
+			ICurvePool2(curve_pool).remove_liquidity(0, amounts);
+		}
+		else if(reentrancyType == ICurvePool.CurveReentrancyType.REMOVE_LIQUIDITY_2_RETURNS){
+			uint[2] memory amounts = [uint(0), uint(0)];
+			ICurvePool(curve_pool).remove_liquidity(0, amounts);
+		}
+		else if(reentrancyType == ICurvePool.CurveReentrancyType.REMOVE_LIQUIDITY_3){
+			uint[3] memory amounts = [uint(0), uint(0), uint(0)];
+			ICurvePool2(curve_pool).remove_liquidity(0, amounts);
+		}
+		else if(reentrancyType == ICurvePool.CurveReentrancyType.REMOVE_LIQUIDITY_3_RETURNS){
+			uint[3] memory amounts = [uint(0), uint(0), uint(0)];
+			ICurvePool(curve_pool).remove_liquidity(0, amounts);
+		}
+		else {
+			revert(Errors.VO_REENTRANCY_GUARD_FAIL);
 		}
-		uint[3] memory amounts = [uint(0), uint(0), uint(0)];
-		ICurvePool2(curve_pool).remove_liquidity(0, amounts);
-		revert(Errors.VO_REENTRANCY_GUARD_FAIL);
 	}
 	
 	/**
      * @dev Calculates the value of a curve v1 lp token
      * @param curve_pool The curve pool address (not the token address!)
      * @param prices The price of the underlying assets in the curve pool
-     * @param checkReentrancy Whether reentrancy check is needed
+     * @param reentrancyType Whhat type of reentrancy check is needed
      **/
-	function get_price_v1(address curve_pool, uint256[] memory prices, bool checkReentrancy) internal returns(uint256) {
+	function get_price_v1(address curve_pool, uint256[] memory prices, ICurvePool.CurveReentrancyType reentrancyType) internal returns(uint256) {
 	//prevent read-only reentrancy -- possibly a better way than this
 		assert(prices.length > 1);
-		
-		if(checkReentrancy){
-			check_reentrancy(curve_pool, prices.length);
-		}
+		check_reentrancy(curve_pool, reentrancyType);
 		uint256 virtual_price = ICurvePool(curve_pool).get_virtual_price();
 
 		uint256 minPrice = vMath.min(prices);
@@ -130,12 +84,10 @@ library CurveOracle {
      * @dev Calculates the value of a curve v2 lp token (not pegged)
      * @param curve_pool The curve pool address (not the token address!)
      * @param prices The price of the underlying assets in the curve pool
-     * @param checkReentrancy Whether reentrancy check is needed
+     * @param reentrancyType What type of reentrancy check is needed
      **/
-	function get_price_v2(address curve_pool, uint256[] memory prices, bool checkReentrancy) internal returns(uint256) {
-		if(checkReentrancy){
-			check_reentrancy(curve_pool, prices.length);
-		}
+	function get_price_v2(address curve_pool, uint256[] memory prices, ICurvePool.CurveReentrancyType reentrancyType) internal returns(uint256) {
+		check_reentrancy(curve_pool, reentrancyType);
         uint256 virtual_price = ICurvePool(curve_pool).get_virtual_price();
 
 		uint256 lp_price = calculate_v2_token_price(
diff --git a/packages/contracts/contracts/protocol/oracles/VMEXOracle.sol b/packages/contracts/contracts/protocol/oracles/VMEXOracle.sol
index afe83f471..ef8a6df89 100644
--- a/packages/contracts/contracts/protocol/oracles/VMEXOracle.sol
+++ b/packages/contracts/contracts/protocol/oracles/VMEXOracle.sol
@@ -9,7 +9,7 @@ import {IChainlinkPriceFeed} from "../../interfaces/IChainlinkPriceFeed.sol";
 import {IChainlinkAggregator} from "../../interfaces/IChainlinkAggregator.sol";
 import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
 import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
-import {Initializable} from "../../dependencies/openzeppelin/upgradeability/Initializable.sol";
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";
 import {DataTypes} from "../libraries/types/DataTypes.sol";
 import {CurveOracle} from "./CurveOracle.sol";
@@ -24,6 +24,7 @@ import {IBalancer} from "../../interfaces/IBalancer.sol";
 import {IVault} from "../../interfaces/IVault.sol";
 import {VelodromeOracle} from "./VelodromeOracle.sol";
 import {BalancerOracle} from "./BalancerOracle.sol";
+import {IRocketPriceOracle} from "../../interfaces/IRocketPriceOracle.sol";
 
 /// @title VMEXOracle
 /// @author VMEX, with inspiration from Aave
@@ -42,11 +43,13 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
 
     ILendingPoolAddressesProvider internal _addressProvider;
     IAssetMappings internal _assetMappings;
-    mapping(address => ChainlinkData) private _assetsSources;
     IPriceOracleGetter private _fallbackOracle;
+    IRocketPriceOracle public rETHOracle;
+    mapping(address => ChainlinkData) private _assetsSources;
     mapping(uint256 => AggregatorV3Interface) public sequencerUptimeFeeds;
 
     address public BASE_CURRENCY; //removed immutable keyword since
+    uint256 public BASE_CURRENCY_DECIMALS; //amount of decimals that the chainlink aggregator assumes for price feeds with this currency as the base
     uint256 public BASE_CURRENCY_UNIT;
     string public BASE_CURRENCY_STRING;
 
@@ -78,16 +81,19 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
     /**
      * @dev Sets the base currency that all other assets are priced based on. Can only be set once
      * @param baseCurrency The address of the base currency
-     * @param baseCurrencyUnit What price the base currency is. Usually this is just how many decimals the base currency has
+     * @param baseCurrencyDecimals amount of decimals that the chainlink aggregator assumes for price feeds with this currency as the base
+     * @param baseCurrencyUnit What price the base currency is. Usually this is just 10 ** how many decimals the base currency has
      * @param baseCurrencyString "ETH" or "USD" for purposes of checking correct denomination
      **/
     function setBaseCurrency(
         address baseCurrency,
+        uint256 baseCurrencyDecimals,
         uint256 baseCurrencyUnit,
         string calldata baseCurrencyString
     ) external onlyGlobalAdmin {
         require(BASE_CURRENCY == address(0), Errors.VO_BASE_CURRENCY_SET_ONLY_ONCE);
         BASE_CURRENCY = baseCurrency;
+        BASE_CURRENCY_DECIMALS = baseCurrencyDecimals;
         BASE_CURRENCY_UNIT = baseCurrencyUnit;
         BASE_CURRENCY_STRING = baseCurrencyString;
     }
@@ -102,8 +108,10 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
         ChainlinkData[] calldata sources
     ) external onlyGlobalAdmin {
         require(assets.length == sources.length, Errors.ARRAY_LENGTH_MISMATCH);
-        for (uint256 i = 0; i < assets.length; i++) {
+        uint256 assetsLength = assets.length;
+        for (uint256 i; i < assetsLength; ++i) {
             require(Helpers.compareSuffix(IChainlinkPriceFeed(sources[i].feed).description(), BASE_CURRENCY_STRING), Errors.VO_BAD_DENOMINATION);
+            require(IChainlinkPriceFeed(sources[i].feed).decimals() == BASE_CURRENCY_DECIMALS, Errors.VO_BAD_DECIMALS);
             _assetsSources[assets[i]] = sources[i];
             emit AssetSourceUpdated(assets[i], address(sources[i].feed));
         }
@@ -125,6 +133,12 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
         WETH = weth;
     }
 
+    function setRETHOracle(
+        address _rETHOracle
+    ) external onlyGlobalAdmin {
+        rETHOracle = IRocketPriceOracle(_rETHOracle);
+    }
+
     /**
      * @dev Sets the sequencerUptimeFeed. Callable only by the VMEX governance
      * @param sequencerUptimeFeed The address of the sequencerUptimeFeed
@@ -198,6 +212,9 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
         else if(tmp == DataTypes.ReserveAssetType.BEETHOVEN) {
             return getBeethovenPrice(asset);
         }
+        else if (tmp == DataTypes.ReserveAssetType.RETH) {
+            return getRETHPrice(asset);
+        }
         revert(Errors.VO_ORACLE_ADDRESS_NOT_FOUND);
     }
 
@@ -210,20 +227,23 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
         if (address(source) == address(0)) {
             return _fallbackOracle.getAssetPrice(asset);
         } else {
-            (
-                /* uint80 roundID */,
+            try IChainlinkPriceFeed(source).latestRoundData() returns (
+                uint80,
                 int256 price,
-                /*uint startedAt*/,
+                uint,
                 uint256 updatedAt,
-                /*uint80 answeredInRound*/
-            ) = IChainlinkPriceFeed(source).latestRoundData();
-            IChainlinkAggregator aggregator = IChainlinkAggregator(IChainlinkPriceFeed(source).aggregator());
-            if (price > int256(aggregator.minAnswer()) && 
-                price < int256(aggregator.maxAnswer()) && 
-                block.timestamp - updatedAt < _assetsSources[asset].heartbeat
+                uint80
             ) {
-                return uint256(price);
-            } else {
+                IChainlinkAggregator aggregator = IChainlinkAggregator(IChainlinkPriceFeed(source).aggregator());
+                if (price > int256(aggregator.minAnswer()) && 
+                    price < int256(aggregator.maxAnswer()) && 
+                    block.timestamp - updatedAt < _assetsSources[asset].heartbeat
+                ) {
+                    return uint256(price);
+                } else {
+                    return _fallbackOracle.getAssetPrice(asset);
+                }
+            } catch {
                 return _fallbackOracle.getAssetPrice(asset);
             }
         }
@@ -243,22 +263,26 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
             return _fallbackOracle.getAssetPrice(asset);
         }
 
-        uint256[] memory prices = new uint256[](c._poolSize);
+        uint256 poolSize = c._poolSize;
+
+        uint256[] memory prices = new uint256[](poolSize);
 
-        for (uint256 i = 0; i < c._poolSize; i++) {
+        for (uint256 i; i < poolSize;) {
             address underlying = ICurvePool(c._curvePool).coins(i);
             if(underlying == ETH_NATIVE){
                 underlying = WETH;
             }
             prices[i] = getAssetPrice(underlying); //handles case where underlying is curve too.
-            require(prices[i] > 0, Errors.VO_UNDERLYING_FAIL);
+            require(prices[i] != 0, Errors.VO_UNDERLYING_FAIL);
+
+            unchecked { ++i; }
         }
 
         if(assetType==DataTypes.ReserveAssetType.CURVE){
-            price = CurveOracle.get_price_v1(c._curvePool, prices, c._checkReentrancy);
+            price = CurveOracle.get_price_v1(c._curvePool, prices, c._reentrancyType);
         }
         else if(assetType==DataTypes.ReserveAssetType.CURVEV2){
-            price = CurveOracle.get_price_v2(c._curvePool, prices, c._checkReentrancy);
+            price = CurveOracle.get_price_v2(c._curvePool, prices, c._reentrancyType);
         }
         if(price == 0){
             return _fallbackOracle.getAssetPrice(asset);
@@ -273,27 +297,29 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
     function getVeloPrice(
         address asset
     ) internal returns (uint256 price) {
-        //assuming we only support velodrome pairs (exactly two assets)
         uint256[] memory prices = new uint256[](2);
 
         (address token0, address token1) = IVeloPair(asset).tokens();
+		(, , , , bool stable, , ) = IVeloPair(asset).metadata();  
 
         if(token0 == ETH_NATIVE){
             token0 = WETH;
         }
         prices[0] = getAssetPrice(token0); //handles case where underlying is curve too.
-        require(prices[0] > 0, Errors.VO_UNDERLYING_FAIL);
+        require(prices[0] != 0, Errors.VO_UNDERLYING_FAIL);
 
         if(token1 == ETH_NATIVE){
             token1 = WETH;
         }
         prices[1] = getAssetPrice(token1); //handles case where underlying is curve too.
-        require(prices[1] > 0, Errors.VO_UNDERLYING_FAIL);
+        require(prices[1] != 0, Errors.VO_UNDERLYING_FAIL);
+
+        price = VelodromeOracle.get_lp_price(asset, prices, BASE_CURRENCY_DECIMALS, stable); //has 18 decimals
 
-        price = VelodromeOracle.get_lp_price(asset, prices);
         if(price == 0){
             return _fallbackOracle.getAssetPrice(asset);
         }
+
         return price;
     }
 
@@ -314,7 +340,7 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
             ,
         ) = vault.getPoolTokens(poolId);
 
-        uint256 i = 0;
+        uint256 i;
 
         if(address(tokens[0]) == asset) { //boosted tokens first token is itself
             i = 1;
@@ -322,7 +348,7 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
 
         uint256[] memory prices = new uint256[](tokens.length-i);
 
-        uint256 j = 0;
+        uint256 j;
 
         while(i<tokens.length) {
             address token = address(tokens[i]);
@@ -330,7 +356,7 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
                 token = WETH;
             }
             prices[j] = getAssetPrice(token);
-            require(prices[j] > 0, Errors.VO_UNDERLYING_FAIL);
+            require(prices[j] != 0, Errors.VO_UNDERLYING_FAIL);
             i++;
             j++;
         }
@@ -379,6 +405,19 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
         return price;
 	}
 
+    /**
+     * @dev Gets an asset price for a rETH token
+     * @param asset The asset address
+     **/
+	function getRETHPrice(address asset) internal returns (uint256) {
+        uint256 underlyingPrice = getAssetPrice(WETH);
+        uint256 price = rETHOracle.rate()*underlyingPrice / 10**18;
+        if(price == 0){
+            return _fallbackOracle.getAssetPrice(asset);
+        }
+        return price;
+	}
+
     /// @notice Gets a list of prices from a list of assets addresses
     /// @param assets The list of assets addresses
     function getAssetsPrices(address[] calldata assets)
@@ -386,8 +425,10 @@ contract VMEXOracle is Initializable, IPriceOracleGetter {
         returns (uint256[] memory)
     {
         uint256[] memory prices = new uint256[](assets.length);
-        for (uint256 i = 0; i < assets.length; i++) {
+        for (uint256 i; i < assets.length;) {
             prices[i] = getAssetPrice(assets[i]);
+
+            unchecked { ++i; }
         }
         return prices;
     }
diff --git a/packages/contracts/contracts/protocol/oracles/VelodromeOracle.sol b/packages/contracts/contracts/protocol/oracles/VelodromeOracle.sol
index de2eed43c..a3f41dda2 100644
--- a/packages/contracts/contracts/protocol/oracles/VelodromeOracle.sol
+++ b/packages/contracts/contracts/protocol/oracles/VelodromeOracle.sol
@@ -2,39 +2,51 @@
 pragma solidity >=0.8.0;
 
 import {vMath} from "./libs/vMath.sol";
+import {FixedPointMathLib} from "../../dependencies/solmate/FixedPointMathLib.sol"; 
 import {IVeloPair} from "../../interfaces/IVeloPair.sol"; 
 import {IERC20} from "../../interfaces/IERC20WithPermit.sol"; 
 
-//some minor differences to univ2 pairs, but mostly the same
+
 library VelodromeOracle {
+	using FixedPointMathLib for *; 
+		
 	/**
      * @dev Gets the price of a velodrome lp token
      * @param lp_token The lp token address
-     * @param prices The prices of the underlying in the liquidity pool
+     * @param prices The prices of the underlying in the liquidity pool, there must be 18 decimals
+	 * @param stable is the pair stable or volatile
      **/
-	function get_lp_price(address lp_token, uint256[] memory prices) internal view returns(uint256) {
+	//@dev assumes oracles only pass in wad scaled decimals for ALL prices
+	function get_lp_price(address lp_token, uint256[] memory prices, uint256 priceDecimals, bool stable) internal view returns(uint256) {
 		IVeloPair token = IVeloPair(lp_token); 	
-		uint256 total_supply = IERC20(lp_token).totalSupply(); 
-		uint256 decimals = 10**token.decimals();
+		uint256 total_supply = IERC20(lp_token).totalSupply()* 1e18 / (10**IERC20(lp_token).decimals()); //force to be 18 decimals
 		(uint256 d0, uint256 d1, uint256 r0, uint256 r1, , ,) = token.metadata(); 
 
-		//converts to number of decimals that lp token has, regardless of original number of decimals that it has
-		//this is independent of chainlink oracle denomination in USD or ETH
-		uint256 reserve0 = (r0 * decimals) / d0; 
-		uint256 reserve1 = (r1 * decimals) / d1; 
-		
-		uint256 lp_price = calculate_lp_token_price(
-			total_supply, 
-			prices[0],
-			prices[1],
-			reserve0,
-			reserve1
-		); 
-
-		return lp_price; 
+		r0 *= 1e18 / d0; 
+		r1 *= 1e18 / d1; 
+	
+		if (stable) {
+			return calculate_stable_lp_token_price(
+				total_supply, 
+				prices[0],
+				prices[1],
+				r0,
+				r1,
+				priceDecimals
+			); 
+		} else {
+			return calculate_lp_token_price(
+				total_supply, 
+				prices[0],
+				prices[1],
+				r0,
+				r1
+			); 
+		}
 	}
 	
 	//where total supply is the total supply of the LP token
+	//formula solves xy = k curves only
 	//assumes that prices passed in are already properly WAD scaled
 	function calculate_lp_token_price(
 		uint256 total_supply,
@@ -43,13 +55,51 @@ library VelodromeOracle {
 		uint256 reserve0,
 		uint256 reserve1
 	) internal pure returns (uint256) {
-		uint256 a = vMath.nthroot(2, reserve0 * reserve1); //square root
-		uint256 b = vMath.nthroot(2, price0 * price1); //this is in decimals of chainlink oracle
-		//we want a and total supply to have same number of decimals so c has decimals of chainlink oracle
-		uint256 c = 2 * a * b / total_supply; 
+		uint256 a = vMath.nthroot(2, reserve0 * reserve1); //ends up with same number of decimals as reserve0 or reserve1 without loss of precision, which should be 18
+		uint256 b = vMath.nthroot(2, price0 * price1); //same number of dec as price0 or price1, should be chainlink agg (op: 8)
+		uint256 c = 2 * a * b / total_supply; //must end up as num decimals as prices since total supply is guaranteed to be 18
 
 		return c; 
 	}
+	
+	//solves for cases where curve is x^3 * y + y^3 * x = k  
+	//fair reserves math formula author: @ksyao2002
+	function calculate_stable_lp_token_price(
+		uint256 total_supply,
+		uint256 price0,
+		uint256 price1,
+		uint256 reserve0,
+		uint256 reserve1,
+		uint256 priceDecimals
+	) internal pure returns (uint256) {
+		uint256 k = getK(reserve0, reserve1); 
+		//fair_reserves = ( (k * (price0 ** 3) * (price1 ** 3)) )^(1/4) / ((price0 ** 2) + (price1 ** 2));  
+		price0 *= 1e18 / (10**priceDecimals); //convert to 18 dec
+		price1 *= 1e18 / (10**priceDecimals); 
+		uint256 a = FixedPointMathLib.rpow(price0, 3, 1e18); //keep same decimals as chainlink
+		uint256 b = FixedPointMathLib.rpow(price1, 3, 1e18);  
+		uint256 c = FixedPointMathLib.rpow(price0, 2, 1e18);  
+		uint256 d = FixedPointMathLib.rpow(price1, 2, 1e18);  
+
+		uint256 p0 =k * FixedPointMathLib.mulWadDown(a, b); //2*18 decimals
+		
+		uint256 fair = p0 / (c + d); // number of decimals is 18
+
+		// each sqrt divides the num decimals by 2. So need to replenish the decimals midway through with another 1e18
+		uint256 frth_fair = FixedPointMathLib.sqrt(FixedPointMathLib.sqrt(fair  * 1e18) * 1e18); // number of decimals is 18
+		
+		return 2 * ((frth_fair * (10**priceDecimals) ) / total_supply); // converts to chainlink decimals
+	}
+
+	function getK(uint256 x, uint256 y) internal pure returns (uint256) {
+		//x, n, scalar	
+		uint256 x_cubed = FixedPointMathLib.rpow(x, 3, 1e18); 
+		uint256 newX = FixedPointMathLib.mulWadDown(x_cubed, y); 
+		uint256 y_cubed = FixedPointMathLib.rpow(y, 3, 1e18); 
+		uint256 newY = FixedPointMathLib.mulWadDown(y_cubed, x); 
+	
+		return newX + newY;  //18 decimals
+	}
 
 }
 
diff --git a/packages/contracts/contracts/protocol/oracles/libs/vMath.sol b/packages/contracts/contracts/protocol/oracles/libs/vMath.sol
index 9645f38d9..591a49654 100644
--- a/packages/contracts/contracts/protocol/oracles/libs/vMath.sol
+++ b/packages/contracts/contracts/protocol/oracles/libs/vMath.sol
@@ -9,31 +9,39 @@ library vMath {
     uint256 internal constant WAD = 1e18; // The scalar of ETH and most ERC20s.
 	
 	function min(uint256[] memory array) internal pure returns(uint256) {
-		uint256 _min = array[0]; 
-		for (uint8 i = 1; i < array.length; i++) {
+		uint256 _min = array[0];
+		uint256 length = array.length;
+		for (uint256 i = 1; i < length;) {
 			if (_min > array[i]) {
 				_min = array[i]; 
-			}	
+			}
+
+			unchecked { ++i; }
 		}
 		return _min; 
 	}
 
-	function weightedAvg(uint256[] memory prices, uint256[] memory balances, uint8[] memory decimals) internal pure returns(uint256) {
-		uint256 cumSum = 0;
-		uint256 cumBalances = 0;
-
-		for(uint i = 0;i<prices.length;i++) {
+	function weightedAvg(uint256[] calldata prices, uint256[] calldata balances, uint8[] calldata decimals) internal pure returns(uint256) {
+		uint256 cumSum;
+		uint256 cumBalances;
+		uint256 length = prices.length;
+		for(uint256 i; i<length;) {
 			cumSum += prices[i]*balances[i]/10**decimals[i]; //18 decimals
 			cumBalances += balances[i]*1e18/10**decimals[i]; //18 decimals
+
+			unchecked { ++i; }
 		}
 
 		return cumSum * 1e18 / cumBalances; //18 decimals
 	}
 
 	function product(uint256[] memory nums) internal pure returns(uint256) {
-		uint256 _product = nums[0]; 
-		for (uint256 i = 1; i < nums.length; i++) {
+		uint256 _product = nums[0];
+		uint256 length = nums.length;
+		for (uint256 i = 1; i < length;) {
 			_product *= nums[i]; 
+
+			unchecked { ++i; }
 		}
 		return _product; 
 	}
diff --git a/packages/contracts/contracts/protocol/tokenization/AToken.sol b/packages/contracts/contracts/protocol/tokenization/AToken.sol
index 8b2facdde..710323dcb 100644
--- a/packages/contracts/contracts/protocol/tokenization/AToken.sol
+++ b/packages/contracts/contracts/protocol/tokenization/AToken.sol
@@ -9,10 +9,9 @@ import {IAToken} from "../../interfaces/IAToken.sol";
 import {WadRayMath} from "../libraries/math/WadRayMath.sol";
 import {Errors} from "../libraries/helpers/Errors.sol";
 import {Helpers} from "../libraries/helpers/Helpers.sol";
-import {VersionedInitializable} from "../../dependencies/aave-upgradeability/VersionedInitializable.sol";
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 import {IncentivizedERC20} from "./IncentivizedERC20.sol";
 import {IIncentivesController} from "../../interfaces/IIncentivesController.sol";
-import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
 import {PercentageMath} from "../libraries/math/PercentageMath.sol";
 import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
@@ -25,13 +24,12 @@ import "../../dependencies/openzeppelin/contracts/utils/Strings.sol";
  * @author Aave and VMEX
  */
 contract AToken is
-    VersionedInitializable,
+    Initializable,
     IncentivizedERC20("ATOKEN_IMPL", "ATOKEN_IMPL", 0),
     IAToken
 {
     using WadRayMath for uint256;
     using SafeERC20 for IERC20;
-    using SafeMath for uint256;
     using ReserveConfiguration for *;
     using PercentageMath for uint256;
     using Helpers for address;
@@ -46,8 +44,6 @@ contract AToken is
             "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
         );
 
-    uint256 public constant ATOKEN_REVISION = 0x1;
-
     /// @dev owner => next valid nonce to submit with permit()
     mapping(address => uint256) public _nonces;
 
@@ -77,14 +73,10 @@ contract AToken is
         address incentivesController = address(_getIncentivesController());
         if (incentivesController != address(0) &&
             IERC20(_underlyingAsset).allowance(address(this), incentivesController) == 0) {
-                IERC20(_underlyingAsset).approve(incentivesController, type(uint).max);
+                IERC20(_underlyingAsset).safeIncreaseAllowance(incentivesController, type(uint).max);
         }
     }
 
-    function getRevision() internal pure virtual override returns (uint256) {
-        return ATOKEN_REVISION;
-    }
-
     function DOMAIN_SEPARATOR() public view returns (bytes32) {
         return keccak256(
                 abi.encode(
@@ -104,7 +96,7 @@ contract AToken is
      */
     function initialize(
         ILendingPool pool,
-        InitializeTreasuryVars memory vars
+        InitializeTreasuryVars calldata vars
     ) external override initializer {
         uint8 aTokenDecimals = IERC20Detailed(vars.underlyingAsset).decimals();
 
@@ -134,7 +126,9 @@ contract AToken is
         _underlyingAsset = vars.underlyingAsset;
         _tranche = vars.trancheId;
 
-        emit Initialized(
+        approveIncentivesController();
+
+        emit InitializedAToken(
             vars.underlyingAsset,
             vars.trancheId,
             address(pool),
@@ -181,8 +175,6 @@ contract AToken is
         uint256 amount,
         uint256 index
     ) external override onlyLendingPool returns (bool) {
-        approveIncentivesController();
-
         uint256 previousBalance = super.balanceOf(user);
         uint256 amountScaled = amount.rayDiv(index);
         require(amountScaled != 0, Errors.CT_INVALID_MINT_AMOUNT);
@@ -205,8 +197,6 @@ contract AToken is
         override
         onlyLendingPool
     {
-        approveIncentivesController();
-
         if (amount == 0) {
             return;
         }
@@ -234,8 +224,6 @@ contract AToken is
         override
         onlyLendingPool
     {
-        approveIncentivesController();
-
         if (amount == 0) {
             return;
         }
@@ -462,7 +450,7 @@ contract AToken is
             )
         );
         require(owner == ecrecover(digest, v, r, s), "INVALID_SIGNATURE");
-        _nonces[owner] = currentValidNonce.add(1);
+        _nonces[owner] = currentValidNonce + 1;
         _approve(owner, spender, value);
     }
 
diff --git a/packages/contracts/contracts/protocol/tokenization/IncentivizedERC20.sol b/packages/contracts/contracts/protocol/tokenization/IncentivizedERC20.sol
index b1e8bb46b..0d9430ea8 100644
--- a/packages/contracts/contracts/protocol/tokenization/IncentivizedERC20.sol
+++ b/packages/contracts/contracts/protocol/tokenization/IncentivizedERC20.sol
@@ -6,7 +6,6 @@ import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
 import {
     IERC20Detailed
 } from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
-import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
 import {
     IIncentivesController
 } from "../../interfaces/IIncentivesController.sol";
@@ -18,8 +17,6 @@ import {DistributionTypes} from '../libraries/types/DistributionTypes.sol';
  * @author Aave, inspired by the Openzeppelin ERC20 implementation
  **/
 abstract contract IncentivizedERC20 is Context, IERC20, IERC20Detailed {
-    using SafeMath for uint256;
-
     mapping(address => uint256) internal _balances;
 
     mapping(address => mapping(address => uint256)) private _allowances;
@@ -153,10 +150,7 @@ abstract contract IncentivizedERC20 is Context, IERC20, IERC20Detailed {
         _approve(
             sender,
             _msgSender(),
-            _allowances[sender][_msgSender()].sub(
-                amount,
-                "ERC20: transfer amount exceeds allowance"
-            )
+            _allowances[sender][_msgSender()] - amount
         );
         emit Transfer(sender, recipient, amount);
         return true;
@@ -176,7 +170,7 @@ abstract contract IncentivizedERC20 is Context, IERC20, IERC20Detailed {
         _approve(
             _msgSender(),
             spender,
-            _allowances[_msgSender()][spender].add(addedValue)
+            _allowances[_msgSender()][spender] + addedValue
         );
         return true;
     }
@@ -195,10 +189,7 @@ abstract contract IncentivizedERC20 is Context, IERC20, IERC20Detailed {
         _approve(
             _msgSender(),
             spender,
-            _allowances[_msgSender()][spender].sub(
-                subtractedValue,
-                "ERC20: decreased allowance below zero"
-            )
+            _allowances[_msgSender()][spender] - subtractedValue
         );
         return true;
     }
@@ -214,12 +205,9 @@ abstract contract IncentivizedERC20 is Context, IERC20, IERC20Detailed {
         _beforeTokenTransfer(sender, recipient, amount);
 
         uint256 oldSenderBalance = _balances[sender];
-        _balances[sender] = oldSenderBalance.sub(
-            amount,
-            "ERC20: transfer amount exceeds balance"
-        );
+        _balances[sender] = oldSenderBalance - amount;
         uint256 oldRecipientBalance = _balances[recipient];
-        _balances[recipient] = _balances[recipient].add(amount);
+        _balances[recipient] = _balances[recipient] + amount;
 
         if (address(_getIncentivesController()) != address(0)) {
             uint256 currentTotalSupply = _totalSupply;
@@ -248,10 +236,10 @@ abstract contract IncentivizedERC20 is Context, IERC20, IERC20Detailed {
         _beforeTokenTransfer(address(0), account, amount);
 
         uint256 oldTotalSupply = _totalSupply;
-        _totalSupply = oldTotalSupply.add(amount);
+        _totalSupply = oldTotalSupply + amount;
 
         uint256 oldAccountBalance = _balances[account];
-        _balances[account] = oldAccountBalance.add(amount);
+        _balances[account] = oldAccountBalance + amount;
 
         if (address(_getIncentivesController()) != address(0)) {
             _getIncentivesController().handleAction(
@@ -270,13 +258,10 @@ abstract contract IncentivizedERC20 is Context, IERC20, IERC20Detailed {
         _beforeTokenTransfer(account, address(0), amount);
 
         uint256 oldTotalSupply = _totalSupply;
-        _totalSupply = oldTotalSupply.sub(amount);
+        _totalSupply = oldTotalSupply - amount;
 
         uint256 oldAccountBalance = _balances[account];
-        _balances[account] = oldAccountBalance.sub(
-            amount,
-            "ERC20: burn amount exceeds balance"
-        );
+        _balances[account] = oldAccountBalance - amount;
 
         if (address(_getIncentivesController()) != address(0)) {
             _getIncentivesController().handleAction(
diff --git a/packages/contracts/contracts/protocol/tokenization/VariableDebtToken.sol b/packages/contracts/contracts/protocol/tokenization/VariableDebtToken.sol
index e385580dc..d702886bb 100644
--- a/packages/contracts/contracts/protocol/tokenization/VariableDebtToken.sol
+++ b/packages/contracts/contracts/protocol/tokenization/VariableDebtToken.sol
@@ -21,8 +21,6 @@ contract VariableDebtToken is DebtTokenBase, IVariableDebtToken {
     using WadRayMath for uint256;
     using Helpers for address;
 
-    uint256 public constant DEBT_TOKEN_REVISION = 0x1;
-
     ILendingPool public _pool;
     address public _underlyingAsset;
     uint64 public _tranche;
@@ -66,7 +64,7 @@ contract VariableDebtToken is DebtTokenBase, IVariableDebtToken {
         _tranche = trancheId;
         _addressesProvider = addressesProvider;
 
-        emit Initialized(
+        emit InitializedDebtToken(
             underlyingAsset,
             trancheId,
             address(pool),
@@ -77,14 +75,6 @@ contract VariableDebtToken is DebtTokenBase, IVariableDebtToken {
         );
     }
 
-    /**
-     * @dev Gets the revision of the variable debt token implementation
-     * @return The debt token implementation revision
-     **/
-    function getRevision() internal pure virtual override returns (uint256) {
-        return DEBT_TOKEN_REVISION;
-    }
-
     /**
      * @dev Calculates the accumulated debt balance of the user
      * @return The debt balance of the user
diff --git a/packages/contracts/contracts/protocol/tokenization/base/DebtTokenBase.sol b/packages/contracts/contracts/protocol/tokenization/base/DebtTokenBase.sol
index 8615e67db..ca3779ec6 100644
--- a/packages/contracts/contracts/protocol/tokenization/base/DebtTokenBase.sol
+++ b/packages/contracts/contracts/protocol/tokenization/base/DebtTokenBase.sol
@@ -5,9 +5,7 @@ import {ILendingPool} from "../../../interfaces/ILendingPool.sol";
 import {
     ICreditDelegationToken
 } from "../../../interfaces/ICreditDelegationToken.sol";
-import {
-    VersionedInitializable
-} from "../../../dependencies/aave-upgradeability/VersionedInitializable.sol";
+import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
 import {IncentivizedERC20} from "../IncentivizedERC20.sol";
 import {Errors} from "../../libraries/helpers/Errors.sol";
 import {
@@ -22,7 +20,7 @@ import {
 
 abstract contract DebtTokenBase is
     IncentivizedERC20("DEBTTOKEN_IMPL", "DEBTTOKEN_IMPL", 0),
-    VersionedInitializable,
+    Initializable,
     ICreditDelegationToken
 {
     using SafeMath for uint256;
