// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol";

contract UserTokenBalance {
    constructor(address user, address[] memory _tokens) {
        uint256[] memory data = new uint256[](_tokens.length);
        for (uint256 i; i < _tokens.length; i++) {
            uint256 balance = IERC20(_tokens[i]).balanceOf(user);
            data[i] = balance;
        }

        bytes memory returnData = abi.encode(data);
        assembly {
            return(add(0x20, returnData), mload(returnData))
        }
    }
}
