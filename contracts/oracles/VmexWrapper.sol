// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {IAaveOracle} from "./interfaces/IAaveOracle.sol";

//wrapper contract for Aave's already deployed AaveOracle contracts
contract VmexWrapper {
    IAaveOracle private oracle;

    constructor(IAaveOracle _oracle) {
        oracle = _oracle;
    }

    function get_asset_price(address asset) external view returns (uint256) {
        return oracle.getAssetPrice(asset);
    }

    function get_assets_prices(address[] calldata assets)
        external
        view
        returns (uint256[] memory)
    {
        return oracle.getAssetsPrices(assets);
    }
}
