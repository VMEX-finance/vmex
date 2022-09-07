// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {DataTypes} from "../../protocol/libraries/types/DataTypes.sol";
import {Constants} from "./Constants.sol";
import {UserBalances, UserAccountData, AggregatedData, TokenReserveData} from "../types/AnalyticsDataTypes.sol";
import {IChainlinkAggregator} from "../../interfaces/IChainlinkAggregator.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {IAaveOracle} from "../../misc/interfaces/IAaveOracle.sol";
import {AggregateData, TokenData} from "../types/Tokens.sol";

library AnalyticsUtilities {
    function getTokenReserveData(
        ILendingPoolAddressesProvider provider,
        uint8 tranche
    ) internal view returns (TokenData[22] memory) {
        address[22] memory tokens = Constants.token();
        string[22] memory names = Constants.tokenNames();
        ILendingPool lendingPool = ILendingPool(provider.getLendingPool());
        TokenData[22] memory returnData;
        for (uint8 i = 0; i < tokens.length; i++) {
            TokenData memory data = TokenData(
                names[i],
                lendingPool.getReserveData(tokens[i], tranche),
                lendingPool.getAssetData(tokens[i])
            );

            returnData[i] = data;
        }

        return returnData;
    }

    // function getUserTokenInfo(ILendingPoolAddressProvider provider, uint8 tranche, address user)
    //     internal
    //     view
    //     returns (memory)
    // {

    // }
}
