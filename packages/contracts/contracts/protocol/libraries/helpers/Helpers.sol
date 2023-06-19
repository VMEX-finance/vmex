// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {DataTypes} from "../types/DataTypes.sol";
/**
 * @title Helpers library
 * @author Aave and VMEX
 */
library Helpers {
    /**
     * @dev Fetches the user current variable debt balance
     * @param user The user address
     * @param reserve The reserve data object
     * @return The variable debt balance
     **/
    function getUserCurrentDebt(
        address user,
        DataTypes.ReserveData storage reserve
    ) internal view returns (uint256) {
        return IERC20(reserve.variableDebtTokenAddress).balanceOf(user);
    }

    function getUserCurrentDebtMemory(
        address user,
        DataTypes.ReserveData memory reserve
    ) internal view returns (uint256) {
        return IERC20(reserve.variableDebtTokenAddress).balanceOf(user);
    }

    /**
     * @dev Gets a string attribute of a token (in our case, the name and symbol attribute), where it could 
     * not be implemented, or return bytes32, or return a string
     * @param token The token
     * @param functionToQuery The function to query the string of
     **/
    function getStringAttribute(address token, string memory functionToQuery)
        internal
        view
        returns (string memory queryResult)
    {
        bytes memory payload = abi.encodeWithSignature(functionToQuery);
        (bool success, bytes memory result) = token.staticcall(payload);
        if (success && result.length > 0) {
            if (result.length == 32) {
                // If the result is 32 bytes long, assume it's a bytes32 value
                queryResult = string(result);
            } else {
                // Otherwise, assume it's a string
                queryResult = abi.decode(result, (string));
            }
        }
    }

    /**
     * @dev Helper function to get symbol of erc20 token since some protocols return a bytes32, others do string, others don't even implement.
     * @param token The token
     **/
    function getSymbol(address token) internal view returns (string memory) {
        return getStringAttribute(token, "symbol()");
    }

    /**
     * @dev Helper function to get name of erc20 token since some protocols return a bytes32, others do string, others don't even implement.
     * @param token The token
     **/ 
    function getName(address token) internal view returns(string memory) {
        return getStringAttribute(token, "name()");
    }

    /**
     * @dev Helper function to compare suffix of str to a target
     * @param str String with suffix to compare
     * @param target target string
     **/ 
    function compareSuffix(string memory str, string memory target) internal pure returns(bool) {
        uint strLen = bytes(str).length;
        uint targetLen = bytes(target).length;

        if (strLen < targetLen) {
            return false;
        }

        uint suffixStart = strLen - targetLen;

        bytes memory suffixBytes = new bytes(targetLen);

        for (uint i = 0; i < targetLen; i++) {
            suffixBytes[i] = bytes(str)[suffixStart + i];
        }

        string memory suffix = string(suffixBytes);

        bool ret = (keccak256(bytes(suffix)) == keccak256(bytes(target)));

        return ret;
    }
}
