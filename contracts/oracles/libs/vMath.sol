pragma solidity >=0.8.0;

import {FixedPointMathLib} from "./FixedPointMathLib.sol";
import {IntegralMath} from "./IntegralMath.sol";

library vMath {
    uint256 internal constant WAD = 1e18; // The scalar of ETH and most ERC20s.

    function min(uint256[] calldata array) external pure returns (uint256) {
        uint256 min = array[0];
        for (uint8 i = 1; i < array.length; i++) {
            if (min > array[i]) {
                min = array[i];
            }
        }
        return min;
    }

    function product(uint256[] calldata nums) external pure returns (uint256) {
        uint256 product = nums[0];
        for (uint256 i = 1; i < nums.length; i++) {
            product *= nums[i];
        }
        return product;
    }

    //limited to curve pools only, either 2 or 3 assets (mostly 2)
    function geometric_mean(uint8 n, uint256 product)
        external
        pure
        returns (uint256)
    {
        if (n == 2) {
            return FixedPointMathLib.sqrt(product);
        } else {
            //n == 3
            return IntegralMath.floorCbrt(product);
        }
    }
}
