import { DataTypes } from "../../protocol/libraries/types/DataTypes.sol";
import { ReserveConfiguration } from "../../protocol/libraries/configuration/ReserveConfiguration.sol";
import { WadRayMath } from "../../protocol/libraries/math/WadRayMath.sol";
import { SafeMath } from "../../protocol/libraries/math/MathUtils.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { AssetMappings } from "../../protocol/lendingpool/AssetMappings.sol";
import { IERC20 } from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import { IAToken } from "../../interfaces/IAToken.sol";
import { IBaseStrategy } from "../../interfaces/IBaseStrategy.sol";
import { IPriceOracleGetter } from "../../interfaces/IPriceOracleGetter.sol";
import { IChainlinkAggregator } from "../../interfaces/IChainlinkAggregator.sol";

library QueryAssetHelpers {

    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using WadRayMath for uint256;
    using SafeMath for uint256;

    struct AssetData {
        uint64 tranche;
        address asset;
        uint256 decimals;
        uint256 ltv;
        uint256 liquidationThreshold;
        uint256 liquidationPenalty;
        bool canBeCollateral;
        bool canBeBorrowed;
        address oracle;
        uint256 totalSupplied;
        uint256 utilization;
        uint256 totalBorrowed;
        address strategyAddress;
        uint256 adminFee;
        uint256 platformFee;
        uint128 supplyApy;
        uint128 borrowApy;
        uint256 totalReserves;
        uint256 totalReservesNative;
        uint256 currentPriceETH;
        uint256 collateralCap;
    }

    function getAssetData(
        address asset,
        uint64 tranche,
        address providerAddr
    )
        internal
        view
        returns (AssetData memory assetData)
    {
        ILendingPool lendingPool = ILendingPool(
            ILendingPoolAddressesProvider(providerAddr).getLendingPool()
        );

        AssetMappings a = AssetMappings(ILendingPoolAddressesProvider(providerAddr).getAssetMappings());


        DataTypes.ReserveData memory reserve = lendingPool.getReserveData(asset, tranche);
        assetData.tranche = tranche;
        assetData.asset = asset;
        assetData.decimals = reserve.configuration.getDecimals();
        assetData.ltv = reserve.configuration.getLtv();
        assetData.liquidationThreshold = reserve.configuration.getLiquidationThreshold();
        assetData.liquidationPenalty = reserve.configuration.getLiquidationBonus();
        assetData.canBeCollateral = assetData.liquidationThreshold != 0;
        assetData.canBeBorrowed = reserve.configuration.getBorrowingEnabled();
        assetData.oracle = ILendingPoolAddressesProvider(providerAddr).getPriceOracle(a.getAssetType(asset));
        assetData.totalSupplied = convertAmountToUsd(assetData.oracle, assetData.asset, IAToken(reserve.aTokenAddress).totalSupply(), assetData.decimals);
        assetData.totalBorrowed = convertAmountToUsd(assetData.oracle, assetData.asset, IAToken(reserve.variableDebtTokenAddress).totalSupply(), assetData.decimals);
        assetData.strategyAddress = IAToken(reserve.aTokenAddress).getStrategy();

        assetData.totalReserves = convertAmountToUsd(assetData.oracle, assetData.asset, IERC20(asset).balanceOf(reserve.aTokenAddress), assetData.decimals);
        assetData.totalReservesNative = IERC20(asset).balanceOf(reserve.aTokenAddress);
        
        if (assetData.strategyAddress != address(0)) {
            // if strategy exists, add the funds the strategy holds
            // and the funds the strategy has boosted
            assetData.totalReserves = assetData.totalReserves.add(
                IBaseStrategy(assetData.strategyAddress).balanceOf()
            );
        }

        assetData.utilization = assetData.totalBorrowed == 0
            ? 0
            : assetData.totalBorrowed.rayDiv(assetData.totalReserves.add(assetData.totalBorrowed));

        assetData.adminFee = reserve.configuration.getReserveFactor();
        assetData.platformFee = reserve.configuration.getVMEXReserveFactor();
        assetData.supplyApy = reserve.currentLiquidityRate;
        assetData.borrowApy = reserve.currentVariableBorrowRate;
        assetData.currentPriceETH = IPriceOracleGetter(assetData.oracle).getAssetPrice(assetData.asset);
        assetData.collateralCap = a.getCollateralCap(assetData.asset);

    }

    function convertAmountToUsd(
        address oracle,
        address underlying,
        uint256 amount,
        uint256 decimals
    ) view internal returns(uint256) {
        //has number of decimals equal to decimals of orig token
        uint256 assetPrice = IPriceOracleGetter(oracle).getAssetPrice(underlying);
        //amount is from atoken, which has same amount of tokens as underlying
        //ethAmount thus has 18 decimals

        //this has the same number of tokens as assetPrice. All ETH pairs have 18 decimals
        uint256 ethAmount = (amount * assetPrice) / (10**(decimals));
        uint256 ethUSD = uint256(IChainlinkAggregator(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419).latestAnswer());

        //ethUSD/usdDecimals (unitless factor for conversion). So this is in units of chainlink aggregator. If ETH pair, it's 18
        return (ethAmount * ethUSD) / (10**IChainlinkAggregator(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419).decimals()) ;
    }

    function convertEthToNative(
        address oracle,
        address underlying,
        uint256 ethAmount,
        uint256 decimals
    ) view internal returns(uint256) {
        //has number of decimals equal to decimals of orig token
        uint256 assetPrice = IPriceOracleGetter(oracle).getAssetPrice(underlying);
        //amount is from atoken, which has same amount of tokens as underlying
        //ethAmount thus has 18 decimals
        //18 decimals in ethAmount, assetPRice has 18 decimals, so returned is number of decimals of native
        return  (ethAmount * (10**(decimals))) / assetPrice;
    }

    function convertEthToUsd(
        uint256 amount
    ) view internal returns(uint256) {
        uint256 ethUSD = uint256(IChainlinkAggregator(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419).latestAnswer());

        //units of amount is returned too
        return (amount * ethUSD) / (10**IChainlinkAggregator(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419).decimals()) ;
    }
}