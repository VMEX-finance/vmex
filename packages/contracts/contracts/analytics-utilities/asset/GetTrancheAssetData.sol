import { QueryAssetHelpers } from "../libs/QueryAssetHelpers.sol";

import "hardhat/console.sol";

contract GetTrancheAssetData {
	constructor(
        address providerAddr,
        address asset,
        uint64 tranche)
    {
        QueryAssetHelpers.AssetData memory assetData = QueryAssetHelpers.getAssetData(
            asset, tranche, providerAddr);

	    bytes memory returnData = abi.encode(assetData);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}
	function getType() public view returns(QueryAssetHelpers.AssetData memory){}

}
