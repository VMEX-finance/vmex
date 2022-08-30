// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {AnalyticsUtilities} from "./libraries/AnalyticsUtilities.sol";
import {Constants} from "./libraries/Constants.sol";
import {IUiPoolDataProviderV2} from "../misc/interfaces/IUiPoolDataProviderV2.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";

struct AggregatedPoolData {
    IUiPoolDataProviderV2.AggregatedReserveData[] reserveData;
    IUiPoolDataProviderV2.UserReserveData[] userData;
    IUiPoolDataProviderV2.BaseCurrencyInfo baseCurrencyInfo;
    address[] reservesList;
}

contract FullAppAnalytics {
    IUiPoolDataProviderV2 dataProvider;

    constructor(address pool, address user) {
        AggregatedPoolData memory returnData;
        // scopes, calls to contracts use 9 stack items
        {
            (returnData.reserveData, returnData.baseCurrencyInfo) = dataProvider
                .getReservesData(ILendingPoolAddressesProvider(pool));
        }
        {
            (returnData.userData) = dataProvider.getUserReservesData(
                ILendingPoolAddressesProvider(pool),
                user
            );
        }
        {
            (returnData.reservesList) = dataProvider.getReservesList(
                ILendingPoolAddressesProvider(pool)
            );
        }

        bytes memory _data = abi.encode(returnData);
        assembly {
            return(add(0x20, _data), mload(_data))
        }
    }

    function getType() public view returns (address) {}
}
