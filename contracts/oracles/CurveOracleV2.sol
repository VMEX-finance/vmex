// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import {ICurvePool} from "./interfaces/ICurvePoolV1.sol";
import {ICurveOracle} from "./interfaces/ICurveOracle.sol";
import {vMath} from "./libs/vMath.sol";
import {FixedPointMathLib} from "./libs/FixedPointMathLib.sol";

contract CurveOracleV2 is ICurveOracle {
    function get_price(address curve_pool, uint256[] memory prices)
        external
        view
        override
        returns (uint256)
    {
        uint256 virtual_price = ICurvePool(curve_pool).get_virtual_price();

        uint256 lp_price =
            calculate_v2_token_price(
                uint8(prices.length),
                virtual_price,
                prices
            );

        return lp_price;
    }

    //returns n_token * vp * (p1 * p2 * p3) ^1/n
    //n should only ever be 2, 3, or 4
    //returns the lp_price scaled by 1e36, so scale down by 1e36
    function calculate_v2_token_price(
        uint8 n,
        uint256 virtual_price,
        uint256[] memory prices
    ) internal pure returns (uint256) {
        uint256 product = vMath.product(prices);
        uint256 geo_mean = vMath.geometric_mean(n, product);
        return n * virtual_price * geo_mean;
    }
}
