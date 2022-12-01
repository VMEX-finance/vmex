import { QueryUserHelpers } from "../libs/QueryUserHelpers.sol";

import "hardhat/console.sol";

contract GetUserWalletData {
	constructor(
        address addressesProvider,
        address user)
    {
        QueryUserHelpers.WalletData[] memory userData =
            QueryUserHelpers.getUserWalletData(user, addressesProvider);

	    bytes memory returnData = abi.encode(userData);
		
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}
	function getType() public view returns(QueryUserHelpers.WalletData[] memory){}
}
