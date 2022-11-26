import { QueryAssetHelpers } from "./libs/QueryAssetHelpers.sol";
import { ILendingPool } from "../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../interfaces/ILendingPoolAddressesProvider.sol";
import { LendingPoolConfigurator } from "../protocol/lendingpool/LendingPoolConfigurator.sol";

import "hardhat/console.sol";
// NOTE: this function starts to fail if we have a large number of markets
contract GetAllAssetsData {

	constructor(address providerAddr)
    {
        address lendingPool = ILendingPoolAddressesProvider(providerAddr).getLendingPool();
        uint64 totalTranches = LendingPoolConfigurator(
            ILendingPoolAddressesProvider(providerAddr).getLendingPoolConfigurator()
        ).totalTranches();

        // TODO: find deterministic upper bound. temporary solution: 35 assets per tranche
        QueryAssetHelpers.AssetData[] memory allAssetsData = new QueryAssetHelpers.AssetData[](totalTranches*35);
        uint64 idx = 0;

        for (uint64 tranche = 0; tranche < totalTranches; tranche++) {
            address[] memory assets = ILendingPool(lendingPool).getReservesList(tranche);
            for (uint64 i = 0; i < assets.length; i++) {
                allAssetsData[idx++] = QueryAssetHelpers.getAssetData(
                    assets[i], tranche, providerAddr);
            }
        }

        QueryAssetHelpers.AssetData[] memory finalData = new QueryAssetHelpers.AssetData[](idx);
        for (uint64 i = 0; i < idx; i++) {
            finalData[i] = allAssetsData[i];
        }
	    bytes memory returnData = abi.encode(finalData);
        console.log("done with getallassetsdata");
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}

	function getType() public view returns(QueryAssetHelpers.AssetData[] memory){}

}
