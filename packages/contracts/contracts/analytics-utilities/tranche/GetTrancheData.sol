// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;
import { QueryTrancheHelpers } from "../libs/QueryTrancheHelpers.sol";

//import "hardhat/console.sol";

contract GetTrancheData {
	constructor(
        address providerAddr,
        uint64 tranche)
    {

        QueryTrancheHelpers.TrancheData memory trancheData = QueryTrancheHelpers
            .getSingleTrancheData(
                tranche,
                providerAddr
            );
        bytes memory returnData = abi.encode(trancheData);

		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}

	function getType() public view returns(QueryTrancheHelpers.TrancheData memory){}
}
