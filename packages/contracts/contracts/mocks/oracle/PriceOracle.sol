// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {IPriceOracle} from "../../interfaces/IPriceOracle.sol";

contract PriceOracle is IPriceOracle {
    mapping(address => uint256) prices;
    uint256 ethPriceUsd;

    event AssetPriceUpdated(address _asset, uint256 _price, uint256 timestamp);
    event EthPriceUpdated(uint256 _price, uint256 timestamp);

    function getAssetPrice(address _asset)
        public
        view
        override
        returns (uint256)
    {
        return prices[_asset];
    }

    function setAssetPrice(address _asset, uint256 _price) external override {
        prices[_asset] = _price;
        emit AssetPriceUpdated(_asset, _price, block.timestamp);
    }

    function getEthUsdPrice() external view returns (uint256) {
        return ethPriceUsd;
    }

    function setEthUsdPrice(uint256 _price) external {
        ethPriceUsd = _price;
        emit EthPriceUpdated(_price, block.timestamp);
    }

    //updateTWAP (average O(1))
    //recent +=1 and cover case where it goes over
    //cumulatedPrices[asset][recent] = 
    //If block.timestamp - cumulatedPrices[asset][last].timestamp > 24 hours, 
    //  then keep increasing last until you find until find cumulatedPrices[asset][last].timestamp < 24 hours (most likely close to O(1))
    function updateTWAP(address asset) public override{
        require(numPrices[asset]<type(uint16).max, "Overflow updateTWAP");
        uint256 currentPrice = getAssetPrice(asset);
        _updateState(asset,currentPrice);
    }

    //getAssetTWAPPrice
    //first call updateTWAP
    //return (cumulatedPrices[asset][recent].cumulatedPrice - cumulatedPrices[asset][last].cumulatedPrice)/(cumulatedPrices[asset][recent].timestamp - cumulatedPrices[asset][last].timestamp)
    function getAssetTWAPPrice(address asset) external view override returns (uint256){
        return _getAssetTWAPPrice(asset, getAssetPrice(asset));
    }
}
