// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IVirtualBalanceRewardPool {
    //balance
    function balanceOf(address _account) external view returns (uint256);

    function earned(address _account) external view returns (uint256);

    function periodFinish() external view returns (uint256);

    function rewardToken() external view returns (address);
}
