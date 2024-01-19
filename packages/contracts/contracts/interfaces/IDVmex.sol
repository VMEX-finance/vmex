// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.19;

import { IERC20 } from "../dependencies/openzeppelin/contracts/IERC20.sol";

interface IDVmex is IERC20 {
    function mint(address _to, uint256 _amount) external;

    function burn(uint256 _amount) external;

    function burn(address _owner, uint256 _amount) external;
}