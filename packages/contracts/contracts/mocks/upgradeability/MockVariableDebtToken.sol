// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {
    VariableDebtToken
} from "../../protocol/tokenization/VariableDebtToken.sol";

contract MockVariableDebtToken is VariableDebtToken {
    function getRevision() internal pure override returns (uint256) {
        return 0x2;
    }

    function newFunction() external pure returns (uint256) {
        return 2;
    }
}
