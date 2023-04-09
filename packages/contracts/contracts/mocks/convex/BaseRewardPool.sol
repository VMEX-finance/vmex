// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract BaseRewardPool {
    address[] public extraRewards;

    function balanceOf(address account) public view returns (uint256) {
        return 0;
    }

    function extraRewardsLength() external view returns (uint256) {
        return 0;
    }

    function earned(address account) public view returns (uint256) {
        return 0;
    }

    function stake(uint256 _amount) public returns (bool) {
        return true;
    }

    function stakeAll() external returns (bool) {
        return true;
    }

    function withdraw(uint256 amount, bool claim) public returns (bool) {
        return true;
    }

    function withdrawAll(bool claim) external {
        withdraw(0, claim);
    }

    function withdrawAndUnwrap(uint256 amount, bool claim)
        public
        returns (bool)
    {
        return true;
    }

    function withdrawAllAndUnwrap(bool claim) external {
        withdrawAndUnwrap(0, claim);
    }

    function getReward(address _account, bool _claimExtras)
        public
        returns (bool)
    {
        return true;
    }

    function getReward() external returns (bool) {
        return true;
    }
}
