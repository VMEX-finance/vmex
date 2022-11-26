import { QueryUserHelpers } from "../libs/QueryUserHelpers.sol";

import "hardhat/console.sol";

contract GetUserTrancheData {
	constructor(
        address addressesProvider,
        address user,
        uint64 tranche)
    {
        QueryUserHelpers.UserTrancheData memory userData =
            QueryUserHelpers.getUserTrancheData(user, tranche, addressesProvider);

	    bytes memory returnData = abi.encode(userData);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}
	function getType() public view returns(QueryUserHelpers.UserTrancheData memory){}
}
