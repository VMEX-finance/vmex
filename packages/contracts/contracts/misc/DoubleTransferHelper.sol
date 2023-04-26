// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import "../dependencies/openzeppelin/contracts/IERC20.sol";
import "../dependencies/openzeppelin/contracts/governance/ERC20Votes.sol";

contract DoubleTransferHelper {

    ERC20Votes public immutable VMEX;

    constructor(address vmex) {
        VMEX = ERC20Votes(vmex);
    }

    function doubleSend(address to, uint256 amount1, uint256 amount2) external {
        VMEX.transfer(to, amount1);
        VMEX.transfer(to, amount2);
    }

    function enableVoting() external {
        VMEX.delegate(address(this));
    }
}