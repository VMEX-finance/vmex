// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { QueryReserveHelpers } from "../libs/QueryReserveHelpers.sol";

//import "hardhat/console.sol";

contract GetTrancheReserveData {
	constructor(
        address providerAddr,
        address asset,
        uint64 tranche)
    {
        QueryReserveHelpers.ReserveSummary memory assetData = QueryReserveHelpers.getReserveData(
            asset, tranche, providerAddr);

	    bytes memory returnData = abi.encode(assetData);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}
	function getType() public view returns(QueryReserveHelpers.ReserveSummary memory){}

}
