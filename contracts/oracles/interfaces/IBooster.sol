// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0;

interface IBooster {
    struct PoolInfo {
        address lptoken;
        address token;
        address gauge;
        address crvRewards;
        address stash;
        bool shutdown;
    }

    function poolLength() external view returns (uint256);

    function poolInfo(uint256 n) external view returns (PoolInfo memory);
}
