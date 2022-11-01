// SPDX-License-Identifier: agpl-3.0
//not used yet
pragma solidity >=0.8.0;

import {ICurvePool} from "../../oracles/interfaces/ICurvePoolV1.sol";

/**
 * @title ERC20Mintable
 * @dev ERC20 minting logic
 */
contract CurvePoolMocked is ICurvePool {
    uint256 virtual_price;

    constructor(uint256 _virtual_price) {
        if (_virtual_price == 0) {
            _virtual_price = 1020000000000000000; //1.02 with 18 decimals
        }
        virtual_price = _virtual_price;
    }

    function get_virtual_price() external view override returns (uint256) {
        return virtual_price;
    }
}
