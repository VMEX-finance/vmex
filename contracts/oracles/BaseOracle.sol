// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {
    IUniswapV3Pool
} from "./uniswapv08/v3-core/interfaces/IUniswapV3Pool.sol";
import {OracleLibrary} from "./uniswapv08/v3-periphery/OracleLibrary.sol";

//this contract needs to calculate a price for a given LP token and return a 3 min TWAP
contract BaseOracle {
    address private pool;
    uint8 private token_to_price;

    uint32 public constant WINDOW_SIZE = 3 minutes;
    uint128 private constant WAD = 1e18;
    uint128 private immutable scale_factor;

    //set the pool for each oracle here to have a feed
    //@param pool, the address of the univ3 pool
    //@param token_to_price, specify which coin is denominated in what order ie. ETH/DAI price would be 1, token0 priced in terms of token1
    constructor(
        address _pool,
        uint8 _token_to_price,
        int256 decimals
    ) {
        require(_token_to_price == 0 || _token_to_price == 1, "must be 0 or 1");
        pool = _pool;
        token_to_price = _token_to_price;

        //if returns are greater than 18 use POSTIVE if less use NEGATIVE
        //i.e. ETH returns a 6 digit decimal from uni pools, so we scale by -12 to get a WAD fixed number
        scale_factor = uint128(
            decimals >= 0
                ? WAD / 10**uint256(decimals)
                : WAD * 10**uint256(-decimals)
        );
    }

    //returns the latest price in a WAD fixed number
    function latest_pool_price() public view virtual returns (uint256) {
        int24 twap_tick = OracleLibrary.consult(pool, WINDOW_SIZE);
        address token0 = IUniswapV3Pool(pool).token0();
        address token1 = IUniswapV3Pool(pool).token1();

        uint256 price;
        if (token_to_price == 1) {
            price = OracleLibrary.getQuoteAtTick(
                twap_tick,
                scale_factor,
                token1, //price token 1 in terms of token0  eg. ETH/DAI or DAI/USDC = 1 eth = 1200 dai
                token0
            );
        } else {
            price = OracleLibrary.getQuoteAtTick(
                twap_tick,
                scale_factor,
                token0, //price token 0 in terms of token1 eg. DAI/ETH = 1 dai = 0.00007 eth
                token1
            );
        }
        return price;
    }
}
