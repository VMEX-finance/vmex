// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {
    VariableDebtToken
} from "../../protocol/tokenization/VariableDebtToken.sol";

contract MockVariableDebtToken is VariableDebtToken {
    function newFunction() external pure returns (uint256) {
        return 2;
    }
}
