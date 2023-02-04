import { LendingPoolConfigurator } from "../../protocol/lendingpool/LendingPoolConfigurator.sol";
import { DataTypes } from "../../protocol/libraries/types/DataTypes.sol";
import { ReserveConfiguration } from "../../protocol/libraries/configuration/ReserveConfiguration.sol";
import { WadRayMath } from "../../protocol/libraries/math/WadRayMath.sol";
import { SafeMath } from "../../protocol/libraries/math/MathUtils.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { LendingPool } from "../../protocol/lendingpool/LendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { IAToken } from "../../interfaces/IAToken.sol";
import { IERC20 } from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import { IERC20Detailed } from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import { IChainlinkAggregator } from "../../interfaces/IChainlinkAggregator.sol";
import { IPriceOracleGetter } from "../../interfaces/IPriceOracleGetter.sol";
import { QueryAssetHelpers } from "./QueryAssetHelpers.sol";

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
            trancheData.utilization) = getAssetsSummaryData(tranche, addressesProvider);

        trancheData.id = tranche;
        trancheData.admin = ILendingPoolAddressesProvider(addressesProvider).getTrancheAdmin(tranche);
        trancheData.name = "ERROR: NAME STORED IN SUBGRAPH";
        trancheData.whitelist = LendingPool(lendingPool).isUsingWhitelist(tranche);
    }

    function getAssetsSummaryData(uint64 tranche, address addressesProvider)
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
        assets = ILendingPool(
            ILendingPoolAddressesProvider(addressesProvider).getLendingPool()
        ).getReservesList(tranche);

        for (uint8 i = 0; i < assets.length; i++) {

            QueryAssetHelpers.AssetData memory assetData =
                QueryAssetHelpers.getAssetData(assets[i], tranche, addressesProvider);

            tvl += assetData.totalReserves;

            totalSupplied += assetData.totalSupplied;
            totalBorrowed += assetData.totalBorrowed;
        }

        availableLiquidity = tvl;
        utilization = totalBorrowed == 0
                ? 0
                : totalBorrowed.rayDiv(availableLiquidity.add(totalBorrowed));
    }
}
