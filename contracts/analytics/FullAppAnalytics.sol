// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {AnalyticsUtilities} from "./libraries/AnalyticsUtilities.sol";
import {Constants} from "./libraries/Constants.sol";
import {IUiPoolDataProviderV3} from "../misc/interfaces/IUiPoolDataProviderV3.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";

struct AggregatedPoolData {
    IUiPoolDataProviderV3.AggregatedReserveData[] reserveData;
    IUiPoolDataProviderV3.UserReserveData[] userData;
    IUiPoolDataProviderV3.BaseCurrencyInfo baseCurrencyInfo;
    address[] reservesList;
}

contract FullAppAnalytics {
    IUiPoolDataProviderV3 dataProvider;

    constructor(address pool, address user) {
        AggregatedPoolData memory returnData;
        uint8 integer;
        // scopes, calls to contracts use 9 stack items
        {
            (returnData.reserveData, returnData.baseCurrencyInfo) = dataProvider
                .getReservesData(ILendingPoolAddressesProvider(pool));
        }
        {
            (returnData.userData, integer) = dataProvider.getUserReservesData(
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
