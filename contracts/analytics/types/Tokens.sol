// SPDX-License-Identifier: agpl 3.0
pragma solidity >=0.8.0;
import {DataTypes} from "../../protocol/libraries/types/DataTypes.sol";

struct TokenInfo {
    string[] names;
}

struct TokenData {
    string symbol;
    DataTypes.ReserveData reserveData;
    DataTypes.AssetData assetData;
}

struct AggregateData {
    TokenData[] data;
}
