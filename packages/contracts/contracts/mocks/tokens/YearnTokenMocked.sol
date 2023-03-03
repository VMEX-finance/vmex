// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {MintableERC20} from "./MintableERC20.sol";

/**
 * @title ERC20Mintable
 * @dev ERC20 minting logic
 */
contract YearnTokenMocked is MintableERC20 {
    address public token;
    uint256 internal _pricePerShare;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        address underlyingToken
    ) public MintableERC20(name, symbol, decimals) {
        token = underlyingToken;
        _pricePerShare = 10**18;
    }

    function pricePerShare() external view returns(uint256){
        return _pricePerShare;
    }

    function setPricePerShare(uint256 price) external{
        _pricePerShare = price;
    }
}
