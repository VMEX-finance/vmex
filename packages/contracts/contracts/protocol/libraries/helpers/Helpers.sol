// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {DataTypes} from "../types/DataTypes.sol";
/**
 * @title Helpers library
 * @author Aave
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

    // TODO: review assembly
    function bytes32ToBytes(bytes memory data) internal pure returns (bytes memory result) {
        assembly {
            result := mload(0x40)
            mstore(result, 0x20)
            mstore(add(result, 0x20), mload(add(data, 0x20)))
        }
    }

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
                queryResult = string(abi.encodePacked(bytes32ToBytes(result)));
            } else {
                // Otherwise, assume it's a string
                queryResult = abi.decode(result, (string));
            }
        }
        else {
            queryResult = "";
        }
    }

    // since some protocols return a bytes32, others do string, others don't even implement.
    function getSymbol(address token) internal view returns (string memory) {
        return getStringAttribute(token, "symbol()");
    }

    // since some protocols return a bytes32, others do string, others don't even implement.
    function getName(address token) internal view returns(string memory) {
        return getStringAttribute(token, "name()");
    }
}
