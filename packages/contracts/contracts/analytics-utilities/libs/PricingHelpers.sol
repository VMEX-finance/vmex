// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { IPriceOracleGetter } from "../../interfaces/IPriceOracleGetter.sol";
import { IChainlinkPriceFeed } from "../../interfaces/IChainlinkPriceFeed.sol";
import { Address } from "../../dependencies/openzeppelin/contracts/Address.sol";

library PricingHelpers {

    /// @dev Converts underlying amount to usd value, decimals is defined by IPriceOracle.getAssetPrice
    /// 18 for mainnet, 8 for side chains
    function convertAmountToUsd(
        address oracle,
        address underlying,
        uint256 amount,
        uint256 decimals,
        address chainlinkOracleConverter
    ) internal returns(uint256) {
        uint256 ethAmount = findAmountValue(
            oracle,
            underlying,
            amount,
            decimals
        );
        return convertEthToUsd(ethAmount, chainlinkOracleConverter);
    }

    function findAmountValue(
        address oracle,
        address underlying,
        uint256 amount,
        uint256 decimals
    ) internal returns(uint256) {
        //has number of decimals equal to decimals of orig token
        uint256 assetPrice = tryGetAssetPrice(oracle, underlying);
        //amount is from atoken, which has same amount of tokens as underlying
        //ethAmount thus has 18 decimals

        //this has the same number of tokens as assetPrice. All ETH pairs have 18 decimals
        return (amount * assetPrice) / (10**(decimals));
    }

    function convertEthToNative(
        address oracle,
        address underlying,
        uint256 ethAmount,
        uint256 decimals
    ) internal returns(uint256) {
        //has number of decimals equal to decimals of orig token
        uint256 assetPrice = tryGetAssetPrice(oracle, underlying);
        if(assetPrice == 0) return 0; //handle case where in price feeds broken but on FE we want to display something at least
        //amount is from atoken, which has same amount of tokens as underlying
        //ethAmount thus has 18 decimals
        //18 decimals in ethAmount, assetPRice has 18 decimals, so returned is number of decimals of native
        return  (ethAmount * (10**(decimals))) / assetPrice;
    }

    /// @dev converts an eth amount to usd, without changing the decimals
    ///      ie if amount has 8 decimals, the answer will have 8 decimals
    /// @param chainlinkOracleConverter is the oracle that facilitates the conversion:
    /// ex: price of ETH in USD on mainnet 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
    function convertEthToUsd(
        uint256 amount,
        address chainlinkOracleConverter
    ) view internal returns(uint256) {
        if(Address.isContract(chainlinkOracleConverter)){ //if we are on mainnet
            uint256 ethUSD = uint256(IChainlinkPriceFeed(chainlinkOracleConverter).latestAnswer());

            //ethUSD/usdDecimals (unitless factor for conversion). So this is in units of chainlink aggregator. If ETH pair, it's 18
            return (amount * ethUSD) / (10**IChainlinkPriceFeed(chainlinkOracleConverter).decimals()) ;
        }
        else{
            return (amount * 1660); //mocking the price of ETH. This means USD also has 18 decimals, or whatever number of decimals the original amount has
        }
    }


    /// @dev chainlinkOracleConverter is the oracle that facilitates the conversion:
    /// price of WETH in USD on OP mainnet: 0x13e3Ee699D1909E989722E753853AE30b17e08c5
    function convertUsdToEth(
        uint256 amount,
        address chainlinkOracleConverter
    ) view internal returns(uint256) {
        if(Address.isContract(chainlinkOracleConverter)){ //if we are on mainnet
            uint256 ethUSD = uint256(IChainlinkPriceFeed(chainlinkOracleConverter).latestAnswer());

            //this is in units of chainlink aggregator. If ETH pair, it's 18
            return (amount * 10**IChainlinkPriceFeed(chainlinkOracleConverter).decimals()) / (ethUSD) ;
        }
        else{
            return (amount / 1660); //mocking the price of ETH. Keeps same num decimals
        }
    }

    function tryGetAssetPrice(
        address oracle,
        address token
    ) internal returns(uint256) {
        try IPriceOracleGetter(oracle).getAssetPrice(token) returns(uint256 price) {
            return price;
        } catch {
            return 0;
        }
    }
}