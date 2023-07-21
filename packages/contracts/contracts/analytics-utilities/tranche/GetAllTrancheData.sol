// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { QueryTrancheHelpers } from "../libs/QueryTrancheHelpers.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { LendingPoolConfigurator } from "../../protocol/lendingpool/LendingPoolConfigurator.sol";

//import "hardhat/console.sol";

contract GetAllTrancheData {

	constructor(address addressesProvider)
    {
        address configurator = ILendingPoolAddressesProvider(addressesProvider).getLendingPoolConfigurator();

        uint64 totalTranches = LendingPoolConfigurator(configurator).totalTranches();
        QueryTrancheHelpers.TrancheData[] memory allTrancheData = new QueryTrancheHelpers.TrancheData[](totalTranches);
        for(uint64 i = 0; i < totalTranches; ++i) {
            allTrancheData[i] = QueryTrancheHelpers.getSingleTrancheData(i, addressesProvider);
        }
        bytes memory returnData = abi.encode(allTrancheData);

		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}

	function getType() public view returns(QueryTrancheHelpers.TrancheData[] memory){}
}
