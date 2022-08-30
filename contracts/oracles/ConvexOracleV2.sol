// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

//import {IBooster} from "../utils/interfaces/IBooster.sol";
import {CurveOracleV2} from "./CurveOracleV2.sol";
import {FixedPointMathLib} from "./libs/FixedPointMathLib.sol";
import {IERC20} from "./interfaces/IERC20.sol";

//assuming we can price Convex pools like UniV2 pools more than like Curve pools
contract ConvexOracleV2 {
    //address private constant BOOSTER = 0xF403C135812408BFbE8713b5A23a04b3D48AAE31; //convex deposit contract
    CurveOracleV2 private curve_oracle;

    //get total underlying in USD and divide by num of tokens
    //use external script to get pid by curve lp token
    constructor(CurveOracleV2 _curve_oracle) {
        curve_oracle = _curve_oracle;
    }

    //get curve lp tokens price, get convex lp token "depositToken", divide
    function get_convex_price(
        address curve_pool,
        uint256[] memory prices,
        uint16 pid,
        address convex_lp,
        address curve_lp
    ) external view returns (uint256) {
        uint256 curve_lp_price = curve_oracle.get_price(curve_pool, prices); //returns 1e36 scaled uint
        //	uint256 curve_supply = IERC20(curve_lp).totalSupply();
        //	uint256 convex_supply = IERC20(convex_lp).totalSupply();

        //	uint256 convex_price = calculate_convex_price(
        //		curve_lp_price,
        //		curve_supply,
        //		convex_supply
        //	);

        return curve_lp_price;
    }

    //not sure how vulnerable this is, check back later
    function calculate_convex_price(
        uint256 curve_lp_price,
        uint256 curve_supply,
        uint256 convex_supply
    ) internal pure returns (uint256) {
        return (curve_lp_price * curve_supply) / convex_supply;
    }
}