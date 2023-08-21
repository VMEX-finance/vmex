// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { QueryUserHelpers } from "../libs/QueryUserHelpers.sol";

//import "hardhat/console.sol";

contract GetUserTrancheData {
	constructor(
        address addressesProvider,
        address user,
        uint64 tranche,
        bool ETHBase, //true if ETH is base, false if USD is base
        address chainlinkConverter
	)
    {
        QueryUserHelpers.UserTrancheData memory userData =
            QueryUserHelpers.getUserTrancheData(user, tranche, addressesProvider, ETHBase, chainlinkConverter);
	    bytes memory returnData = abi.encode(userData);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}
	function getType() public view returns(QueryUserHelpers.UserTrancheData memory){}
}
