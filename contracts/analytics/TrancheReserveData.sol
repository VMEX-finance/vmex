// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {ILendingPool} from "../interfaces/ILendingPool.sol";
import {Constants} from "./libraries/Constants.sol";
import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";

struct ReserveConfigurationMap {
    uint256 data;
}

contract TrancheReserveData {
    constructor(address pool, uint8 tranche) {
        address[20] memory tokens = Constants.token();
        string[20] memory tokenNames = Constants.tokenNames();
        uint128[7][] memory data = new uint128[7][](20);
        for (uint8 i; i < tokens.length; i++) {
            DataTypes.ReserveData memory returnData = ILendingPool(pool)
                .getReserveData(tokens[i], tranche);

            data[i] = [
                returnData.liquidityIndex,
                returnData.variableBorrowIndex,
                returnData.currentLiquidityRate,
                returnData.currentVariableBorrowRate,
                uint128(returnData.lastUpdateTimestamp),
                uint128(returnData.id),
                uint128(returnData.tranche)
            ];
        }
        // ILendingPool(pool).getReserveData(asset, tranche)
        // address[] memory list = ILendingPool(pool).getReservesList();

        bytes memory _data = abi.encode(tokenNames, data);
        assembly {
            return(add(0x20, _data), mload(_data))
        }
    }
}
