// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {ILendingPool} from "../interfaces/ILendingPool.sol";

contract TrancheReserveData {
    constructor(address pool, uint64 trancheId) {
        // ILendingPool(pool).getReserveData(asset, trancheId)
        address[] memory list = ILendingPool(pool).getReservesList(trancheId);
        bytes memory returnData = abi.encode(list);
        assembly {
            return(add(0x20, returnData), mload(returnData))
        }
    }
}
