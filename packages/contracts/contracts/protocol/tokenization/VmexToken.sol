// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ERC20} from "../../dependencies/openzeppelin/contracts/ERC20.sol";
import {ERC20Permit} from "../../dependencies/openzeppelin/contracts/governance/ERC20Permit.sol";
import {ERC20Votes} from "../../dependencies/openzeppelin/contracts/governance/ERC20Votes.sol";

contract VmexToken is ERC20, ERC20Permit, ERC20Votes {

    constructor() ERC20("Vmex Token", "VMEX") ERC20Permit("Vmex Token")
    {
        _mint(msg.sender, 100000000e18); // 100 million Vmex
    }

    // The functions below are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}