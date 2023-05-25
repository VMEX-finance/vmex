// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

interface IChainlinkAggregator {
    function minAnswer() external view returns(int192);
    function maxAnswer() external view returns(int192);
}
