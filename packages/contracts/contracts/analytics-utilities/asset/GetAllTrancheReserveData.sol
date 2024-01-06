// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { QueryReserveHelpers } from "../libs/QueryReserveHelpers.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";

//import "hardhat/console.sol";
// NOTE: this function starts to fail if we have a large number of markets
contract GetAllTrancheReserveData {

    /**
    Pagination starts at 0. Will return 10 reserves at a time, and (pagination * 10)
    is the start index
     */
    constructor(address providerAddr, uint64 tranche, uint64 pagination)
    {
        address lendingPool = ILendingPoolAddressesProvider(providerAddr).getLendingPool();

        address[] memory assets = ILendingPool(lendingPool).getReservesList(tranche);
        uint256 arrSize = 10;
        uint64 startIdx = pagination*10;
        if (assets.length - startIdx < arrSize) {
            arrSize = assets.length - startIdx;
        }
        QueryReserveHelpers.ReserveSummary[] memory allAssetsData = new QueryReserveHelpers.ReserveSummary[](arrSize);

        for (uint64 i = 0; i < arrSize;) {
            uint64 currIdx = i+startIdx;
            if (currIdx >= assets.length) {
                // extra layer of safety, this should never trigger
                break;
            }
            allAssetsData[i] = QueryReserveHelpers.getReserveData(
                assets[i+startIdx], tranche, providerAddr);

            unchecked { ++i; }
        }

        bytes memory returnData = abi.encode(allAssetsData);
        assembly {
            return(add(0x20, returnData), mload(returnData))
        }
    }

	function getType() public view returns(QueryReserveHelpers.ReserveSummary[] memory){}

}
