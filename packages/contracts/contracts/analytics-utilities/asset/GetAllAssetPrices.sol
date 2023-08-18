// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
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

    /// @dev ETHBase is true if the base unit for chainlink is ETH, false if USD
	constructor(address providerAddr, address[] memory assets, bool ETHBase, address chainlinkOracleConverter)
    {
        AssetPrice[] memory allAssetPrices = new AssetPrice[](assets.length);

        for (uint64 i = 0; i < assets.length;) {
            allAssetPrices[i].oracle = ILendingPoolAddressesProvider(providerAddr)
                .getPriceOracle();
            if(ETHBase){
                allAssetPrices[i].priceETH = IPriceOracleGetter(allAssetPrices[i].oracle).getAssetPrice(assets[i]);
                allAssetPrices[i].priceUSD = QueryAssetHelpers.convertEthToUsd(allAssetPrices[i].priceETH, chainlinkOracleConverter);
            } else { //prices are in USD
                allAssetPrices[i].priceUSD = IPriceOracleGetter(allAssetPrices[i].oracle).getAssetPrice(assets[i]);
                allAssetPrices[i].priceETH = QueryAssetHelpers.convertUsdToEth(allAssetPrices[i].priceUSD, chainlinkOracleConverter);
            }
            
            unchecked { ++i; }
        }

	    bytes memory returnData = abi.encode(allAssetPrices);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}

	function getType() public view returns(AssetPrice[] memory){}

}
