// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {AnalyticsUtilities} from "../libraries/AnalyticsUtilities.sol";
import {Constants} from "../libraries/Constants.sol";
import {IUiPoolDataProviderV2} from "../../misc/interfaces/IUiPoolDataProviderV2.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {TokenReserveData} from "../types/AnalyticsDataTypes.sol";
import {TokenData} from "../types/Tokens.sol";

contract getTokenReserveData {
    constructor(address pool, uint8 tranche) {
        TokenData[22] memory returnData = AnalyticsUtilities
            .getTokenReserveData(ILendingPoolAddressesProvider(pool), tranche);

        bytes memory _data = abi.encode(returnData);
        assembly {
            return(add(0x20, _data), mload(_data))
        }
    }

    function getType() public view returns (TokenData[22] memory) {}
}
