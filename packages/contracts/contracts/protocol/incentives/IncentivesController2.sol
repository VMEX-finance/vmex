// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {DistributionTypes} from "../libraries/types/DistributionTypes.sol";
import {IDistributionManager} from "../../interfaces/IDistributionManager.sol";
import {IAToken} from "../../interfaces/IAToken.sol";
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IIncentivesController} from "../../interfaces/IIncentivesController2.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {DistributionManager} from "./DistributionManager.sol";
import {ExternalRewardDistributor} from "./ExternalRewardDistributor.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {IVeVmex} from "../../interfaces/IVeVmex.sol";

/**
 * @title IncentivesController
 * @notice Distributor contract for rewards to the VMEX protocol
 * @author Aave and VMEX
 *
 */
contract IncentivesController is
    IIncentivesController,
    Initializable,
    DistributionManager,
    ExternalRewardDistributor
{
    using SafeERC20 for IERC20;

    address public REWARDS_VAULT;

    address public VE_VMEX;
    address public PENALTY_RECIEVER;

    uint256 public constant BOOSTING_FACTOR = 1;
    uint256 public constant BOOST_DENOMINATOR = 10;

    /**
     * @dev Called by the proxy contract
     *
     */
    function initialize(address _addressesProvider) public initializer {
        ExternalRewardDistributor.__ExternalRewardDistributor_init(_addressesProvider);
        DistributionManager.__DistributionManager_init(
            ILendingPoolAddressesProvider(_addressesProvider).getGlobalAdmin()
        );
    }

    function setRewardsVault(address rewardsVault) external onlyGlobalAdmin {
        REWARDS_VAULT = rewardsVault;
    }

    function setVeVmex(address veVmex) external onlyGlobalAdmin {
        VE_VMEX = veVmex;
    }

    function setPenaltyReciever(address penaltyReciever) external onlyGlobalAdmin {
        PENALTY_RECIEVER = penaltyReciever;
    }

    /**
     * @dev Called by the corresponding asset on any update that affects the rewards distribution
     * @param user The address of the user
     * @param totalSupply The (old) total supply of the asset in the lending pool
     * @param oldBalance The old balance of the user of the asset in the lending pool
     * @param newBalance The new balance of the user of the asset in the lending pool
     * @param action Deposit, withdrawal, or transfer
     *
     */
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

    function _getUserState(address[] calldata assets, address user)
        internal
        view
        returns (DistributionTypes.UserAssetState[] memory)
    {
        DistributionTypes.UserAssetState[] memory userState = new DistributionTypes.UserAssetState[](assets.length);

        uint256 length = assets.length;
        for (uint256 i; i < length;) {
            userState[i].asset = assets[i];
            (userState[i].userBalance, userState[i].totalSupply) =
                IAToken(assets[i]).getScaledUserBalanceAndSupply(user);

            unchecked {
                ++i;
            }
        }

        return userState;
    }

    /**
     * @dev Returns the total of rewards of an user, already accrued + not yet accrued
     * @param assets List of incentivized assets to check the rewards for
     * @param user The address of the user
     *
     */
    function getPendingRewards(address[] calldata assets, address user)
        external
        view
        override
        returns (address[] memory, uint256[] memory)
    {
        address[] memory rewards = _allRewards;
        uint256 rewardsLength = rewards.length;
        uint256[] memory amounts = new uint256[](rewardsLength);
        DistributionTypes.UserAssetState[] memory balanceData = _getUserState(assets, user);

        // cant cache because of the stack too deep
        for (uint256 i; i < assets.length;) {
            address asset = assets[i];

            for (uint256 j; j < rewardsLength;) {
                DistributionTypes.Reward storage reward = _incentivizedAssets[asset].rewardData[_allRewards[j]];
                amounts[j] += reward.users[user].accrued
                    + _getReward(
                        balanceData[i].userBalance,
                        _getAssetIndex(reward, balanceData[i].totalSupply, _incentivizedAssets[asset].decimals),
                        reward.users[user].index,
                        _incentivizedAssets[asset].decimals
                    );
                unchecked {
                    ++j;
                }
            }
            unchecked {
                ++i;
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
     *
     */
    function claimAllRewards(address[] calldata incentivizedAssets, address to)
        external
        override
        returns (address[] memory, uint256[] memory)
    {
        address[] memory rewards = _allRewards;
        uint256[] memory amounts = new uint256[](rewards.length);
        uint256[] memory penaltyAmounts = new uint256[](rewards.length);

        DistributionTypes.UserAssetState[] memory userState = _getUserState(incentivizedAssets, msg.sender);
        _batchUpdate(msg.sender, userState);

        uint256 veTotalSupply = IVeVmex(VE_VMEX).totalSupply();
        uint256 veUserBalance = IVeVmex(VE_VMEX).balanceOf(msg.sender);

        uint256 aTokenTotalSupply;
        uint256 boostedAmount;
        for (uint256 i; i < incentivizedAssets.length;) {
            address asset = incentivizedAssets[i];
            aTokenTotalSupply = IERC20(asset).totalSupply();
            for (uint256 j; j < rewards.length;) {
                uint256 amount = _incentivizedAssets[asset].rewardData[rewards[j]].users[msg.sender].accrued;
                boostedAmount = _calculateBoostedClaimable(veTotalSupply, aTokenTotalSupply, veUserBalance, amount);
                if (amount != 0) {
                    amounts[j] += boostedAmount;
                    _incentivizedAssets[asset].rewardData[rewards[j]].users[msg.sender].accrued = 0;
                    if (boostedAmount != amount) {
                        unchecked {
                            penaltyAmounts[j] = amount - boostedAmount;
                        }
                    }
                }

                unchecked {
                    ++j;
                }
            }

            unchecked {
                ++i;
            }
        }

        uint256 amountsLength = amounts.length;
        for (uint256 i; i < amountsLength;) {
            if (amounts[i] != 0) {
                IERC20(rewards[i]).safeTransferFrom(REWARDS_VAULT, to, amounts[i]);
                IERC20(rewards[i]).safeTransferFrom(REWARDS_VAULT, to, penaltyAmounts[i]);
                emit RewardClaimed(msg.sender, rewards[i], to, amounts[i]);
            }

            unchecked {
                ++i;
            }
        }

        return (rewards, amounts);
    }

    function _calculateBoostedClaimable(
        uint256 veTotalSupply,
        uint256 aTokenTotalSupply,
        uint256 veUserBalance,
        uint256 claimable
    ) internal pure returns (uint256) {
        return veTotalSupply == 0
            ? claimable
            : min(
                (
                    claimable * BOOSTING_FACTOR
                        + ((aTokenTotalSupply * veUserBalance) / veTotalSupply) * (BOOST_DENOMINATOR - BOOSTING_FACTOR)
                ) / BOOST_DENOMINATOR,
                claimable
            );
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function getAssetRewardsNum(address asset) external view returns (uint256) {
        return _incentivizedAssets[asset].numRewards;
    }

    function getAssetRewardAddress(address asset, uint256 index) external view returns (address) {
        return _incentivizedAssets[asset].rewardList[index];
    }

    function getAssetReward(address asset, address rewardAddress)
        external
        view
        returns (uint128, uint128, uint256, uint128)
    {
        DistributionTypes.Reward storage reward = _incentivizedAssets[asset].rewardData[rewardAddress];

        return (reward.emissionPerSecond, reward.lastUpdateTimestamp, reward.index, reward.endTimestamp);
    }
}
