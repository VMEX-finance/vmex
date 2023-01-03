// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {CrvLpStrategy} from "../../protocol/strategies/strats/CrvLpStrategy.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {
    IAaveIncentivesController
} from "../../interfaces/IAaveIncentivesController.sol";

contract MockStrategy is CrvLpStrategy {
    function baseStrategyVersion()
        external
        pure
        override
        returns (string memory)
    {
        return "2.0";
    }
}
