// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {IERC20Detailed} from "../../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {IERC20DetailedBytes} from "../../../dependencies/openzeppelin/contracts/IERC20DetailedBytes.sol";
import "hardhat/console.sol";
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

    // since some protocols return a bytes32, others do string, others don't even implement.
    // this was written by chat gpt
    function getSymbol(address token) internal view returns (string memory symbol) {
        bytes memory payload = abi.encodeWithSignature("symbol()");
        (bool success, bytes memory result) = token.staticcall(payload);
        if (success && result.length > 0) {
            if (result.length == 32) {
                // If the result is 32 bytes long, assume it's a bytes32 value
                symbol = string(abi.encodePacked(bytes32ToBytes(result)));
            } else {
                // Otherwise, assume it's a string
                symbol = abi.decode(result, (string));
            }
        }
        else {
            symbol = "";
        }
        console.log("symbol set as: ", symbol);
    }

    // this was written by chat gpt
    function bytes32ToBytes(bytes memory data) internal pure returns (bytes memory result) {
        assembly {
            result := mload(0x40)
            mstore(result, 0x20)
            mstore(add(result, 0x20), mload(add(data, 0x20)))
        }
    }

    // since some protocols return a bytes32, others do string, others don't even implement.
    function getName(address token) internal view returns(string memory name) {
        bytes memory payload = abi.encodeWithSignature("name()");
        (bool success, bytes memory result) = token.staticcall(payload);
        if (success && result.length > 0) {
            if (result.length == 32) {
                // If the result is 32 bytes long, assume it's a bytes32 value
                name = string(abi.encodePacked(bytes32ToBytes(result)));
            } else {
                // Otherwise, assume it's a string
                name = abi.decode(result, (string));
            }
        }
        else {
            name = "";
        }
        console.log("name set as: ", name);
    }
}
