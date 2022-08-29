// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol";
import {Constants} from "./libraries/Constants.sol";

contract UserTokenBalance {
    constructor(address user) {
        address[20] memory _tokens = Constants.token();
        string[20] memory _names = Constants.tokenNames();
        uint256[] memory data = new uint256[](_tokens.length);
        for (uint256 i; i < _tokens.length; i++) {
            uint256 balance = IERC20(_tokens[i]).balanceOf(user);
            data[i] = balance;
        }

        bytes memory returnData = abi.encode(data, _names);
        assembly {
            return(add(0x20, returnData), mload(returnData))
        }
    }
}
