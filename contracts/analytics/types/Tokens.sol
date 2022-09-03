// SPDX-License-Identifier: agpl 3.0
pragma solidity >=0.8.0;
import {DataTypes} from "../../protocol/libraries/types/DataTypes.sol";

struct TokenInfo {
    string[] names;
}

struct TokenData {
    string symbol;
    uint256 userBalance;
    uint256 usdPrice;
    uint256 ethPrice;
    DataTypes.AssetData assetData;
    DataTypes.ReserveData reserveData;
}

struct AggregateData {
    TokenData[] data;
}
