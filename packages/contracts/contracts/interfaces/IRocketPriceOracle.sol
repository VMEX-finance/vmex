// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";

/**
 * @title IRocketPriceOracle interface
 * @dev Interface for getting the rate for rocket eth
 * @author Rocket Pool
 */
interface IRocketPriceOracle {
    function rate() external view returns (uint256);
}
