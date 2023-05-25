// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";

/**
 * @title IReserveInterestRateStrategyInterface interface
 * @dev Interface for the calculation of the interest rates
 * @author Aave
 */
interface IReserveInterestRateStrategy {
    function baseVariableBorrowRate() external view returns (uint256);

    function getMaxVariableBorrowRate() external view returns (uint256);

    function calculateInterestRates(
        DataTypes.calculateInterestRatesVars memory calvars
    )
        external
        view
        returns (
            uint256 liquidityRate,
            uint256 variableBorrowRate
        );
}
