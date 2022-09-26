// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {DataTypes} from "../../protocol/libraries/types/DataTypes.sol";
import {AnalyticsUtilities} from "../libraries/AnalyticsUtilities.sol";
import {Constants} from "../libraries/Constants.sol";

struct TokenReserveDataStruct {
    string[22] tokens;
    uint256[22] balances;
    Tranche[3] data;
}

struct Tranche {
    uint8 tranche;
    uint256[22] income;
    uint256[22] debt;
}

contract TokenReserveData {
    constructor(address provider, address user) {
        TokenReserveDataStruct memory returnData;
        returnData.tokens = Constants.tokenNames();
        returnData.balances = AnalyticsUtilities.getUserWalletBalances(user);
        for (uint8 i; i < 3; i++) {
            (
                uint256[22] memory income,
                uint256[22] memory debt
            ) = AnalyticsUtilities.getBatchNormalizedIncomeDebt(i, provider);
            returnData.data[i] = Tranche(i, income, debt);
        }

        bytes memory data = abi.encode(returnData);
        assembly {
            return(add(0x20, data), mload(data))
        }
    }

    function getType() public view returns (TokenReserveDataStruct memory) {}
}
