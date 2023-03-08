// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

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

    // function getSubTokens() external view returns (address[] memory) {
    // TODO: implement mock for when multiple subtokens. Maybe we need to create diff mock contract
    // to call it from the migration for this case??
    // }
}
