// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IStakingRewards} from './IStakingRewards.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';

interface IExternalRewardsDistributor {
    /// EVENTS ///

    /// @notice Emitted when the root is updated.
    /// @param newRoot The new merkle's tree root.
    event RootUpdated(bytes32 newRoot);

    /// @notice Emitted when an account claims rewards.
    /// @param account The address of the claimer.
    /// @param amount The amount of rewards claimed.
    event RewardsClaimed(address account, uint256 amount);

    /// ERRORS ///

    /// @notice Thrown when the proof is invalid or expired.
    error ProofInvalidOrExpired();

    /// @notice Thrown when the claimer has already claimed the rewards.
    error AlreadyClaimed();

    event RewardConfigured(address indexed aToken, address indexed staking, uint256 initialAmount);
    event StakingRemoved(address indexed aToken);
    event UserDeposited(address indexed user, address indexed aToken, uint256 amount);
    event UserWithdraw(address indexed user, address indexed aToken, uint256 amount);
    event UserTransfer(address indexed user, address indexed aToken, uint256 amount, bool sender);

    function getStakingContract(address aToken) external view
    returns (address);
}
