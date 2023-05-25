// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

contract MockAggregator {
    int256 private _latestAnswer;

    event AnswerUpdated(
        int256 indexed current,
        uint256 indexed roundId,
        uint256 timestamp
    );

    constructor(int256 _initialAnswer) public {
        _latestAnswer = _initialAnswer;
        emit AnswerUpdated(_initialAnswer, 0, block.timestamp);
    }

    function latestAnswer() external view returns (int256 _latestAnswer) {
        return _latestAnswer;
    }

    function latestRoundData(uint80, int256 answer, uint256, uint256, uint80) external view returns (int256) {
        answer = _latestAnswer;
    }

    function aggregator() external view returns(address){
        return address(this);
    }

    function minAnswer() external view returns(int192) {
        return 10000000000000;
    }

    function maxAnswer() external view returns(int192) {
        return 1000000000000000000;
    }
}
