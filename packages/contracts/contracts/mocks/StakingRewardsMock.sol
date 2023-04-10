// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IStakingRewards} from '../interfaces/IStakingRewards.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';
import {SafeERC20} from '../dependencies/openzeppelin/contracts/SafeERC20.sol';
import {SafeMath} from '../dependencies/openzeppelin/contracts/SafeERC20.sol';

contract StakingRewardsMock is IStakingRewards {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    /// @notice The address of our rewards token.
    IERC20 public rewardsToken;

    /// @notice The address of our staking token.
    IERC20 public stakingToken;

    /// @notice The end (timestamp) of our current or most recent reward period.
    uint256 public periodFinish = 0;

    /// @notice The distribution rate of rewardsToken per second.
    uint256 public rewardRate = 0;

    /// @notice The duration of our rewards distribution for staking, default is 7 days.
    uint256 public rewardsDuration = 7 days;

    /// @notice The last time rewards were updated, triggered by updateReward() or notifyRewardAmount().
    /// @dev Will be the timestamp of the update or the end of the period, whichever is earlier.
    uint256 public lastUpdateTime;

    /// @notice The most recent stored amount for rewardPerToken().
    /// @dev Updated every time anyone calls the updateReward() modifier.
    uint256 public rewardPerTokenStored;

    /// @notice The amount of rewards allocated to a user per whole token staked.
    /// @dev Note that this is not the same as amount of rewards claimed.
    mapping(address => uint256) public userRewardPerTokenPaid;

    /// @notice The amount of unclaimed rewards an account is owed.
    mapping(address => uint256) public rewards;

    // private vars, use view functions to see these
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _rewardsToken,
        address _stakingToken
    ) public {
        rewardsToken = IERC20(_rewardsToken);
        stakingToken = IERC20(_stakingToken);
    }

    /* ========== VIEWS ========== */

    /// @notice The total tokens staked in this contract.
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /// @notice The balance a given user has staked.
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /// @notice Either the current timestamp or end of the most recent period.
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    /// @notice Reward paid out per whole token.
    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }

        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(_totalSupply)
            );
    }

    /// @notice Amount of reward token pending claim by an account.
    function earned(address account) public view returns (uint256) {
        return
            _balances[account]
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    /// @notice Reward tokens emitted over the entire rewardsDuration.
    function getRewardForDuration() external view returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Deposit vault tokens to the staking pool.
    /// @dev Can't stake zero.
    /// @param amount Amount of vault tokens to deposit.
    function stake(uint256 amount)
        external
        updateReward(msg.sender)
    {
        require(amount > 0, "Cannot stake 0");
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function increaseTotalSupply(uint256 amount) external updateReward(msg.sender) {
        _totalSupply = _totalSupply.add(amount);
    }

    /// @notice Withdraw vault tokens from the staking pool.
    /// @dev Can't withdraw zero. If trying to claim, call getReward() instead.
    /// @param amount Amount of vault tokens to withdraw.
    function withdraw(uint256 amount)
        public
        updateReward(msg.sender)
    {
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim any earned reward tokens.
    /// @dev Can claim rewards even if no tokens still staked.
    function getReward() public updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /// @notice Unstake all of the sender's tokens and claim any outstanding rewards.
    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /// @notice Notify staking contract that it has more reward to account for.
    /// @dev Reward tokens must be sent to contract before notifying. May only be called
    ///  by rewards distribution role.
    /// @param reward Amount of reward tokens to add.
    function notifyRewardAmount(uint256 reward)
        external
        updateReward(address(0))
    {
        if (block.timestamp >= periodFinish) {
            rewardRate = reward.div(rewardsDuration);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(rewardsDuration);
        }

        // Ensure the provided reward amount is not more than the balance in the contract.
        // This keeps the reward rate in the right range, preventing overflows due to
        // very high values of rewardRate in the earned and rewardsPerToken functions;
        // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
        uint256 balance = rewardsToken.balanceOf(address(this));
        require(
            rewardRate <= balance.div(rewardsDuration),
            "Provided reward too high"
        );

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardAdded(reward);
    }

    /// @notice Set the duration of our rewards period.
    /// @dev May only be called by owner, and must be done after most recent period ends.
    /// @param _rewardsDuration New length of period in seconds.
    function setRewardsDuration(uint256 _rewardsDuration) external {
        require(
            block.timestamp > periodFinish,
            "Previous rewards period must be complete before changing the duration for the new period"
        );
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event StakedFor(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event ZapContractUpdated(address _zapContract);
    event Recovered(address token, uint256 amount);
}