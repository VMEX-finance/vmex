// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IYearnStakingRewards} from './IYearnStakingRewards.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';

interface IExternalRewardsDistributor {
    /// EVENTS ///

    /// @notice Emitted when the root is updated.
    /// @param newRoot The new merkle's tree root.
    event RootUpdated(bytes32 indexed newRoot);

    /// @notice Emitted when an account claims rewards.
    /// @param account The address of the claimer.
    /// @param amount The amount of rewards claimed.
    event RewardsClaimed(address indexed account, uint256 amount);

    event RewardConfigured(address indexed aToken, address indexed staking, uint256 initialAmount);
    event StakingRemoved(address indexed aToken);
    event UserDeposited(address indexed user, address indexed aToken, uint256 amount);
    event UserWithdraw(address indexed user, address indexed aToken, uint256 amount);
    event UserTransfer(address indexed user, address indexed aToken, uint256 amount, bool sender);

    event HarvestedReward(address indexed stakingContract);

    event RewardAdminChanged(address rewardAdmin);

    enum StakingType {
        NOT_SET, // unset value of 0 can be used to delineate which staking contracts have been set
        YEARN_OP,
        VELODROME_V2,
        AURA,
        CURVE
    }

    function getStakingContract(address aToken) external view
    returns (address);
}
