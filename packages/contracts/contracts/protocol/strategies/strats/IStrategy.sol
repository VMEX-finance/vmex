// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

interface IStrategy {
    function initialize(
        address _addressProvider,
        address _underlying,
        uint64 _tranche) external;
}