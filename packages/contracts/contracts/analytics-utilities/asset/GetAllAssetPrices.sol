import { QueryAssetHelpers } from "../libs/QueryAssetHelpers.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { AssetMappings } from "../../protocol/lendingpool/AssetMappings.sol";
import { IERC20Detailed } from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";

contract GetAllAssetPrices {

    struct AssetPrice {
        address oracle;
        uint256 priceUSD;
    }

	constructor(address providerAddr, address[] memory assets)
    {
        AssetPrice[] memory allAssetPrices = new AssetPrice[](assets.length);

        AssetMappings a = AssetMappings(ILendingPoolAddressesProvider(providerAddr).getAssetMappings());

        for (uint64 i = 0; i < assets.length; i++) {
            allAssetPrices[i].oracle = ILendingPoolAddressesProvider(providerAddr)
                .getPriceOracle();

            allAssetPrices[i].priceUSD = QueryAssetHelpers.convertAmountToUsd(
                allAssetPrices[i].oracle,
                assets[i],
                1,
                0);
        }

	    bytes memory returnData = abi.encode(allAssetPrices);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}

	function getType() public view returns(AssetPrice[] memory){}

}
