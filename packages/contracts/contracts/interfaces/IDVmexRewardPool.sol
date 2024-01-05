// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IDVmexRewardPool {
    function burn(uint256 _amount) external returns (bool);
}
