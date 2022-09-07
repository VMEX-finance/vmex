// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {DataTypes} from "../../protocol/libraries/types/DataTypes.sol";

contract TokenReserveData {
    constructor(address provider, address token) {
        DataTypes.ReserveData[3] memory returnData;

        bytes memory data = abi.encode(returnData);
        assembly {
            return(add(0x20, data), mload(data))
        }
    }

    function getType() public view returns (DataTypes.ReserveData[3] memory) {}
}
