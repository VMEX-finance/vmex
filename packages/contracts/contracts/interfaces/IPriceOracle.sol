// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IPriceOracleGetter} from "./IPriceOracleGetter.sol";
/************
@title IPriceOracle interface
@notice Interface for the Aave price oracle.*/
abstract contract IPriceOracle is IPriceOracleGetter {
    /***********
    @dev returns the asset price in ETH
     */
    // function getAssetPrice(address asset) external view override virtual returns (uint256);

    /***********
    @dev sets the asset price, in wei
     */
    function setAssetPrice(address asset, uint256 price) external virtual;
}
