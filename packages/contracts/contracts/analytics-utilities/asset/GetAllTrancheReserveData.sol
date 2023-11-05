// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { QueryReserveHelpers } from "../libs/QueryReserveHelpers.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";

//import "hardhat/console.sol";
// NOTE: this function starts to fail if we have a large number of markets
contract GetAllTrancheReserveData {

	constructor(address providerAddr, uint64 tranche)
    {
        address lendingPool = ILendingPoolAddressesProvider(providerAddr).getLendingPool();

        address[] memory assets = ILendingPool(lendingPool).getReservesList(tranche);
        QueryReserveHelpers.ReserveSummary[] memory allAssetsData = new QueryReserveHelpers.ReserveSummary[](assets.length);
        for (uint64 i = 0; i < assets.length;) {
            allAssetsData[i] = QueryReserveHelpers.getReserveData(
                assets[i], tranche, providerAddr);

            unchecked { ++i; }
        }

	    bytes memory returnData = abi.encode(allAssetsData);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}

	function getType() public view returns(QueryReserveHelpers.ReserveSummary[] memory){}

}
