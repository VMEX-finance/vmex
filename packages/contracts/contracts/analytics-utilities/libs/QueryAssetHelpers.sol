import { DataTypes } from "../../protocol/libraries/types/DataTypes.sol";
import { ReserveConfiguration } from "../../protocol/libraries/configuration/ReserveConfiguration.sol";
import { WadRayMath } from "../../protocol/libraries/math/WadRayMath.sol";
import { SafeMath } from "../../protocol/libraries/math/MathUtils.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { IERC20 } from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import { IAToken } from "../../interfaces/IAToken.sol";
import { IBaseStrategy } from "../../interfaces/IBaseStrategy.sol";

library QueryAssetHelpers {

    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using WadRayMath for uint256;
    using SafeMath for uint256;

    struct AssetData {
        uint64 tranche;
        address asset;
        uint256 ltv;
        uint256 liquidationThreshold;
        uint256 liquidationPenalty;
        bool canBeCollateral;
        bool canBeBorrowed;
        address oracle; // TODO
        uint256 totalSupplied;
        uint256 utilization;
        uint256 totalBorrowed;
        address strategyAddress;
        uint256 adminFee;
        uint256 platformFee;
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

        DataTypes.ReserveData memory reserve = lendingPool.getReserveData(asset, tranche);
        assetData.tranche = tranche;
        assetData.asset = asset;
        assetData.ltv = reserve.configuration.getLtv();
        assetData.liquidationThreshold = reserve.configuration.getLiquidationThreshold();
        assetData.liquidationPenalty = reserve.configuration.getLiquidationBonus();
        assetData.canBeCollateral = assetData.liquidationThreshold != 0;
        assetData.canBeBorrowed = reserve.configuration.getBorrowingEnabled();
        assetData.totalSupplied = IAToken(reserve.aTokenAddress).totalSupply();
        assetData.totalBorrowed = IAToken(reserve.variableDebtTokenAddress).totalSupply();
        assetData.strategyAddress = IAToken(reserve.aTokenAddress).getStrategy();
        uint256 availableLiquidity = assetData.totalSupplied;
        if (assetData.strategyAddress != address(0)) {
            // if strategy exists, add the funds the strategy holds
            // and the funds the strategy has boosted
            availableLiquidity = availableLiquidity.add(
                IBaseStrategy(assetData.strategyAddress).balanceOf()
            );
        }

        assetData.utilization = assetData.totalBorrowed == 0
            ? 0
            : assetData.totalBorrowed.rayDiv(availableLiquidity.add(assetData.totalBorrowed));

        assetData.adminFee = reserve.configuration.getReserveFactor();
        assetData.platformFee = reserve.configuration.getVMEXReserveFactor();
    }
}