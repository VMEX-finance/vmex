// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

interface ICurveOracle {
    function get_price(address curve_pool, uint256[] memory prices)
        external
        view
        returns (uint256);
}
