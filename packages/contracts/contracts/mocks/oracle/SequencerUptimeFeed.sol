// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {AggregatorV3Interface} from "../../interfaces/AggregatorV3Interface.sol";

contract SequencerUptimeFeed is AggregatorV3Interface {
    int256 public isDown;
    uint256 public _startedAt;


  function decimals() external view override returns (uint8) {}

  function description() external view override returns (string memory) {}

  function version() external view override returns (uint256) {}

    function latestRoundData()
        public
        view
        override
        returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound)
    {
        answer = isDown;
        startedAt = _startedAt;
    }

    function getRoundData(uint80 _roundId)
    external
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    ) {}

    function setDown(int256 down) external {
        isDown = down;
        _startedAt = block.timestamp;
    }

    function setStartedAt(uint256 s) external {
        _startedAt = s;
    }
}
