// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;
import { QueryAssetHelpers } from "../libs/QueryAssetHelpers.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { AssetMappings } from "../../protocol/lendingpool/AssetMappings.sol";
import { IERC20Detailed } from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";

import { IPriceOracleGetter } from "../../interfaces/IPriceOracleGetter.sol";

contract GetAllAssetPrices {

    struct AssetPrice {
        address oracle;
        uint256 priceETH;
        uint256 priceUSD;
    }

	constructor(address providerAddr, address[] memory assets)
    {
        AssetPrice[] memory allAssetPrices = new AssetPrice[](assets.length);

        for (uint64 i = 0; i < assets.length; i++) {
            allAssetPrices[i].oracle = ILendingPoolAddressesProvider(providerAddr)
                .getPriceOracle();
            allAssetPrices[i].priceETH = IPriceOracleGetter(allAssetPrices[i].oracle).getAssetPrice(assets[i]);

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
