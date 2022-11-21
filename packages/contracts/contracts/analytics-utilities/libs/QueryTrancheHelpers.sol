import { LendingPoolConfigurator } from "../../protocol/lendingpool/LendingPoolConfigurator.sol";
import { DataTypes } from "../../protocol/libraries/types/DataTypes.sol";
import { ReserveConfiguration } from "../../protocol/libraries/configuration/ReserveConfiguration.sol";
import { WadRayMath } from "../../protocol/libraries/math/WadRayMath.sol";
import { SafeMath } from "../../protocol/libraries/math/MathUtils.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { IAToken } from "../../interfaces/IAToken.sol";
import { IERC20 } from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import { IBaseStrategy } from "../../interfaces/IBaseStrategy.sol";

library QueryTrancheHelpers {

    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using WadRayMath for uint256;
    using SafeMath for uint256;

    struct TrancheData {
        uint64 id;
        string name;
        address[] assets;
        uint256 tvl;
        uint256 totalSupplied;
        uint256 totalBorrowed;
        uint256 availableLiquidity;
        bool upgradeable;   // TODO
        uint256 utilization;
        address admin;
        bool whitelist;     // TODO
        string grade;       // TODO
    }

    function getSingleTrancheData(
        uint64 tranche,
        address addressesProvider
    )
        internal
        view
        returns (TrancheData memory trancheData)
    {
        address lendingPool = ILendingPoolAddressesProvider(addressesProvider).getLendingPool();
        address configurator = ILendingPoolAddressesProvider(addressesProvider).getLendingPoolConfigurator();

        (trancheData.assets,
            trancheData.tvl,
            trancheData.totalSupplied,
            trancheData.totalBorrowed,
            trancheData.availableLiquidity,
            trancheData.utilization) = getAssetsSummaryData(tranche, lendingPool);

        trancheData.id = tranche;
        trancheData.admin = ILendingPoolAddressesProvider(addressesProvider).getPoolAdmin(tranche);
        trancheData.name = LendingPoolConfigurator(configurator).trancheNames(tranche);
    }

    function getAssetsSummaryData(uint64 tranche, address lendingPool)
        internal
        view
        returns (
            address[] memory assets,
            uint256 tvl,
            uint256 totalSupplied,
            uint256 totalBorrowed,
            uint256 availableLiquidity,
            uint256 utilization
        )
    {
        assets = ILendingPool(lendingPool).getReservesList(tranche);

        for (uint8 i = 0; i < assets.length; i++) {
            DataTypes.ReserveData memory reserve = ILendingPool(lendingPool).getReserveData(assets[i], tranche);

            tvl += IERC20(assets[i]).balanceOf(reserve.aTokenAddress);
            if (IAToken(reserve.aTokenAddress).getStrategy() != address(0)) {
                // strategy associated, add the balance of strategy to tvl
                tvl += IBaseStrategy(IAToken(reserve.aTokenAddress).getStrategy()).balanceOf();
            }
            totalSupplied += IERC20(reserve.aTokenAddress).totalSupply();
            totalBorrowed += IERC20(reserve.variableDebtTokenAddress).totalSupply();
        }

        availableLiquidity = tvl;
        utilization = totalBorrowed == 0
                ? 0
                : totalBorrowed.rayDiv(availableLiquidity.add(totalBorrowed));
    }
}
