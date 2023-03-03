// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

interface IERC20DetailedBytes {
    function symbol() external view returns (bytes32);
    function name() external view returns (bytes32);
}
