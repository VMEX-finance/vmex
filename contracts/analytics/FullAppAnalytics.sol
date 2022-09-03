// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {AnalyticsUtilities} from "./libraries/AnalyticsUtilities.sol";
import {Constants} from "./libraries/Constants.sol";
import {IUiPoolDataProviderV2} from "../misc/interfaces/IUiPoolDataProviderV2.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {TokenReserveData} from "./types/AnalyticsDataTypes.sol";
import {TokenInfo} from "./types/Tokens.sol";

contract FullAppAnalytics {
    constructor(address pool, address user) {
        string[22] memory tokenName = AnalyticsUtilities
            .getAggregatedReserveData(ILendingPoolAddressesProvider(pool));

        bytes memory _data = abi.encode(tokenName);
        assembly {
            return(add(0x20, _data), mload(_data))
        }
    }

    function getType() public view returns (string[22] memory) {}
}
