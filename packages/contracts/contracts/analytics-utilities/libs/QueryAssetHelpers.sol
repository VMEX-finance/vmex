// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { DataTypes } from "../../protocol/libraries/types/DataTypes.sol";
import { ReserveConfiguration } from "../../protocol/libraries/configuration/ReserveConfiguration.sol";
import { WadRayMath } from "../../protocol/libraries/math/WadRayMath.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { AssetMappings } from "../../protocol/lendingpool/AssetMappings.sol";
import { IERC20 } from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import { IAToken } from "../../interfaces/IAToken.sol";
import { IPriceOracleGetter } from "../../interfaces/IPriceOracleGetter.sol";
import { IChainlinkPriceFeed } from "../../interfaces/IChainlinkPriceFeed.sol";
import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";

library QueryAssetHelpers {

    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using WadRayMath for uint256;

    struct AssetData {
        uint64 tranche;
        address asset;
        uint256 decimals;
        uint256 ltv;
        uint256 liquidationThreshold;
        uint256 liquidationBonus;
        bool canBeCollateral;
        bool canBeBorrowed;
        address oracle;
        uint256 totalSupplied;
        uint256 utilization;
        uint256 totalBorrowed;
        uint256 adminFee;
        uint256 platformFee;
        uint128 supplyApy;
        uint128 borrowApy;
        uint256 totalReserves;
        uint256 totalReservesNative;
        uint256 currentPriceETH;
        uint256 supplyCap;
    }

    function getAssetData(
        address asset,
        uint64 tranche,
        address providerAddr,
        address chainlinkOracleConverter
    )
        internal
        returns (AssetData memory assetData)
    {
        ILendingPool lendingPool = ILendingPool(
            ILendingPoolAddressesProvider(providerAddr).getLendingPool()
        );

        AssetMappings a = AssetMappings(ILendingPoolAddressesProvider(providerAddr).getAssetMappings());


        DataTypes.ReserveData memory reserve = lendingPool.getReserveData(asset, tranche);
        assetData.tranche = tranche;
        assetData.asset = asset;
        (
            assetData.ltv,
            assetData.liquidationThreshold,
            assetData.liquidationBonus,
            assetData.decimals,
            //borrowFactor (not used yet)
        ) = a.getParams(asset, tranche);
        assetData.canBeCollateral = reserve.configuration.getCollateralEnabled(asset, a);//assetData.liquidationThreshold != 0;
        assetData.canBeBorrowed = reserve.configuration.getBorrowingEnabled(asset, a);
        assetData.oracle = ILendingPoolAddressesProvider(providerAddr).getPriceOracle();
        assetData.totalSupplied = convertAmountToUsd(assetData.oracle, assetData.asset, IAToken(reserve.aTokenAddress).totalSupply(), assetData.decimals, chainlinkOracleConverter);
        assetData.totalBorrowed = convertAmountToUsd(assetData.oracle, assetData.asset, IAToken(reserve.variableDebtTokenAddress).totalSupply(), assetData.decimals, chainlinkOracleConverter);

        assetData.totalReserves = convertAmountToUsd(assetData.oracle, assetData.asset, IERC20(asset).balanceOf(reserve.aTokenAddress), assetData.decimals, chainlinkOracleConverter);
        assetData.totalReservesNative = IERC20(asset).balanceOf(reserve.aTokenAddress);

        assetData.utilization = assetData.totalBorrowed == 0
            ? 0
            : assetData.totalBorrowed.rayDiv(assetData.totalReserves + assetData.totalBorrowed);

        assetData.adminFee = reserve.configuration.getReserveFactor();
        assetData.platformFee = a.getVMEXReserveFactor(asset);
        assetData.supplyApy = reserve.currentLiquidityRate;
        assetData.borrowApy = reserve.currentVariableBorrowRate;
        assetData.currentPriceETH = tryGetAssetPrice(assetData.oracle, assetData.asset);
        assetData.supplyCap = a.getSupplyCap(assetData.asset);

    }

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

    /// @dev chainlinkOracleConverter is the oracle that facilitates the conversion:
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